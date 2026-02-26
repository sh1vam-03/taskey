import prisma from "../../config/db.js";

/**
 * Conversation Store
 * Encapsulates DB logic for saving/retrieving chat history.
 *
 * Note: Most orchestration code (aiOrchestrator.service.js) writes messages
 * directly via prisma. This module is available for use in other contexts
 * (e.g. tools, admin utilities) that need a shared save helper.
 */

/**
 * Saves a single message to the DB.
 *
 * @param {Object} params
 * @param {string} params.conversationId
 * @param {string} params.userId
 * @param {string} params.role     - "USER" | "ASSISTANT" | "SYSTEM"
 * @param {string} params.content
 * @param {Object} [params.meta]   - Optional JSON metadata (AiMessage.meta field)
 */
export const saveMessage = async ({ conversationId, userId, role, content, meta }) => {
    return prisma.aiMessage.create({
        data: {
            conversationId,
            userId,
            role,
            content,
            meta: meta ?? undefined, // ✅ FIX: was "metadata" — AiMessage schema field is "meta Json?"
        },
    });
};

/**
 * Retrieves conversation history in ascending order (oldest first).
 *
 * @param {string} conversationId
 * @param {string} userId
 * @param {number} limit  - Max messages to return (default: 20)
 * @returns {Promise<Array>} Array of AiMessage records
 */
export const getConversationHistory = async (conversationId, userId, limit = 20) => {
    return prisma.aiMessage.findMany({
        where: { conversationId, userId },
        orderBy: { createdAt: "asc" },
        take: limit,
    });
};