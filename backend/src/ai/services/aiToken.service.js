import prisma from "../../config/db.js";
import { AI_COSTS } from "../../config/plans.config.js";
import ApiError from "../../utils/ApiError.js";

// Helper: Estimate token count (heuristic)
export const countTokens = (text) => {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
};

// 1️⃣ Credit check
export const checkCreditBalance = async (userId, min = 10) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, "User not found");

    if (user.aiCreditBalance < min) {
        throw new ApiError(402, "AI credits exhausted. Please upgrade your plan or top-up.");
    }
};

// 2️⃣ Credit deduction (Atomic & Ledgered)
export const deductCredits = async ({
    userId,
    conversationId,
    credits,
    source = "AI_USAGE",
    model,
    type
}) => {
    // Ensure positive integer
    const amount = Math.max(1, Math.ceil(credits));

    return prisma.$transaction(async (tx) => {
        // 1. Update user balance
        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
                aiCreditBalance: { decrement: amount }
            }
        });

        // 2. Usage log (Granular)
        await tx.aiUsage.create({
            data: {
                userId,
                conversationId,
                model: model || "unknown",
                type: type || "CHAT", // CHAT or VOICE
                creditsUsed: amount
            }
        });

        // 3. Ledger (Financial Record)
        await tx.aiCreditLedger.create({
            data: {
                userId,
                credits: -amount,
                source: "AI_USAGE",
                conversationId
            }
        });

        // 4. Conversation aggregate
        if (conversationId) {
            await tx.aiConversation.update({
                where: { id: conversationId },
                data: {
                    totalCreditsUsed: { increment: amount }
                }
            });
        }
    });
};


