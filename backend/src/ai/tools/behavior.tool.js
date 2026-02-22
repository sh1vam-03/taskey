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
            // ✅ FIX: was z.enum(["HAPPY","NEUTRAL","SAD","STRESSED","TIRED"])
            // DB Mood enum only has HAPPY | NEUTRAL | SAD — STRESSED/TIRED don't exist
            mood: z.enum(["HAPPY", "NEUTRAL", "SAD"]).optional(),
            sleepHours: z.number().min(0).max(24).optional(),
            notes: z.string().optional(),
        }),
        func: async ({ date, mood, sleepHours, notes }, config) => {
            try {
                const userId = config.configurable?.user?.id || config.configurable?.userId;
                if (!userId) return error("User ID missing in configuration");

                await prisma.behaviorLog.upsert({
                    where: {
                        userId_date: {
                            userId,
                            date: new Date(date),
                        },
                    },
                    update: {
                        mood: mood ?? undefined,
                        sleepHours: sleepHours ?? undefined,
                        notes: notes ?? undefined,
                    },
                    create: {
                        userId,
                        date: new Date(date),
                        mood: mood ?? "NEUTRAL",
                        sleepHours,
                        notes,
                    },
                });

                return success({ message: "Behavior logged successfully." });
            } catch (e) {
                return error(`Error logging behavior: ${e.message}`);
            }
        },
    });
};
