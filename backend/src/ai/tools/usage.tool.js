import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import prisma from "../../config/db.js";

const success = (data) => JSON.stringify({ success: true, data });
const error = (msg) => JSON.stringify({ success: false, error: msg });

export const checkUsageTool = () => {
    return new DynamicStructuredTool({
        name: "check_usage",
        description: "Check current AI credit balance and plan status.",
        schema: z.object({}),
        func: async (_args, config) => {
            try {
                const userId = config.configurable?.user?.id || config.configurable?.userId;
                if (!userId) return error("User ID missing in configuration");

                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        aiCreditBalance: true, // ✅ FIX: was "aiTokenBalance" — field doesn't exist in schema
                        plan: true,
                    },
                });

                if (!user) return error("User not found.");

                // Credit limits by plan (adjust to match your plans.config)
                const limits = {
                    FREE: 10,
                    PRO: 300,
                    PRO_PLUS: 900,
                };
                const limit = limits[user.plan] ?? 500;

                return success({
                    balance: user.aiCreditBalance, // ✅ FIX: was user.aiTokenBalance
                    plan: user.plan,
                    limit,
                    status: user.aiCreditBalance > 0 ? "HEALTHY" : "EXHAUSTED",
                });
            } catch (e) {
                return error(`Error checking usage: ${e.message}`);
            }
        },
    });
};
