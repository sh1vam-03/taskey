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
 *
 * FIX: estimateChatTokens now normalizes content before measuring length.
 * Previously, array content from Gemini would produce "[object Object]"
 * in the joined string, giving wrong (under-counted) token estimates.
 */

import prisma from "../../config/db.js";
import { AI_COSTS } from "../../config/plans.config.js";
import ApiError from "../../utils/ApiError.js";

// ─────────────────────────────────────────────────────────────
// CONTENT NORMALIZER (inline — avoids circular imports)
// ─────────────────────────────────────────────────────────────

/**
 * Converts any LangChain message content to a plain string.
 * Handles: string | Array<{type,text}> | null | undefined
 */
const normalizeContent = (content) => {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content.map(p => (typeof p === "string" ? p : p?.text || "")).filter(Boolean).join("");
    }
    return "";
};

// ─────────────────────────────────────────────────────────────
// COST CALCULATORS
// ─────────────────────────────────────────────────────────────

/**
 * Calculates the credit cost for a CHAT request.
 *
 * @param {string} model       - e.g. "gemini-2.0-flash", "sarvam-30b", "gpt-4o-mini"
 * @param {number} totalTokens - estimated prompt + completion tokens
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
 * @param {string} model           - e.g. "whisper-1", "saaras:v3", "tts-1", "bulbul:v3"
 * @param {number} durationMinutes - Audio duration in minutes (float)
 * @returns {number} Credits to deduct (integer, minimum 1)
 */
export const calcVoiceCost = (model, durationMinutes = 0.1) => {
    const config = AI_COSTS.VOICE?.[model];
    if (!config) {
        console.warn(`[AI Cost] Unknown voice model "${model}" — defaulting to 10 credits`);
        return 10;
    }
    const minutes = Math.max(0.1, durationMinutes); // minimum 6 seconds
    const raw = Math.ceil(minutes) * config.per_minute;
    return Math.max(1, Math.ceil(raw));
};

/**
 * Calculates the credit cost for a TOOL call.
 *
 * @param {string} toolName - e.g. "tavily"
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
 * Conservative pre-flight estimate for a chat request.
 * Used to check balance BEFORE the actual API call.
 *
 * @param {string} model
 * @returns {number} Worst-case credits for this model (= max_per_call)
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
 * Rough token estimate: 4 characters ≈ 1 token.
 *
 * @param {string} text
 * @returns {number}
 */
export const countTokens = (text) => {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
};

/**
 * Estimates total tokens for a chat exchange.
 * Combines all message content (prompt history) + AI response.
 *
 * FIX: content fields are normalized to string before measurement.
 * Previously, Gemini array content produced "[object Object]" in the
 * concatenated text, causing badly under-counted token estimates.
 *
 * @param {Array<{content: string|Array|null}>} messages - Message history
 * @param {string} responseText                          - AI reply (already normalized string)
 * @returns {number} Estimated total tokens
 */
export const estimateChatTokens = (messages = [], responseText = "") => {
    const promptText = messages
        .map(m => normalizeContent(m.content))
        .join(" ");
    return countTokens(promptText) + countTokens(responseText);
};

// ─────────────────────────────────────────────────────────────
// CREDIT BALANCE CHECK
// ─────────────────────────────────────────────────────────────

/**
 * Throws HTTP 402 if user's combined AI credit balance is below the required minimum.
 * Combined balance = subscriptionCredits + topupCredits
 *
 * @param {string} userId
 * @param {number} minCredits - Minimum credits required (default: 5)
 */
export const checkCreditBalance = async (userId, minCredits = 5) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionCredits: true, topupCredits: true }
    });

    if (!user) throw new ApiError(404, "User not found");

    const totalBalance = user.subscriptionCredits + user.topupCredits;

    if (totalBalance < minCredits) {
        throw new ApiError(
            402,
            "Insufficient AI credits. Please upgrade your plan or top-up your balance."
        );
    }
};

// ─────────────────────────────────────────────────────────────
// CREDIT DEDUCTION (atomic, full audit trail, priority order)
// ─────────────────────────────────────────────────────────────

/**
 * Atomically deducts credits with PRIORITY ORDER:
 *   1. subscriptionCredits first  (they expire)
 *   2. topupCredits second        (they never expire)
 *
 * Also writes the full audit trail:
 *   - User balances               (decremented with priority)
 *   - AiUsage log                 (model, type, credits)
 *   - AiCreditLedger entry        (immutable financial record)
 *   - AiConversation total        (aggregate, if conversationId provided)
 *
 * @param {Object} params
 * @param {string}      params.userId
 * @param {string|null} params.conversationId
 * @param {number}      params.credits         - Pre-calculated amount to deduct
 * @param {string}      params.source          - Ledger source tag (default: "AI_USAGE")
 * @param {string}      params.model           - Model used
 * @param {string}      params.type            - "CHAT" | "VOICE" | "TOOL"
 * @param {string}      params.provider        - Model ID (audit trail)
 * @param {Object}      params.meta            - Extra billing metadata
 */
export const deductCredits = async ({
    userId,
    conversationId,
    credits,
    source = "AI_USAGE",
    model,
    type,
    provider = "unknown",
    meta = {}
}) => {
    const amount = Math.max(1, Math.ceil(credits));

    return prisma.$transaction(async (tx) => {
        // 1. Fetch current balances
        const user = await tx.user.findUnique({
            where: { id: userId },
            select: { subscriptionCredits: true, topupCredits: true }
        });

        if (!user) throw new ApiError(404, "User not found");

        // 2. Priority deduction: subscription first, then topup
        let fromSubscription = 0;
        let fromTopup = 0;

        if (user.subscriptionCredits >= amount) {
            // Subscription covers the full cost
            fromSubscription = amount;
        } else {
            // Subscription covers partial, topup covers the rest
            fromSubscription = user.subscriptionCredits;
            fromTopup = amount - fromSubscription;
        }

        // 3. Apply deductions
        const updateData = {};
        if (fromSubscription > 0) {
            updateData.subscriptionCredits = { decrement: fromSubscription };
        }
        if (fromTopup > 0) {
            updateData.topupCredits = { decrement: fromTopup };
        }

        await tx.user.update({
            where: { id: userId },
            data: updateData
        });

        // 4. Granular usage log
        await tx.aiUsage.create({
            data: {
                userId,
                conversationId,
                model: model || "unknown",
                type: type || "CHAT",
                creditsUsed: amount
            }
        });

        // 5. Financial ledger (immutable)
        await tx.aiCreditLedger.create({
            data: {
                userId,
                credits: -amount,
                source,
                conversationId,
                reason: `Deducted: ${fromSubscription} subscription + ${fromTopup} topup`
            }
        });

        // 6. Conversation aggregate
        if (conversationId) {
            await tx.aiConversation.update({
                where: { id: conversationId },
                data: { totalCreditsUsed: { increment: amount } }
            });
        }
    });
};