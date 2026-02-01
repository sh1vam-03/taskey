import prisma from "../../config/db.js";
import ApiError from "../../utils/ApiError.js";
import { AiUsageType } from "@prisma/client";

/**
 * Deduct AI tokens safely (transaction-only)
 * MUST be called inside prisma.$transaction
 */
export const deductAiTokens = async ({
    tx,
    userId,
    tokens,
    type = AiUsageType.CHAT,
}) => {
    if (!tx) {
        throw new Error("Transaction client (tx) is required");
    }

    if (!userId) {
        throw new ApiError(400, "User ID required for token deduction");
    }

    if (!Number.isInteger(tokens) || tokens <= 0) {
        throw new ApiError(400, "Invalid token amount");
    }

    // 1️⃣ Lock user row (prevents race conditions)
    const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            aiTokenBalance: true,
            status: true,
        },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.status !== "ACTIVE") {
        throw new ApiError(403, "Account not active");
    }

    // 2️⃣ Prevent negative balance
    if (user.aiTokenBalance < tokens) {
        throw new ApiError(
            402,
            "Insufficient AI tokens. Please recharge or upgrade plan."
        );
    }

    // 3️⃣ Deduct tokens
    await tx.user.update({
        where: { id: userId },
        data: {
            aiTokenBalance: {
                decrement: tokens,
            },
        },
    });

    // 4️⃣ Log usage (audit trail)
    await tx.aiUsage.create({
        data: {
            userId,
            type,
            tokensUsed: tokens,
        },
    });

    return {
        success: true,
        remainingTokens: user.aiTokenBalance - tokens,
    };
};

/**
 * Peek token balance (read-only, no mutation)
 */
export const getTokenBalance = async (userId) => {
    if (!userId) {
        throw new ApiError(400, "User ID required");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            aiTokenBalance: true,
        },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user.aiTokenBalance;
};

/**
 * Safe token credit (used for top-ups & subscriptions)
 * Can be used OUTSIDE transaction
 */
export const creditAiTokens = async ({
    userId,
    tokens,
    source,
    paymentId,
}) => {
    if (!userId || !tokens || tokens <= 0) {
        throw new ApiError(400, "Invalid token credit request");
    }

    return prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // 1️⃣ Add tokens
        await tx.user.update({
            where: { id: userId },
            data: {
                aiTokenBalance: {
                    increment: tokens,
                },
            },
        });

        // 2️⃣ Log credit
        if (paymentId) {
            await tx.aiTopUp.create({
                data: {
                    userId,
                    tokensAdded: tokens,
                    source,
                    paymentId,
                },
            });
        }

        return {
            success: true,
            tokensAdded: tokens,
        };
    });
};
