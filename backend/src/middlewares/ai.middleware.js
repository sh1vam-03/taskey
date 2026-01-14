import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";


/**
 * Deduct tokens AFTER AI call
 */
export const requireAiTokens = (type) => {
    return async (req, res, next) => {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { aiTokenBalance: true },
        });

        if (!user) {
            throw new ApiError(401, "Unauthorized");
        }

        // attach for later deduction
        req.aiUsageType = type;
        req.currentAiTokens = user.aiTokenBalance;

        next();
    };
};

/**
 * Estimate tokens BEFORE AI call
 */
export const precheckAiTokens = (estimateFn) => {
    return async (req, res, next) => {
        const userId = req.user.id;

        const estimatedTokens = estimateFn(req);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { aiTokenBalance: true },
        });

        if (!user || user.aiTokenBalance < estimatedTokens) {
            throw new ApiError(
                403,
                "Not enough AI tokens for this request"
            );
        }

        req.estimatedTokens = estimatedTokens;
        next();
    };
};








