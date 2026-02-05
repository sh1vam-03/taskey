import prisma from "../../config/db.js";

/**
 * Conversation Store
 * Encapsulates DB logic for saving/retrieving chat history
 */
export const saveMessage = async ({ conversationId, userId, role, content, metadata }) => {
    return prisma.aiMessage.create({
        data: {
            conversationId,
            userId,
            role,
            content,
            metadata
        }
    });
};

export const getConversationHistory = async (conversationId, userId, limit = 20) => {
    return prisma.aiMessage.findMany({
        where: { conversationId, userId },
        orderBy: { createdAt: 'asc' },
        take: limit
    });
};
