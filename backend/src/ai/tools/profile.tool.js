/**
 * Profile Tool
 * Allows the AI assistant to update user preferences on their behalf.
 *
 * ── What can be updated ──────────────────────────────────────
 *   name            - display name
 *   timezone        - IANA timezone string
 *   aiChatModel     - LLM for text chat
 *   aiVoiceModel    - LLM for voice pipeline thinking
 *   aiTtsModel      - Text-to-Speech model
 *   aiSttModel      - Speech-to-Text model
 *   aiSarvamLang    - STT input language hint (for Saaras v3 accuracy)
 *   aiSarvamSpeaker - TTS output voice (Bulbul v3 speaker)
 *
 * ── What CANNOT be set via this tool ─────────────────────────
 *   TTS language: auto-detected from LLM text. No "ttsLanguage" setting exists.
 *
 * ── Speaker list (Bulbul v3) ──────────────────────────────────
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
            "Update user profile or AI model settings. " +
            "Use when user says: " +
            "'switch to Gemini', 'use GPT-4o mini', 'use Sarvam for chat', " +
            "'switch voice model to Sarvam', 'use OpenAI for transcription', " +
            "'change voice to Rahul', 'use female voice Priya', " +
            "'my language is Hindi', 'set timezone to Mumbai', 'change my name'. " +
            "NOTE: TTS language is automatic — never ask the user to set it.",

        schema: z.object({
            // ── Basic profile ───────────────────────────────────
            name: z.string().optional()
                .describe("User's display name"),

            timezone: z.string().optional()
                .describe("IANA timezone e.g. 'Asia/Kolkata'"),

            // ── LLM for text chat ───────────────────────────────
            aiChatModel: z.enum(["gemini-1.5-flash", "sarvam-30b", "gpt-4o-mini"]).optional()
                .describe(
                    "LLM for text chat conversations. " +
                    "'gemini-1.5-flash' = Gemini 1.5 Flash (Google, everyday assistant, manages tasks). " +
                    "'sarvam-30b' = Sarvam 30B (Indian language specialist, manages tasks). " +
                    "'gpt-4o-mini' = GPT-4o Mini (OpenAI, strong reasoning, manages tasks)."
                ),

            // ── LLM for voice thinking ──────────────────────────
            aiVoiceModel: z.enum(["gemini-1.5-flash", "sarvam-30b", "gpt-4o-mini"]).optional()
                .describe(
                    "LLM used to generate responses in voice mode. Same options as aiChatModel."
                ),

            // ── TTS model ───────────────────────────────────────
            aiTtsModel: z.enum(["bulbul:v3", "tts-1"]).optional()
                .describe(
                    "Text-to-Speech model. " +
                    "'bulbul:v3' = Sarvam Bulbul v3 (Indian voices, auto-language, default). " +
                    "'tts-1' = OpenAI TTS (English-optimized natural voice)."
                ),

            // ── STT model ───────────────────────────────────────
            aiSttModel: z.enum(["saaras:v3", "whisper-1"]).optional()
                .describe(
                    "Speech-to-Text transcription model. " +
                    "'saaras:v3' = Sarvam Saaras v3 (best for Indian accents, default). " +
                    "'whisper-1' = OpenAI Whisper (universal, great for English)."
                ),

            // ── STT language hint ───────────────────────────────
            aiSarvamLang: z.enum([
                "unknown", "en-IN", "hi-IN", "mr-IN", "ta-IN", "te-IN",
                "kn-IN", "ml-IN", "gu-IN", "bn-IN", "pa-IN", "od-IN"
            ]).optional()
                .describe(
                    "Language the USER SPEAKS (for Saaras v3 STT accuracy). " +
                    "'unknown' = auto-detect (recommended). " +
                    "Use when user says 'I speak Hindi', 'set my language to Tamil', etc. " +
                    "This does NOT affect TTS language — TTS is always auto-detected from response text."
                ),

            // ── TTS speaker voice ───────────────────────────────
            aiSarvamSpeaker: z.enum([
                "shubh", "amit", "sumit", "manan", "rahul", "ratan",
                "ritu", "pooja", "simran", "kavya", "priya", "ishita", "shreya", "shruti"
            ]).optional()
                .describe(
                    "Bulbul v3 TTS voice. " +
                    "Male: shubh, amit, sumit, manan, rahul, ratan. " +
                    "Female: ritu, pooja, simran, kavya, priya, ishita, shreya, shruti. " +
                    "Use when user says 'change voice to Rahul', 'use female voice Priya', etc."
                )
        }),

        func: async (args, config) => {
            try {
                const userId = config.configurable?.user?.id || config.configurable?.userId;
                if (!userId) return error("User ID missing in configuration");

                const updateData = {};
                if (args.name !== undefined) updateData.name = args.name;
                if (args.timezone !== undefined) updateData.timezone = args.timezone;
                if (args.aiChatModel !== undefined) updateData.aiChatModel = args.aiChatModel;
                if (args.aiVoiceModel !== undefined) updateData.aiVoiceModel = args.aiVoiceModel;
                if (args.aiTtsModel !== undefined) updateData.aiTtsModel = args.aiTtsModel;
                if (args.aiSttModel !== undefined) updateData.aiSttModel = args.aiSttModel;
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
                        aiChatModel: true,
                        aiVoiceModel: true,
                        aiTtsModel: true,
                        aiSttModel: true,
                        aiSarvamLang: true,
                        aiSarvamSpeaker: true
                    }
                });

                // Human-readable change descriptions
                const MODEL_LABELS = {
                    "gemini-1.5-flash": "Gemini 1.5 Flash (Google)",
                    "sarvam-30b": "Sarvam 30B (Indian languages)",
                    "gpt-4o-mini": "GPT-4o Mini (OpenAI)",
                    "bulbul:v3": "Sarvam Bulbul v3",
                    "tts-1": "OpenAI TTS",
                    "saaras:v3": "Sarvam Saaras v3",
                    "whisper-1": "OpenAI Whisper"
                };
                const LANG_NAMES = {
                    "unknown": "Auto-detect", "en-IN": "English", "hi-IN": "Hindi",
                    "mr-IN": "Marathi", "ta-IN": "Tamil", "te-IN": "Telugu",
                    "kn-IN": "Kannada", "ml-IN": "Malayalam", "gu-IN": "Gujarati",
                    "bn-IN": "Bengali", "pa-IN": "Punjabi", "od-IN": "Odia"
                };

                const changes = [];
                if (args.name !== undefined) changes.push(`name → "${user.name}"`);
                if (args.timezone !== undefined) changes.push(`timezone → "${user.timezone}"`);
                if (args.aiChatModel !== undefined) changes.push(`chat model → ${MODEL_LABELS[user.aiChatModel]}`);
                if (args.aiVoiceModel !== undefined) changes.push(`voice model → ${MODEL_LABELS[user.aiVoiceModel]}`);
                if (args.aiTtsModel !== undefined) changes.push(`TTS → ${MODEL_LABELS[user.aiTtsModel]}`);
                if (args.aiSttModel !== undefined) changes.push(`STT → ${MODEL_LABELS[user.aiSttModel]}`);
                if (args.aiSarvamLang !== undefined) changes.push(`voice input language → ${LANG_NAMES[user.aiSarvamLang] || user.aiSarvamLang}`);
                if (args.aiSarvamSpeaker !== undefined) changes.push(`speaker voice → ${user.aiSarvamSpeaker}`);

                return success({
                    message: `Updated: ${changes.join(", ")}.`,
                    profile: user
                });
            } catch (e) {
                return error(`Error updating profile: ${e.message}`);
            }
        }
    });
};