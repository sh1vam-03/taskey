import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import prisma from "../../config/db.js";

const success = (data) => JSON.stringify({ success: true, data });
const error = (msg) => JSON.stringify({ success: false, error: msg });

// Valid values — keep in sync with ai.controller.js constants
const VALID_SARVAM_SPEAKERS = [
    "meera", "priya", "arjun", "anushka", "maya", "kiran", "kavya",
];
const VALID_SARVAM_LANGS = [
    "en-IN", "hi-IN", "mr-IN", "ta-IN", "te-IN", "kn-IN",
    "ml-IN", "gu-IN", "bn-IN", "pa-IN", "unknown",
];

export const updateProfileTool = () => {
    return new DynamicStructuredTool({
        name: "update_profile",
        description:
            "Update user profile settings. Can update name, timezone, or AI model preferences. " +
            "Use this when the user says things like 'switch to Sarvam', 'change my voice to Hindi', " +
            "'use OpenAI', 'change language to Hindi', or 'switch speaker to Arjun'.",
        schema: z.object({
            // Basic profile
            name: z.string().optional().describe("User's display name"),
            timezone: z.string().optional().describe("IANA timezone e.g. 'Asia/Kolkata'"),

            // AI provider preferences — user can switch model via conversation
            aiProvider: z
                .enum(["openai", "sarvam"])
                .optional()
                .describe(
                    "AI provider to use. 'openai' = full agentic mode with tools. " +
                    "'sarvam' = Indian language optimised, no tool calling."
                ),
            aiSarvamLang: z
                .enum([
                    "en-IN", "hi-IN", "mr-IN", "ta-IN", "te-IN",
                    "kn-IN", "ml-IN", "gu-IN", "bn-IN", "pa-IN", "unknown",
                ])
                .optional()
                .describe("Language for Sarvam STT/TTS. 'unknown' = auto-detect."),
            aiSarvamSpeaker: z
                .enum(["meera", "priya", "arjun", "anushka", "maya", "kiran", "kavya"])
                .optional()
                .describe("Sarvam TTS voice. meera/priya/anushka/maya/kavya = female. arjun/kiran = male."),
        }),
        func: async (args, config) => {
            try {
                const userId = config.configurable?.user?.id || config.configurable?.userId;
                if (!userId) return error("User ID missing in configuration");

                // Build update payload — only include provided fields
                const updateData = {};
                if (args.name !== undefined) updateData.name = args.name;
                if (args.timezone !== undefined) updateData.timezone = args.timezone;
                if (args.aiProvider !== undefined) updateData.aiProvider = args.aiProvider;
                if (args.aiSarvamLang !== undefined) updateData.aiSarvamLang = args.aiSarvamLang;
                if (args.aiSarvamSpeaker !== undefined) updateData.aiSarvamSpeaker = args.aiSarvamSpeaker;

                if (Object.keys(updateData).length === 0) {
                    return error("No fields provided to update.");
                }

                const user = await prisma.user.update({
                    where: { id: userId },
                    data: updateData,
                    select: {
                        name: true,
                        timezone: true,
                        aiProvider: true,
                        aiSarvamLang: true,
                        aiSarvamSpeaker: true,
                    },
                });

                // Build a human-readable confirmation message
                const changes = [];
                if (args.name !== undefined) changes.push(`name → "${user.name}"`);
                if (args.timezone !== undefined) changes.push(`timezone → "${user.timezone}"`);
                if (args.aiProvider !== undefined) {
                    const label = user.aiProvider === "sarvam" ? "Sarvam AI (Indian languages)" : "OpenAI (GPT-4o mini)";
                    changes.push(`AI provider → ${label}`);
                }
                if (args.aiSarvamLang !== undefined) changes.push(`language → "${user.aiSarvamLang}"`);
                if (args.aiSarvamSpeaker !== undefined) changes.push(`voice → "${user.aiSarvamSpeaker}"`);

                return success({
                    message: `Updated: ${changes.join(", ")}.`,
                    profile: user,
                });
            } catch (e) {
                return error(`Error updating profile: ${e.message}`);
            }
        },
    });
};