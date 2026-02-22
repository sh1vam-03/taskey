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

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const VALID_CHAT_MODELS = ["gemini-1.5-flash", "sarvam-30b", "gpt-4o-mini"];

// ─────────────────────────────────────────────────────────────
// MODEL RESOLVERS
// ─────────────────────────────────────────────────────────────

/**
 * Resolves the LLM model for text chat.
 * Defaults to Gemini 1.5 Flash — fastest and cheapest.
 */
const resolveChatModel = (user) => {
    const m = user?.aiChatModel;
    return VALID_CHAT_MODELS.includes(m) ? m : "gemini-1.5-flash";
};

/**
 * Resolves the LLM model for voice pipeline thinking.
 * Defaults to Gemini 1.5 Flash.
 */
const resolveVoiceModel = (user) => {
    const m = user?.aiVoiceModel;
    return VALID_CHAT_MODELS.includes(m) ? m : "gemini-1.5-flash";
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
            `Generate a concise title (max 5 words) for this conversation:\n` +
            `User: ${userMessage.substring(0, 200)}\n` +
            `AI: ${aiResponse.substring(0, 200)}\n` +
            `Title:`;

        let title = "";

        if (chatModel === "gemini-1.5-flash") {
            title = await geminiChat(
                [{ role: "user", content: prompt }],
                { maxTokens: 20 }
            );
        } else if (chatModel === "sarvam-30b") {
            title = await sarvamChat(
                [{ role: "user", content: prompt }],
                { maxTokens: 20 }
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

        title = title.replace(/"/g, "").replace(/^Title:\s*/i, "").trim();

        if (title) {
            await prisma.aiConversation.update({
                where: { id: conversationId },
                data: { title }
            });
        }
    } catch (err) {
        // Non-fatal — title stays as null, user can rename manually
        console.error("[Orchestrator] Failed to generate title:", err.message);
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

    const lcMessages = history.map(msg =>
        msg.role === "USER"
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content)
    );

    // ── 4. Run graph ──────────────────────────────────────────
    const aiResponse = await runAgentGraph({
        userId,
        messages: lcMessages,
        user,
        conversationId,
        chatModel
    });

    // Normalize: Gemini returns Array<{type,text}>, other models return string.
    // finalize.node.js should already have converted to string, but double-check here
    // so we never write array JSON to the DB.
    const aiContentString = normalizeContent(aiResponse.content);

    // ── 5. Save AI response ───────────────────────────────────
    const savedAiMsg = await prisma.aiMessage.create({
        data: { conversationId, userId, role: "ASSISTANT", content: aiContentString }
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

    // ── 3. Load history ───────────────────────────────────────
    const history = await prisma.aiMessage.findMany({
        where: { conversationId, userId },
        orderBy: { createdAt: "asc" },
        take: 20
    });

    const lcMessages = history.map(msg =>
        msg.role === "USER"
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content)
    );

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
        console.error("[Orchestrator Stream] Error:", error.message);
        yield "\n[Error generating response]";
    }

    // ── 5. Post-stream: save + bill ───────────────────────────
    if (fullAiResponse) {
        await prisma.aiMessage.create({
            data: { conversationId, userId, role: "ASSISTANT", content: fullAiResponse }
        });

        const promptTexts = [...history.map(m => m.content), message];
        const totalTokens = estimateChatTokens(
            promptTexts.map(c => ({ content: c })),
            fullAiResponse
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

        await prisma.aiConversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date(), updatedAt: new Date() }
        });

        if (history.length === 1) {
            generateConversationTitle(conversationId, message, fullAiResponse, chatModel);
        }
    }
};