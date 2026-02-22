/**
 * Text-to-Speech Service (Multi-Provider)
 *
 * Providers:
 *   "openai"  → tts-1 / alloy  (English-optimized, no language param)
 *   "sarvam"  → bulbul:v3      (Indian languages — language AUTO-DETECTED from text)
 *
 * ─── KEY BEHAVIOUR ───────────────────────────────────────────
 * For Sarvam TTS, the `target_language_code` sent to Bulbul v3 is
 * AUTOMATICALLY DETECTED from the text content, not taken from user settings.
 *
 *   Hindi text    → "hi-IN"   (Devanagari script detected)
 *   English text  → "en-IN"   (Latin script)
 *   Hinglish      → "hi-IN"   (mixed Devanagari+Latin → maps to Hindi)
 *   Tamil         → "ta-IN"   (Tamil Unicode block detected)
 *   … and so on for all 11 supported scripts.
 *
 * Users choose their SPEAKER voice (shubh, priya, etc.) but NOT the TTS language.
 *
 * Output: audio saved to tmp/, returns { audioPath, durationMinutes, detectedLang }
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
// ─────────────────────────────────────────────────────────────
// Male:   shubh, amit, sumit, manan, rahul, ratan
// Female: ritu, pooja, simran, kavya, priya, ishita, shreya, shruti
export const BULBUL_SPEAKERS = [
    "shubh", "amit", "sumit", "manan", "rahul", "ratan",   // male
    "ritu", "pooja", "simran", "kavya", "priya",            // female
    "ishita", "shreya", "shruti",                           // female
];

/** Default speaker used when none is specified */
export const DEFAULT_SPEAKER = "priya";

// ─────────────────────────────────────────────────────────────
// PUBLIC API — speakText
// ─────────────────────────────────────────────────────────────

/**
 * Converts text to speech audio and saves to tmp/.
 *
 * For Sarvam/Bulbul v3:
 *   - Language is AUTO-DETECTED from `text` content (no user input required).
 *   - Speaker is taken from `speaker` param (user preference).
 *
 * For OpenAI:
 *   - Uses tts-1 / alloy voice.
 *   - No language param (OpenAI TTS handles multilingual natively).
 *
 * @param {Object} params
 * @param {string} params.text      - Text to synthesize (from LLM output)
 * @param {Object} params.emotion   - { rate: 0.9–1.1 } from voice.emotion.js
 * @param {string} params.provider  - "openai" | "sarvam" (default: "openai")
 * @param {string} params.speaker   - Bulbul v3 speaker name (default: "priya")
 *                                    User-chosen. See BULBUL_SPEAKERS list above.
 *
 * @returns {Promise<{audioPath: string, durationMinutes: number, detectedLang: string|null}>}
 *   detectedLang: the BCP-47 code used (Sarvam only), null for OpenAI
 */
export const speakText = async ({
    text,
    emotion,
    provider = "openai",
    speaker = DEFAULT_SPEAKER,
}) => {
    if (!text?.trim()) throw new Error("speakText: text is required");

    const ts = Date.now();
    const estimatedDuration = getTextSpeakingMinutes(text);

    // ── Sarvam / Bulbul v3 ────────────────────────────────────
    if (provider === "sarvam") {
        const audioPath = path.join(TMP_DIR, `voice-${ts}.wav`);

        // AUTO-DETECT language from the actual text characters
        const detectedLang = detectTextLanguage(text);
        console.log(
            `[TTS] Auto-detected language: ${getLanguageLabel(detectedLang)} (${detectedLang}) ` +
            `for text: "${text.substring(0, 60).replace(/\n/g, " ")}…"`
        );

        // Validate speaker — fall back to default if unknown speaker passed
        const safeSpeaker = BULBUL_SPEAKERS.includes(speaker) ? speaker : DEFAULT_SPEAKER;
        if (safeSpeaker !== speaker) {
            console.warn(`[TTS] Unknown speaker "${speaker}", using "${DEFAULT_SPEAKER}"`);
        }

        const pace = emotion?.rate
            ? Math.max(0.5, Math.min(2.0, emotion.rate))
            : 1.0;

        const buffer = await sarvamSynthesize(text, {
            languageCode: detectedLang,  // ← auto-detected, never user-supplied
            speaker: safeSpeaker,
            pace,
            sampleRate: 22050,
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

    // ── OpenAI / tts-1 ───────────────────────────────────────
    const audioPath = path.join(TMP_DIR, `voice-${ts}.mp3`);

    const speed = emotion?.rate
        ? Math.max(0.85, Math.min(1.2, emotion.rate))
        : 1.0;

    const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
        speed,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(audioPath, buffer);

    return { audioPath, durationMinutes: estimatedDuration, detectedLang: null };
};

// ─────────────────────────────────────────────────────────────
// HELPERS — used by controller and billing code
// ─────────────────────────────────────────────────────────────

/**
 * Returns the MIME type for audio output of a given provider.
 * @param {string} provider
 * @returns {string}
 */
export const getAudioMimeType = (provider = "openai") =>
    provider === "sarvam" ? "audio/wav" : "audio/mp3";

/**
 * Returns the canonical TTS model name for billing.
 * @param {string} provider
 * @returns {string}
 */
export const getTTSModelName = (provider = "openai") =>
    provider === "sarvam" ? "bulbul:v3" : "tts-1";