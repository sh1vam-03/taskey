import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { AiUsageType } from "@prisma/client";

/**
 * SAFE token deduction
 * - Prevents negative balance
 * - Prevents race conditions
 */
export const deductAiTokens = async ({
    userId,
    tokensUsed,
    type,
}) => {
    if (!tokensUsed || tokensUsed <= 0) {
        throw new ApiError(400, "Invalid token usage");
    }

    await prisma.$transaction(
        async (tx) => {
            // 🔒 LOCK user row
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: {
                    aiTokenBalance: true,
                },
            });

            if (!user) {
                throw new ApiError(401, "Unauthorized");
            }

            // ❌ HARD STOP if insufficient
            if (user.aiTokenBalance < tokensUsed) {
                throw new ApiError(
                    403,
                    "Insufficient AI tokens. Please recharge."
                );
            }

            // ✅ Deduct tokens
            await tx.user.update({
                where: { id: userId },
                data: {
                    aiTokenBalance: {
                        decrement: tokensUsed,
                    },
                },
            });

            // ✅ Log usage
            await tx.aiUsage.create({
                data: {
                    userId,
                    type,
                    tokensUsed,
                },
            });
        },
        {
            isolationLevel: "Serializable", // 🔥 CRITICAL
        }
    );
};
