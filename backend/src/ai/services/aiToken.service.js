/**
 * AI Token / Credits Service (Multi-Provider, Tiered Pricing)
 *
 * Billing model:
 *
 * CHAT:
 *   credits = base + ceil(totalTokens / 1000) * per_1000_tokens
 *   capped at max_per_call
 *   totalTokens = estimated prompt tokens + completion tokens
 *
 * VOICE (STT & TTS):
 *   credits = ceil(durationMinutes) * per_minute
 *   minimum duration = 0.1 min (6 seconds) → always costs ≥ per_minute
 *
 * TOOL:
 *   credits = per_request
 */

import prisma from "../../config/db.js";
import { AI_COSTS } from "../../config/plans.config.js";
import ApiError from "../../utils/ApiError.js";

// ─────────────────────────────────────────────────────────────
// COST CALCULATORS
// ─────────────────────────────────────────────────────────────

/**
 * Calculates the credit cost for a CHAT request.
 *
 * @param {string} model        - e.g. "gpt-4o-mini", "sarvam-m"
 * @param {number} totalTokens  - estimated prompt + completion tokens
 * @returns {number} Credits to deduct (integer, minimum 1)
 */
export const calcChatCost = (model, totalTokens = 0) => {
    const config = AI_COSTS.CHAT?.[model];
    if (!config) {
        console.warn(`[AI Cost] Unknown chat model "${model}" — defaulting to 10 credits`);
        return 10;
    }

    const tokenBlocks = Math.ceil(Math.max(0, totalTokens) / 1000);
    const raw = config.base + tokenBlocks * config.per_1000_tokens;
    const capped = Math.min(raw, config.max_per_call);
    return Math.max(1, Math.ceil(capped));
};

/**
 * Calculates the credit cost for a VOICE request (STT or TTS).
 *
 * @param {string} model            - e.g. "whisper-1", "saaras:v3", "tts-1", "bulbul:v3"
 * @param {number} durationMinutes  - Audio duration in minutes (float)
 * @returns {number} Credits to deduct (integer, minimum 1)
 */
export const calcVoiceCost = (model, durationMinutes = 0.1) => {
    const config = AI_COSTS.VOICE?.[model];
    if (!config) {
        console.warn(`[AI Cost] Unknown voice model "${model}" — defaulting to 10 credits`);
        return 10;
    }

    const minutes = Math.max(0.1, durationMinutes); // minimum 6 seconds
    const raw = Math.ceil(minutes) * config.per_minute; // "ceil" rounding per spec
    return Math.max(1, Math.ceil(raw));
};

/**
 * Calculates the credit cost for a TOOL call.
 *
 * @param {string} toolName  - e.g. "tavily"
 * @returns {number} Credits to deduct (integer, minimum 1)
 */
export const calcToolCost = (toolName) => {
    const config = AI_COSTS.TOOL?.[toolName];
    if (!config) {
        console.warn(`[AI Cost] Unknown tool "${toolName}" — defaulting to 10 credits`);
        return 10;
    }
    return Math.max(1, config.per_request);
};

/**
 * Pre-flight cost estimate for a chat request.
 * Used for the billing pre-check BEFORE the actual API call.
 * Assumes a conservative token count (up to max_per_call).
 *
 * @param {string} model
 * @returns {number} Estimated max credits for this model
 */
export const estimateMaxChatCost = (model) => {
    const config = AI_COSTS.CHAT?.[model];
    if (!config) return 10;
    return Math.max(1, config.max_per_call);
};

// ─────────────────────────────────────────────────────────────
// TOKEN ESTIMATION
// ─────────────────────────────────────────────────────────────

/**
 * Rough token estimation: 4 characters ≈ 1 token.
 * Used when the API doesn't return a token count.
 *
 * @param {string} text
 * @returns {number} Estimated token count
 */
export const countTokens = (text) => {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
};

/**
 * Estimates total tokens for a chat exchange.
 * Combines all message content (prompt) + AI response.
 *
 * @param {Array<{content: string}>} messages - Full message history sent to LLM
 * @param {string} responseText               - AI reply text
 * @returns {number} Estimated total tokens
 */
export const estimateChatTokens = (messages = [], responseText = "") => {
    const promptText = messages.map((m) => m.content || "").join(" ");
    return countTokens(promptText) + countTokens(responseText);
};

// ─────────────────────────────────────────────────────────────
// 1. CREDIT BALANCE CHECK
// ─────────────────────────────────────────────────────────────

/**
 * Throws HTTP 402 if user's AI credit balance is below the required minimum.
 *
 * @param {string} userId
 * @param {number} minCredits  - Minimum credits required (default: 5)
 */
export const checkCreditBalance = async (userId, minCredits = 5) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { aiCreditBalance: true },
    });

    if (!user) throw new ApiError(404, "User not found");

    if (user.aiCreditBalance < minCredits) {
        throw new ApiError(
            402,
            "Insufficient AI credits. Please upgrade your plan or top-up your balance."
        );
    }
};

// ─────────────────────────────────────────────────────────────
// 2. CREDIT DEDUCTION (atomic with full audit trail)
// ─────────────────────────────────────────────────────────────

/**
 * Atomically deducts credits and writes the full audit trail:
 *   - User.aiCreditBalance   (decremented)
 *   - AiUsage log            (model, type, credits, metadata)
 *   - AiCreditLedger entry   (financial record)
 *   - AiConversation total   (aggregate, if conversationId provided)
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {string|null} params.conversationId
 * @param {number} params.credits         - Exact amount to deduct (pre-calculated)
 * @param {string} params.source          - Ledger source tag (default: "AI_USAGE")
 * @param {string} params.model           - Model used (for audit log)
 * @param {string} params.type            - "CHAT" | "VOICE" | "TOOL"
 * @param {string} params.provider        - "openai" | "sarvam"
 * @param {Object} params.meta            - Extra billing metadata (tokens, duration, etc.)
 */
export const deductCredits = async ({
    userId,
    conversationId,
    credits,
    source = "AI_USAGE",
    model,
    type,
    provider = "openai",
    meta = {},
}) => {
    const amount = Math.max(1, Math.ceil(credits));

    return prisma.$transaction(async (tx) => {
        // 1. Decrement user balance
        await tx.user.update({
            where: { id: userId },
            data: { aiCreditBalance: { decrement: amount } },
        });

        // 2. Granular usage log
        await tx.aiUsage.create({
            data: {
                userId,
                conversationId,
                model: model || "unknown",
                type: type || "CHAT",
                creditsUsed: amount,
                // If your AiUsage schema has a JSON metadata column, uncomment:
                // metadata: { provider, ...meta },
            },
        });

        // 3. Financial ledger (immutable record)
        await tx.aiCreditLedger.create({
            data: {
                userId,
                credits: -amount,
                source,
                conversationId,
            },
        });

        // 4. Conversation aggregate (optional but useful for analytics)
        if (conversationId) {
            await tx.aiConversation.update({
                where: { id: conversationId },
                data: { totalCreditsUsed: { increment: amount } },
            });
        }
    });
};