import prisma from "../../config/db.js";

// Simple heuristic: 1 token ~= 4 chars (English)
// For production, use 'tiktoken' or similar.
export const countTokens = (text) => {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
};

/**
 * Track token usage in DB
 * Updates:
 * 1. AiUsage (Log)
 * 2. AiConversation.totalTokensUsed (Aggregate)
 * 3. User.aiTokenBalance (Deduction)
 */
export const trackTokenUsage = async ({ userId, conversationId, tokens, type = "CHAT" }) => {
    if (!tokens || tokens <= 0) return;

    try {
        // 1. Log Usage
        await prisma.aiUsage.create({
            data: {
                userId,
                conversationId,
                type, // 'CHAT' or 'VOICE'
                tokensUsed: tokens
            }
        });

        // 2. Update Conversation Total
        if (conversationId) {
            await prisma.aiConversation.update({
                where: { id: conversationId },
                data: {
                    totalTokensUsed: { increment: tokens }
                }
            });
        }

        // 3. Deduct from User Balance
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && user.aiTokenBalance < tokens) {
            // For V1, logging warning, but effectively we stop tracking or throw? 
            // User requested: throw Error("AI token limit exceeded")
            // NOTE: Since this happens AFTER generation, throwing here is for visibility/logging.
            console.error(`User ${userId} exceeded token balance.`);
            // We still try to update to 0 or negative to show debt? 
            // Request said "Token balance can go negative" -> "Fix".
            // We'll throw to signal the issue.
            throw new Error("AI token limit exceeded");
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                aiTokenBalance: { decrement: tokens }
            }
        });


    } catch (error) {
        console.error("Token Tracking Failed:", error);
        // We do NOT throw here to avoid failing the user request just because stats failed
    }
};
