import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { AiUsageType } from "@prisma/client";

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
