import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import prisma from "../../config/db.js";

const success = (data) => JSON.stringify({ success: true, data });
const error = (msg) => JSON.stringify({ success: false, error: msg });

export const logBehaviorTool = () => {
    return new DynamicStructuredTool({
        name: "log_behavior",
        description: "Log user's behavior, mood, or stats for the day.",
        schema: z.object({
            date: z.string().describe("Date in YYYY-MM-DD"),
            mood: z.enum(["HAPPY", "NEUTRAL", "SAD", "STRESSED", "TIRED"]).optional(),
            notes: z.string().optional(),
        }),
        func: async ({ date, mood, notes }, config) => {
            try {
                const userId = config.configurable?.user?.id || config.configurable?.userId;
                if (!userId) return error("User ID missing in configuration");

                let validMood = "NEUTRAL";
                // Simple mapping, can be expanded
                if (["HAPPY", "EXCITED", "STRESSED", "TIRED"].includes(mood)) validMood = mood;
                else if (["SAD", "DEPRESSED"].includes(mood)) validMood = "SAD";

                // Ensure valid enum value for Prisma
                // We might need to check if 'STRESSED' is in the Prisma Enum from schema.
                // Schema has: HAPPY, NEUTRAL, SAD. 'STRESSED'/'TIRED' might fail if passed directly.
                // Let's restrict to schema for safety or map them.

                const schemaMoods = ["HAPPY", "NEUTRAL", "SAD"];
                if (!schemaMoods.includes(validMood)) {
                    validMood = "NEUTRAL"; // Fallback safe
                }

                await prisma.behaviorLog.upsert({
                    where: {
                        userId_date: {
                            userId,
                            date: new Date(date)
                        }
                    },
                    update: {
                        mood: validMood,
                        notes: notes ? notes : undefined
                    },
                    create: {
                        userId,
                        date: new Date(date),
                        mood: validMood,
                        notes
                    }
                });
                return success({ message: "Behavior logged successfully." });
            } catch (e) {
                return error(`Error logging behavior: ${e.message}`);
            }
        }
    });
};
