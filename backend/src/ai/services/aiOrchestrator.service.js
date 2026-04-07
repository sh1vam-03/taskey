/**
 * AI Orchestrator Service (Multi-Model, Token-Based Billing)
 *
 * Full lifecycle of every AI request:
 *   1. Billing pre-check (conservative max-cost estimate)
 *   2. Safety validation
 *   3. Conversation history retrieval
 *   4. Route to graph with the user's chosen LLM model
 *   5. Save messages (content normalized to clean string)
 *   6. Deduct EXACT credits based on actual token usage
 *   7. Generate conversation title (on first message)
 *
 * Model resolution:
 *   mode = "TEXT"  → uses user.aiChatModel  (default: "gemini-1.5-flash")
 *   mode = "VOICE" → uses user.aiVoiceModel (default: "gemini-1.5-flash")
 *
 * FIX: Gemini (and other models) can return .content as Array<{type,text}>.
 * All content is now normalized through normalizeContent() before:
 *   - DB writes (prevents "[object Object]" saved as message content)
 *   - Token estimation (prevents counting array element count as char count)
 *   - Title generation (prevents passing array to prompt)
 */

import { HumanMessage, AIMessage } from "@langchain/core/messages";
import prisma from "../../config/db.js";
import { runAgentGraph, streamAgentGraph } from "../graph/main.graph.js";
import { normalizeContent } from "../graph/contentUtils.js";
import {
    checkCreditBalance,
    deductCredits,
    calcChatCost,
    estimateMaxChatCost,
    estimateChatTokens
} from "./aiToken.service.js";
import { validateInputSafety } from "../validators/safety.validator.js";
import { geminiChat } from "./gemini.service.js";
import { sarvamChat } from "./sarvam.service.js";
import ApiError from "../../utils/ApiError.js";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const VALID_CHAT_MODELS = ["gemini-1.5-flash", "sarvam-30b", "gpt-4o-mini"];
const UNAVAILABLE_MODELS = [];

// ─────────────────────────────────────────────────────────────
// MODEL RESOLVERS
// ─────────────────────────────────────────────────────────────

/**
 * Resolves the LLM model for text chat.
 * Enforces plan limits: FREE users can ONLY use sarvam-m text chat.
 */
const resolveChatModel = (user) => {
    if (user?.plan === "FREE") return "sarvam-30b";
    let m = user?.aiChatModel;
    if (m && UNAVAILABLE_MODELS.includes(m)) {
        throw new ApiError(503, "This model is currently not available. Please use a different model.");
    }
    return VALID_CHAT_MODELS.includes(m) ? m : "sarvam-30b";
};

/**
 * Resolves the LLM model for voice pipeline thinking.
 * Voice is conceptually PRO_PLUS only, but as a fallback, enforces plan limits.
 */
const resolveVoiceModel = (user) => {
    if (user?.plan !== "PRO_PLUS") return "sarvam-30b";
    let m = user?.aiVoiceModel;
    if (m && UNAVAILABLE_MODELS.includes(m)) {
        throw new ApiError(503, "This model is currently not available. Please use a different model.");
    }
    return VALID_CHAT_MODELS.includes(m) ? m : "sarvam-30b";
};

// ─────────────────────────────────────────────────────────────
// TITLE GENERATION (fire-and-forget)
// ─────────────────────────────────────────────────────────────

/**
 * Generates a short conversation title using the user's current LLM.
 * Called on the first message of a conversation only.
 * Never throws — all errors are caught and logged.
 *
 * @param {string} conversationId
 * @param {string} userMessage
 * @param {string} aiResponse    - Already normalized to plain string
 * @param {string} chatModel
 */
const generateConversationTitle = async (conversationId, userMessage, aiResponse, chatModel) => {
    try {
        const prompt =
            `Generate a concise title (max 5 words) for this conversation. ` +
            `Reply with ONLY the title, no prefix, no quotes, no formatting.\n` +
            `User: ${userMessage.substring(0, 200)}\n` +
            `AI: ${aiResponse.substring(0, 200)}`;

        let title = "";

        if (chatModel === "gemini-1.5-flash") {
            title = await geminiChat(
                [{ role: "user", content: prompt }],
                { maxTokens: 20 }
            );
        } else if (chatModel === "sarvam-30b") {
            title = await sarvamChat(
                [{ role: "user", content: prompt }],
                { maxTokens: 20, model: chatModel }
            );
        } else {
            // gpt-4o-mini — static import cached by Node after first call
            const { ChatOpenAI } = await import("@langchain/openai");
            const { HumanMessage: HMsg } = await import("@langchain/core/messages");
            const titleModel = new ChatOpenAI({
                model: "gpt-4o-mini",
                temperature: 0.5,
                apiKey: process.env.OPENAI_API_KEY,
                maxRetries: 1
            });
            const response = await titleModel.invoke([new HMsg(prompt)]);
            title = normalizeContent(response.content);
        }

        // Clean up: strip markdown bold, quotes, and any "Title:" prefix variations
        title = title
            .replace(/\*+/g, "")                    // Remove all asterisks (bold, italic)
            .replace(/"/g, "")                       // Remove quotes
            .replace(/^title\s*:\s*/i, "")           // Remove "Title:" or "title :" prefix
            .replace(/^#+\s*/, "")                   // Remove markdown headings
            .trim();

        if (title) {
            const cleanTitle = title.substring(0, 100);
            await prisma.aiConversation.update({
                where: { id: conversationId },
                data: { title: cleanTitle }
            });
            return cleanTitle;
        }
        return null;
    } catch (err) {
        // Non-fatal — title stays as null, user can rename manually
        console.error("[Orchestrator] Failed to generate title:", err.message);
        return null;
    }
};

// ─────────────────────────────────────────────────────────────
// processAiRequest — Non-streaming
// ─────────────────────────────────────────────────────────────

/**
 * Runs the full AI request lifecycle (non-streaming).
 * Bills based on actual token usage after the response is received.
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.conversationId
 * @param {string} params.message
 * @param {string} params.mode  - "TEXT" | "VOICE"
 * @returns {Promise<Object>} Saved AI message (Prisma AiMessage record)
 */
export const processAiRequest = async ({ userId, conversationId, message, mode = "TEXT" }) => {
    // ── 0. Fetch user ────────────────────────────────────────
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    // ── 0.1 Resolve LLM model ─────────────────────────────────
    const chatModel = mode === "VOICE" ? resolveVoiceModel(user) : resolveChatModel(user);

    // ── 0.2 Pre-flight credit check ───────────────────────────
    await checkCreditBalance(userId, estimateMaxChatCost(chatModel));

    // ── 0.3 Safety check ─────────────────────────────────────
    if (!validateInputSafety(message)) {
        throw new Error("Unsafe input detected. Request blocked.");
    }

    // ── 1. Verify conversation ownership ──────────────────────
    const conversation = await prisma.aiConversation.findFirst({
        where: { id: conversationId, userId }
    });
    if (!conversation) throw new Error("Conversation not found");

    // ── 2. Save user message ──────────────────────────────────
    await prisma.aiMessage.create({
        data: { conversationId, userId, role: "USER", content: message }
    });

    // ── 3. Load history (last 20 messages, oldest first) ──────
    const history = await prisma.aiMessage.findMany({
        where: { conversationId, userId },
        orderBy: { createdAt: "asc" },
        take: 20
    });

    const lcMessages = [];
    let expectedRole = "USER";

    for (const msg of history) {
        if (msg.role !== "USER" && msg.role !== "ASSISTANT") continue; // Ignore SYSTEM and memory markers

        if (lcMessages.length === 0) {
            if (msg.role !== "USER") continue; // Must start with USER
            lcMessages.push(new HumanMessage(msg.content));
            expectedRole = "ASSISTANT";
        } else {
            if (msg.role === "USER") {
                if (expectedRole === "USER") {
                    lcMessages.push(new HumanMessage(msg.content));
                    expectedRole = "ASSISTANT";
                } else {
                    lcMessages[lcMessages.length - 1].content += `\n\n${msg.content}`;
                }
            } else if (msg.role === "ASSISTANT") {
                if (expectedRole === "ASSISTANT") {
                    lcMessages.push(new AIMessage(msg.content));
                    expectedRole = "USER";
                } else {
                    lcMessages[lcMessages.length - 1].content += `\n\n${msg.content}`;
                }
            }
        }
    }

    // ── 4. Run graph ──────────────────────────────────────────
    let aiResponse;
    try {
        aiResponse = await runAgentGraph({
            userId,
            messages: lcMessages,
            user,
            conversationId,
            chatModel
        });
    } catch (graphErr) {
        // Re-throw credit and availability errors as-is
        if (graphErr.statusCode === 402 || graphErr.statusCode === 503) throw graphErr;
        console.error("[Orchestrator] Graph execution error:", graphErr.message);
        throw new ApiError(500, "Internal server error. Please try again or use a different AI model.");
    }

    // Normalize: Gemini returns Array<{type,text}>, other models return string.
    // finalize.node.js should already have converted to string, but double-check here
    // so we never write array JSON to the DB.
    const aiContentString = normalizeContent(aiResponse.content);

    // ── 5. Save AI response ───────────────────────────────────
    const savedAiMsg = await prisma.aiMessage.create({
        data: { conversationId, userId, role: "ASSISTANT", content: aiContentString, model: chatModel }
    });

    // ── 6. Bill exact credits based on actual tokens ──────────
    const promptTexts = [...history.map(m => m.content), message];
    const totalTokens = estimateChatTokens(
        promptTexts.map(c => ({ content: c })),
        aiContentString
    );
    const creditsUsed = calcChatCost(chatModel, totalTokens);

    await deductCredits({
        userId,
        conversationId,
        credits: creditsUsed,
        model: chatModel,
        type: mode === "VOICE" ? "VOICE" : "CHAT",
        provider: chatModel,
        meta: { estimatedTokens: totalTokens }
    });

    // ── 7. Update conversation timestamp ──────────────────────
    await prisma.aiConversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date(), updatedAt: new Date() }
    });

    // ── 8. Generate title on first user message ───────────────
    // history.length === 1 → only the message we just saved exists → first turn
    if (history.length === 1) {
        generateConversationTitle(conversationId, message, aiContentString, chatModel);
    }

    return savedAiMsg;
};

// ─────────────────────────────────────────────────────────────
// processAiRequestStream — Streaming
// ─────────────────────────────────────────────────────────────

/**
 * Streaming AI request lifecycle.
 * Tokens are accumulated while streaming; billing runs after stream completes.
 *
 * Usage:
 *   for await (const chunk of processAiRequestStream(...)) { res.write(chunk); }
 */
export const processAiRequestStream = async function* ({
    userId,
    conversationId,
    message,
    mode = "TEXT"
}) {
    // ── 0. Fetch user ────────────────────────────────────────
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const chatModel = mode === "VOICE" ? resolveVoiceModel(user) : resolveChatModel(user);

    // ── 0.1 Pre-check ────────────────────────────────────────
    await checkCreditBalance(userId, estimateMaxChatCost(chatModel));

    // ── 0.2 Safety check ─────────────────────────────────────
    if (!validateInputSafety(message)) {
        throw new Error("Unsafe input detected. Request blocked.");
    }

    // ── 1. Verify conversation ────────────────────────────────
    const conversation = await prisma.aiConversation.findFirst({
        where: { id: conversationId, userId }
    });
    if (!conversation) throw new Error("Conversation not found");

    // ── 2. Save user message ──────────────────────────────────
    await prisma.aiMessage.create({
        data: { conversationId, userId, role: "USER", content: message }
    });

    // ── 3. Load history (Rolling Window) ─────────────────────
    // Sarvam API has strict payload limits and will drop with `400 (no body)` if the history array exceeds ~10 turns.
    // Limit to the most recent 6 messages (3 human, 3 AI) to maintain context without crashing.
    const history = await prisma.aiMessage.findMany({
        where: { conversationId, userId },
        orderBy: { createdAt: "desc" },
        take: 6
    });

    // Reverse history to chronolotical order for the LLM
    history.reverse();

    const lcMessages = [];
    let expectedRole = "USER";

    for (const msg of history) {
        // STRICT RULE for Sarvam: Only 1 System Message is allowed (the root one we inject in intent.node.js).
        // Therefore, we MUST ignore all "SYSTEM" roles pulled from the database history (e.g. memory summaries).
        if (msg.role !== "USER" && msg.role !== "ASSISTANT") continue;

        if (lcMessages.length === 0) {
            // Sarvam API strictly requires the conversation to start with a USER message following the SYSTEM message.
            if (msg.role !== "USER") continue;
            lcMessages.push(new HumanMessage(msg.content));
            expectedRole = "ASSISTANT";
        } else {
            if (msg.role === "USER") {
                if (expectedRole === "USER") {
                    lcMessages.push(new HumanMessage(msg.content));
                    expectedRole = "ASSISTANT";
                } else {
                    lcMessages[lcMessages.length - 1].content += `\n\n${msg.content}`;
                }
            } else if (msg.role === "ASSISTANT") {
                if (expectedRole === "ASSISTANT") {
                    lcMessages.push(new AIMessage(msg.content));
                    expectedRole = "USER";
                } else {
                    lcMessages[lcMessages.length - 1].content += `\n\n${msg.content}`;
                }
            }
        }
    }

    // ── 4. Stream ─────────────────────────────────────────────
    let fullAiResponse = "";

    try {
        for await (const token of streamAgentGraph({
            userId,
            messages: lcMessages,
            user,
            conversationId,
            chatModel
        })) {
            // Each token is already a string from streamAgentGraph
            const tokenStr = typeof token === "string" ? token : normalizeContent(token);
            fullAiResponse += tokenStr;
            yield tokenStr;
        }
    } catch (error) {
        console.error("[Orchestrator Stream] Error:", error.stack || error.message);
        // Re-throw classified errors as-is (402 credits, 503 model unavailable)
        if (error.statusCode === 402 || error.statusCode === 503) throw error;
        // Sanitize all other errors into a generic 500
        throw new ApiError(500, "Internal server error. Please try again or use a different AI model.");
    }

    // ── 5. Post-stream: save + bill ───────────────────────────
    if (fullAiResponse) {
        await prisma.aiMessage.create({
            data: { conversationId, userId, role: "ASSISTANT", content: fullAiResponse, model: chatModel }
        });

        const promptTexts = [...history.map(m => m.content), message];
        const totalTokens = estimateChatTokens(
            promptTexts.map(c => ({ content: c })),
            fullAiResponse
        );
        const creditsUsed = calcChatCost(chatModel, totalTokens);

        try {
            await deductCredits({
                userId,
                conversationId,
                credits: creditsUsed,
                model: chatModel,
                type: mode === "VOICE" ? "VOICE" : "CHAT",
                provider: chatModel,
                meta: { estimatedTokens: totalTokens }
            });
        } catch (billingErr) {
            console.warn(`[Orchestrator] Post-stream billing failed for user ${userId}:`, billingErr.message);
            if (billingErr.statusCode === 402) {
                yield `__warning__:402`;
            }
        }

        await prisma.aiConversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date(), updatedAt: new Date() }
        });

        if (history.length === 1) {
            const title = await generateConversationTitle(conversationId, message, fullAiResponse, chatModel);
            if (title) yield `__title__:${title}`;
        }
    }
};