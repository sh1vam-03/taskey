import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import prisma from "../../config/db.js";

const success = (data) => JSON.stringify({ success: true, data });
const error = (msg) => JSON.stringify({ success: false, error: msg });

export const checkUsageTool = () => {
    return new DynamicStructuredTool({
        name: "check_usage",
        description: "Check current AI token usage.",
        schema: z.object({}),
        func: async (_args, config) => {
            try {
                const userId = config.configurable?.user?.id || config.configurable?.userId;
                if (!userId) return error("User ID missing in configuration");

                // Fetch real usage from User table
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { aiTokenBalance: true, plan: true }
                });

                if (!user) return error("User not found.");

                // Logic based on Plan (Example limits)
                let limit = 5000;
                if (user.plan === 'PRO') limit = 50000;
                if (user.plan === 'ULTRA') limit = 100000;

                // Balance is what remains (or what is used depending on schema logic).
                // Schema: aiTokenBalance Int @default(0). 
                // Usually balance implies 'credits left'. But 'tokenBalance' might be 'used'.
                // Let's assume it's CREDITS LEFT based on top-up logic.

                return success({
                    balance: user.aiTokenBalance,
                    plan: user.plan,
                    status: user.aiTokenBalance > 0 ? "HEALTHY" : "EXHAUSTED"
                });

            } catch (e) {
                return error(`Error checking usage: ${e.message}`);
            }
        }
    });
};
