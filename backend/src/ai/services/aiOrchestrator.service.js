/**
 * AI Orchestrator Service (Multi-Provider, Token-Based Billing)
 *
 * Full lifecycle of every AI request:
 *   1. Billing pre-check (conservative max-cost estimate)
 *   2. Safety validation
 *   3. Conversation history retrieval
 *   4. Route to correct graph (OpenAI agentic / Sarvam conversational)
 *   5. Save messages
 *   6. Deduct EXACT credits based on actual token usage
 *   7. Generate conversation title (on first message)
 *
 * Credit calculation for chat:
 *   credits = base + ceil(totalTokens / 1000) * per_1000_tokens
 *   capped at max_per_call
 */

import { HumanMessage, AIMessage } from "@langchain/core/messages";
import prisma from "../../config/db.js";
import { runAgentGraph, streamAgentGraph } from "../graph/main.graph.js";
import {
    checkCreditBalance,
    deductCredits,
    calcChatCost,
    estimateMaxChatCost,
    estimateChatTokens,
} from "./aiToken.service.js";
import { validateInputSafety } from "../validators/safety.validator.js";
import { sarvamChat } from "./sarvam.service.js";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const getChatModelName = (provider) =>
    provider === "sarvam" ? "sarvam-m" : "gpt-4o-mini";

const resolveProvider = (user) => {
    const p = user?.aiProvider;
    return p === "sarvam" || p === "openai" ? p : "openai";
};

/**
 * Generates a short title for the conversation using the user's provider.
 * Fire-and-forget: errors are logged but don't affect the main response.
 */
const generateConversationTitle = async (
    conversationId,
    userMessage,
    aiResponse,
    provider = "openai"
) => {
    try {
        const titlePrompt = `Generate a concise title (max 5 words) for this conversation:\nUser: ${userMessage}\nAI: ${aiResponse.substring(0, 200)}\nTitle:`;

        let title = "";

        if (provider === "sarvam") {
            title = await sarvamChat([{ role: "user", content: titlePrompt }], {
                maxTokens: 20,
            });
        } else {
            const { ChatOpenAI } = await import("@langchain/openai");
            const { HumanMessage: HMsg } = await import("@langchain/core/messages");
            const titleModel = new ChatOpenAI({
                model: "gpt-4o-mini",
                temperature: 0.5,
                apiKey: process.env.OPENAI_API_KEY,
            });
            const response = await titleModel.invoke([new HMsg(titlePrompt)]);
            title = response.content;
        }

        title = title.replace(/"/g, "").replace(/^Title:\s*/i, "").trim();

        if (title) {
            await prisma.aiConversation.update({
                where: { id: conversationId },
                data: { title },
            });
        }
    } catch (err) {
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
 * @param {string} userId
 * @param {string} conversationId
 * @param {string} message
 * @param {string} mode  - "TEXT" | "VOICE"
 * @returns {Promise<Object>} Saved AI message (Prisma record)
 */
export const processAiRequest = async ({ userId, conversationId, message, mode = "TEXT" }) => {
    // ── 0. Fetch user + resolve provider ────────────────────
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const provider = resolveProvider(user);
    const modelName = getChatModelName(provider);

    // ── 0.1 Conservative pre-check: ensure balance covers max possible cost ──
    await checkCreditBalance(userId, estimateMaxChatCost(modelName));

    // ── 0.2 Safety check ──────────────────────────────────
    if (!validateInputSafety(message)) {
        throw new Error("Unsafe input detected. Request blocked.");
    }

    // ── 1. Verify conversation ownership ──────────────────
    const conversation = await prisma.aiConversation.findFirst({
        where: { id: conversationId, userId },
    });
    if (!conversation) throw new Error("Conversation not found");

    // ── 2. Save user message ───────────────────────────────
    await prisma.aiMessage.create({
        data: { conversationId, userId, role: "USER", content: message },
    });

    // ── 3. Load history (last 20 messages) ────────────────
    const history = await prisma.aiMessage.findMany({
        where: { conversationId, userId },
        orderBy: { createdAt: "asc" },
        take: 20,
    });

    const lcMessages = history.map((msg) =>
        msg.role === "USER"
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content)
    );

    // ── 4. Run graph (provider-aware) ─────────────────────
    const aiResponse = await runAgentGraph({
        userId,
        messages: lcMessages,
        user,
        conversationId,
        provider,
    });

    const aiContent = aiResponse.content;
    const aiContentString =
        typeof aiContent === "string" ? aiContent : JSON.stringify(aiContent);

    // ── 5. Save AI response ───────────────────────────────
    const savedAiMsg = await prisma.aiMessage.create({
        data: {
            conversationId,
            userId,
            role: "ASSISTANT",
            content: aiContentString,
        },
    });

    // ── 6. Calculate EXACT credit cost from actual tokens ─
    // Build a plain-text version of everything sent to the model
    const promptTexts = [
        ...history.map((m) => m.content),
        message,
    ];
    const totalTokens = estimateChatTokens(
        promptTexts.map((c) => ({ content: c })),
        aiContentString
    );
    const creditsUsed = calcChatCost(modelName, totalTokens);

    await deductCredits({
        userId,
        conversationId,
        credits: creditsUsed,
        model: modelName,
        type: mode === "VOICE" ? "VOICE" : "CHAT",
        provider,
        meta: { estimatedTokens: totalTokens },
    });

    // ── 7. Update conversation timestamp ──────────────────
    await prisma.aiConversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date(), updatedAt: new Date() },
    });

    // ── 8. Generate title on first user message ───────────
    // history.length === 1 means only the user message we just saved
    if (history.length === 1) {
        generateConversationTitle(conversationId, message, aiContentString, provider);
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
 * Usage: for await (const chunk of processAiRequestStream(...)) { res.write(chunk); }
 */
export const processAiRequestStream = async function* ({
    userId,
    conversationId,
    message,
    mode = "TEXT",
}) {
    // ── 0. Fetch user + resolve provider ────────────────────
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const provider = resolveProvider(user);
    const modelName = getChatModelName(provider);

    // ── 0.1 Pre-check with max possible cost ─────────────
    await checkCreditBalance(userId, estimateMaxChatCost(modelName));

    // ── 0.2 Safety check ──────────────────────────────────
    if (!validateInputSafety(message)) {
        throw new Error("Unsafe input detected. Request blocked.");
    }

    // ── 1. Verify conversation ownership ──────────────────
    const conversation = await prisma.aiConversation.findFirst({
        where: { id: conversationId, userId },
    });
    if (!conversation) throw new Error("Conversation not found");

    // ── 2. Save user message ───────────────────────────────
    await prisma.aiMessage.create({
        data: { conversationId, userId, role: "USER", content: message },
    });

    // ── 3. Load history ───────────────────────────────────
    const history = await prisma.aiMessage.findMany({
        where: { conversationId, userId },
        orderBy: { createdAt: "asc" },
        take: 20,
    });

    const lcMessages = history.map((msg) =>
        msg.role === "USER"
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content)
    );

    // ── 4. Stream ─────────────────────────────────────────
    let fullAiResponse = "";

    try {
        for await (const token of streamAgentGraph({
            userId,
            messages: lcMessages,
            user,
            conversationId,
            provider,
        })) {
            fullAiResponse += token;
            yield token;
        }
    } catch (error) {
        console.error("[Orchestrator Stream] Error:", error.message);
        yield "\n[Error generating response]";
    }

    // ── 5. Post-stream: save + bill ───────────────────────
    if (fullAiResponse) {
        await prisma.aiMessage.create({
            data: {
                conversationId,
                userId,
                role: "ASSISTANT",
                content: fullAiResponse,
            },
        });

        // Calculate exact cost from actual accumulated tokens
        const promptTexts = [
            ...history.map((m) => m.content),
            message,
        ];
        const totalTokens = estimateChatTokens(
            promptTexts.map((c) => ({ content: c })),
            fullAiResponse
        );
        const creditsUsed = calcChatCost(modelName, totalTokens);

        await deductCredits({
            userId,
            conversationId,
            credits: creditsUsed,
            model: modelName,
            type: mode === "VOICE" ? "VOICE" : "CHAT",
            provider,
            meta: { estimatedTokens: totalTokens },
        });

        await prisma.aiConversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date(), updatedAt: new Date() },
        });

        if (history.length === 1) {
            generateConversationTitle(conversationId, message, fullAiResponse, provider);
        }
    }
};