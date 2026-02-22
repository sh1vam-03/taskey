/**
 * Text-to-Speech Service (Multi-Model)
 *
 * Routes synthesis by TTS model name directly — not by provider string.
 * This decouples TTS from the LLM choice so users can independently select:
 *   - which LLM to think with (aiChatModel / aiVoiceModel)
 *   - which TTS model to speak with (aiTtsModel)
 *
 * Supported TTS models:
 *   "bulbul:v3"  → Sarvam Bulbul v3  (Indian voices, auto-language detection, DEFAULT)
 *   "tts-1"      → OpenAI TTS 1      (English-optimized, natural voice)
 *
 * ─── KEY BEHAVIOUR ───────────────────────────────────────────
 * For Bulbul v3, the `target_language_code` is AUTO-DETECTED from the text
 * content via languageDetect.js. Users choose their speaker voice but NOT
 * the TTS language — it's always automatic.
 *
 * Returns { audioPath, durationMinutes, detectedLang }
 * ─────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { sarvamSynthesize } from "../services/sarvam.service.js";
import { getTextSpeakingMinutes, getAudioDurationMinutes } from "./audioDuration.js";
import { detectTextLanguage, getLanguageLabel } from "./languageDetect.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Ensure tmp/ exists at module load time
const TMP_DIR = path.join(process.cwd(), "tmp");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// ─────────────────────────────────────────────────────────────
// VALID SPEAKER LIST (Bulbul v3 — full list as of 2025)
// Male:   shubh, amit, sumit, manan, rahul, ratan
// Female: ritu, pooja, simran, kavya, priya, ishita, shreya, shruti
// ─────────────────────────────────────────────────────────────
export const BULBUL_SPEAKERS = [
    "shubh", "amit", "sumit", "manan", "rahul", "ratan",   // male
    "ritu", "pooja", "simran", "kavya", "priya",            // female
    "ishita", "shreya", "shruti"                            // female
];

export const DEFAULT_SPEAKER = "priya";

// ─────────────────────────────────────────────────────────────
// PUBLIC API — speakText
// ─────────────────────────────────────────────────────────────

/**
 * Converts text to speech audio and saves to tmp/.
 *
 * @param {Object} params
 * @param {string} params.text      - Text to synthesize (from LLM output)
 * @param {Object} params.emotion   - { rate: 0.9–1.1 } from voice.emotion.js
 * @param {string} params.ttsModel  - "bulbul:v3" | "tts-1"  (default: "bulbul:v3")
 * @param {string} params.speaker   - Bulbul v3 speaker name (user preference)
 *                                    Ignored when ttsModel is "tts-1"
 *
 * @returns {Promise<{audioPath: string, durationMinutes: number, detectedLang: string|null}>}
 *   detectedLang: BCP-47 code used (Bulbul v3 only), null for tts-1
 */
export const speakText = async ({
    text,
    emotion,
    ttsModel = "bulbul:v3",
    speaker = DEFAULT_SPEAKER
}) => {
    if (!text?.trim()) throw new Error("speakText: text is required");

    const ts = Date.now();
    const estimatedDuration = getTextSpeakingMinutes(text);

    // ── Sarvam Bulbul v3 ──────────────────────────────────────
    if (ttsModel === "bulbul:v3") {
        const audioPath = path.join(TMP_DIR, `voice-${ts}.wav`);

        // AUTO-DETECT language from the actual text characters
        const detectedLang = detectTextLanguage(text);
        console.log(
            `[TTS] Bulbul v3 | Auto-detected: ${getLanguageLabel(detectedLang)} (${detectedLang}) ` +
            `| Speaker: ${speaker} | Text: "${text.substring(0, 60).replace(/\n/g, " ")}…"`
        );

        // Validate speaker — fall back to default if unknown
        const safeSpeaker = BULBUL_SPEAKERS.includes(speaker) ? speaker : DEFAULT_SPEAKER;
        if (safeSpeaker !== speaker) {
            console.warn(`[TTS] Unknown speaker "${speaker}", using "${DEFAULT_SPEAKER}"`);
        }

        const pace = emotion?.rate
            ? Math.max(0.5, Math.min(2.0, emotion.rate))
            : 1.0;

        const buffer = await sarvamSynthesize(text, {
            languageCode: detectedLang,  // ← always auto-detected, never user-supplied
            speaker: safeSpeaker,
            pace,
            sampleRate: 22050
        });

        fs.writeFileSync(audioPath, buffer);

        // Try exact WAV header duration; fall back to text estimate
        let durationMinutes;
        try {
            durationMinutes = getAudioDurationMinutes(audioPath);
        } catch {
            durationMinutes = estimatedDuration;
        }

        return { audioPath, durationMinutes, detectedLang };
    }

    // ── OpenAI tts-1 ─────────────────────────────────────────
    const audioPath = path.join(TMP_DIR, `voice-${ts}.mp3`);

    const speed = emotion?.rate
        ? Math.max(0.85, Math.min(1.2, emotion.rate))
        : 1.0;

    const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
        speed
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(audioPath, buffer);

    return { audioPath, durationMinutes: estimatedDuration, detectedLang: null };
};

// ─────────────────────────────────────────────────────────────
// HELPERS — used by controller and billing code
// ─────────────────────────────────────────────────────────────

/**
 * Returns the MIME type for audio output of the given TTS model.
 * @param {string} ttsModel - "bulbul:v3" | "tts-1"
 * @returns {string}
 */
export const getAudioMimeType = (ttsModel = "bulbul:v3") =>
    ttsModel === "bulbul:v3" ? "audio/wav" : "audio/mp3";