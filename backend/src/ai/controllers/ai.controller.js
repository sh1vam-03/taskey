import asyncHandler from "../../utils/asyncHandler.js";
import prisma from "../../config/db.js"; // Correct path to prisma
import { runAgentGraph } from "../graph/main.graph.js";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

/**
 * POST /api/ai/conversations
 * Create a new conversation
 */
export const createConversation = asyncHandler(async (req, res) => {
    const { title, type } = req.body;
    const conversation = await prisma.aiConversation.create({
        data: {
            userId: req.user.id,
            title: title || "New Chat",
            type: type || "GENERAL"
        }
    });

    res.status(201).json({ success: true, data: conversation });
});

/**
 * GET /api/ai/conversations
 */
export const getConversations = asyncHandler(async (req, res) => {
    const conversations = await prisma.aiConversation.findMany({
        where: { userId: req.user.id, isArchived: false },
        orderBy: { updatedAt: 'desc' }
    });
    res.json({ success: true, data: conversations });
});

/**
 * GET /api/ai/conversations/:id
 */
export const getConversation = asyncHandler(async (req, res) => {
    const conversation = await prisma.aiConversation.findFirst({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!conversation) throw new Error("Conversation not found");

    res.json({ success: true, data: conversation });
});

/**
 * DELETE /api/ai/conversations/:id
 */
export const deleteConversation = asyncHandler(async (req, res) => {
    await prisma.aiConversation.delete({
        where: { id: req.params.id, userId: req.user.id }
    });
    res.json({ success: true, message: "Deleted" });
});

/**
 * GET /api/ai/conversations/:id/messages
 */
export const getMessages = asyncHandler(async (req, res) => {
    const messages = await prisma.aiMessage.findMany({
        where: { conversationId: req.params.id, userId: req.user.id },
        orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, data: messages });
});

/**
 * POST /api/ai/conversations/:id/message
 * Send message and trigger agent
 */
// Imports
import { validateInputSafety } from "../validators/safety.validator.js";
import { countTokens, trackTokenUsage } from "../services/aiToken.service.js";

// ...

export const sendMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user;

    // 0. Safety Check
    if (!validateInputSafety(content)) {
        res.status(400);
        throw new Error("Unsafe input detected. Request blocked.");
    }

    // 1. Verify ownership
    const conversation = await prisma.aiConversation.findFirst({
        where: { id, userId: user.id }
    });
    if (!conversation) throw new Error("Conversation not found");

    // 2. Save User Message
    await prisma.aiMessage.create({
        data: {
            conversationId: id,
            userId: user.id,
            role: "USER",
            content
        }
    });

    // 3. Load History
    const history = await prisma.aiMessage.findMany({
        where: { conversationId: id, userId: user.id },
        orderBy: { createdAt: 'asc' },
        take: 20
    });

    const lcMessages = history.map(msg =>
        msg.role === 'USER' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    );

    // 4. Run LangGraph Agent
    const aiResponse = await runAgentGraph({
        userId: user.id,
        messages: lcMessages,
        user,
        conversationId: id // Pass ID for memory persistence
    });

    const aiContent = aiResponse.content;
    const aiContentString = typeof aiContent === 'string' ? aiContent : JSON.stringify(aiContent);

    // 5. Save AI Response
    const savedAiMsg = await prisma.aiMessage.create({
        data: {
            conversationId: id,
            userId: user.id,
            role: "ASSISTANT",
            content: aiContentString
        }
    });

    // 6. Token Accounting
    const inputTokens = countTokens(content);
    const outputTokens = countTokens(aiContentString);
    const totalTokens = inputTokens + outputTokens;

    // Async tracking (fire and forget to not block response)
    trackTokenUsage({
        userId: user.id,
        conversationId: id,
        tokens: totalTokens,
        type: "CHAT"
    });

    // 7. Update conversation timestamp
    await prisma.aiConversation.update({
        where: { id },
        data: {
            lastMessageAt: new Date(),
            updatedAt: new Date()
        }
    });

    res.json({ success: true, data: savedAiMsg });
});

