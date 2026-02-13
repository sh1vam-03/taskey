import { HumanMessage, AIMessage } from "@langchain/core/messages";
import prisma from "../../config/db.js";
import { runAgentGraph } from "../graph/main.graph.js";
import { countTokens, checkCreditBalance, deductCredits } from "../services/aiToken.service.js";
import { validateInputSafety } from "../validators/safety.validator.js";

/**
 * Unified AI Orchestrator
 * Handles the full lifecycle of an AI request:
 * 1. Billing Pre-check
 * 2. Safety Validation
 * 3. History Retrieval
 * 4. Agent Execution (Intent -> Plan -> Reflect -> Execute)
 * 5. Formatting & Saving
 * 6. Credit Deduction
 * 
 * @param {string} userId - User ID
 * @param {string} conversationId - Conversation ID
 * @param {string} message - User input text
 * @param {string} mode - "TEXT" | "VOICE"
 * @returns {Promise<object>} The AI response message
 */
export const processAiRequest = async ({ userId, conversationId, message, mode = "TEXT" }) => {

    // 0. Strict Billing Pre-Check
    const minCredits = mode === "VOICE" ? 3 : 1;
    await checkCreditBalance(userId, minCredits);

    // 0.1 Safety Check
    if (!validateInputSafety(message)) {
        throw new Error("Unsafe input detected. Request blocked.");
    }

    // 1. Verify ownership & retrieval
    const conversation = await prisma.aiConversation.findFirst({
        where: { id: conversationId, userId }
    });
    if (!conversation) throw new Error("Conversation not found");

    // 2. Save User Message
    await prisma.aiMessage.create({
        data: {
            conversationId,
            userId,
            role: "USER",
            content: message
        }
    });

    // 3. Load History
    const history = await prisma.aiMessage.findMany({
        where: { conversationId: conversationId, userId },
        orderBy: { createdAt: 'asc' },
        take: 20
    });

    const lcMessages = history.map(msg =>
        msg.role === 'USER' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    );

    // 4. Run LangGraph Agent
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const aiResponse = await runAgentGraph({
        userId,
        messages: lcMessages,
        user,
        conversationId
    });

    const aiContent = aiResponse.content;
    const aiContentString = typeof aiContent === 'string' ? aiContent : JSON.stringify(aiContent);

    // 5. Save AI Response
    const savedAiMsg = await prisma.aiMessage.create({
        data: {
            conversationId,
            userId,
            role: "ASSISTANT",
            content: aiContentString
        }
    });

    // 6. Credit Deduction (Atomic)
    // Voice might cost more in future, but for now logic is same
    const creditsUsed = countTokens(message) + countTokens(aiContentString);

    await deductCredits({
        userId,
        conversationId,
        credits: creditsUsed,
        model: "gpt-4o-mini",
        type: mode === "VOICE" ? "VOICE" : "CHAT"
    });

    // 7. Update conversation timestamp
    await prisma.aiConversation.update({
        where: { id: conversationId },
        data: {
            lastMessageAt: new Date(),
            updatedAt: new Date()
        }
    });

    return savedAiMsg;
};
