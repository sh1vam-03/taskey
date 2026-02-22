/**
 * Profile Tool
 * Allows the AI assistant to update user preferences on their behalf.
 *
 * ── What can be updated ──────────────────────────────────────
 *   name          - display name
 *   timezone      - IANA timezone string
 *   aiProvider    - "openai" | "sarvam"
 *   aiSarvamLang  - STT input language hint (for Saaras v3 transcription accuracy)
 *   aiSarvamSpeaker - TTS output voice (Bulbul v3 speaker)
 *
 * ── What CANNOT be set via this tool ─────────────────────────
 *   TTS language: auto-detected from LLM text. There is no "ttsLanguage" user setting.
 *
 * ── Speaker list (Bulbul v3, current as of 2025) ─────────────
 *   Male:   shubh, amit, sumit, manan, rahul, ratan
 *   Female: ritu, pooja, simran, kavya, priya, ishita, shreya, shruti
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import prisma from "../../config/db.js";

const success = (data) => JSON.stringify({ success: true, data });
const error = (msg) => JSON.stringify({ success: false, error: msg });

export const updateProfileTool = () => {
    return new DynamicStructuredTool({
        name: "update_profile",
        description:
            "Update user profile or AI settings. " +
            "Use when user says: 'switch to Sarvam', 'use OpenAI', 'change voice to Rahul', " +
            "'change my speaker to Priya', 'my language is Hindi', 'set timezone to Mumbai', " +
            "'change my name', 'switch speaker to Amit', etc. " +
            "NOTE: TTS language is automatic — do NOT ask the user to set a TTS language.",

        schema: z.object({
            // ── Basic profile ───────────────────────────────
            name: z.string().optional()
                .describe("User's display name"),

            timezone: z.string().optional()
                .describe("IANA timezone e.g. 'Asia/Kolkata', 'Asia/Mumbai'"),

            // ── AI provider ─────────────────────────────────
            aiProvider: z.enum(["openai", "sarvam"]).optional()
                .describe(
                    "AI provider. 'openai' = full agentic mode with task/schedule tools. " +
                    "'sarvam' = Indian language optimised conversational mode (no tool calling)."
                ),

            // ── STT language ────────────────────────────────
            // This helps Saaras v3 accurately transcribe the USER's VOICE input.
            // It does NOT control TTS language (that's auto-detected from response text).
            aiSarvamLang: z.enum([
                "unknown", "en-IN", "hi-IN", "mr-IN", "ta-IN", "te-IN",
                "kn-IN", "ml-IN", "gu-IN", "bn-IN", "pa-IN", "od-IN",
            ]).optional()
                .describe(
                    "Language the USER SPEAKS (for STT accuracy). " +
                    "'unknown' = auto-detect. Use when user says 'I speak Hindi', " +
                    "'set my input language to Tamil', etc. " +
                    "This does NOT affect TTS language — TTS is always auto-detected."
                ),

            // ── TTS speaker voice ────────────────────────────
            // Male:   shubh, amit, sumit, manan, rahul, ratan
            // Female: ritu, pooja, simran, kavya, priya, ishita, shreya, shruti
            aiSarvamSpeaker: z.enum([
                "shubh", "amit", "sumit", "manan", "rahul", "ratan",
                "ritu", "pooja", "simran", "kavya", "priya", "ishita", "shreya", "shruti",
            ]).optional()
                .describe(
                    "Sarvam Bulbul v3 TTS voice. Male: shubh, amit, sumit, manan, rahul, ratan. " +
                    "Female: ritu, pooja, simran, kavya, priya, ishita, shreya, shruti. " +
                    "Use when user says 'change voice to Rahul', 'use female voice Priya', etc."
                ),
        }),

        func: async (args, config) => {
            try {
                const userId = config.configurable?.user?.id || config.configurable?.userId;
                if (!userId) return error("User ID missing in configuration");

                // Build update payload with only provided fields
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

                // Build human-readable confirmation
                const LANG_NAMES = {
                    "unknown": "Auto-detect",
                    "en-IN": "English", "hi-IN": "Hindi", "mr-IN": "Marathi",
                    "ta-IN": "Tamil", "te-IN": "Telugu", "kn-IN": "Kannada",
                    "ml-IN": "Malayalam", "gu-IN": "Gujarati", "bn-IN": "Bengali",
                    "pa-IN": "Punjabi", "od-IN": "Odia",
                };

                const changes = [];
                if (args.name !== undefined)
                    changes.push(`name → "${user.name}"`);
                if (args.timezone !== undefined)
                    changes.push(`timezone → "${user.timezone}"`);
                if (args.aiProvider !== undefined) {
                    const label = user.aiProvider === "sarvam"
                        ? "Sarvam AI (Indian languages)"
                        : "OpenAI (GPT-4o mini, full tools)";
                    changes.push(`AI provider → ${label}`);
                }
                if (args.aiSarvamLang !== undefined) {
                    const langName = LANG_NAMES[user.aiSarvamLang] || user.aiSarvamLang;
                    changes.push(`voice input language → ${langName}`);
                }
                if (args.aiSarvamSpeaker !== undefined) {
                    changes.push(`TTS voice → ${user.aiSarvamSpeaker}`);
                }

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