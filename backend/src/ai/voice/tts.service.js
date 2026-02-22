/**
 * Text-to-Speech Service (Multi-Provider)
 *
 * Providers:
 *   "openai"  → tts-1 / alloy  (default, English-optimized)
 *   "sarvam"  → bulbul:v3      (best for Indian languages)
 *
 * Output: saves audio to tmp/ and returns {audioPath, durationMinutes}
 * for exact per-minute billing.
 *
 * File format: .mp3 for OpenAI, .wav for Sarvam.
 */

import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { sarvamSynthesize } from "../services/sarvam.service.js";
import { getTextSpeakingMinutes, getAudioDurationMinutes } from "./audioDuration.js"; // ✅ FIX: was "../utils/audioDuration.js" — audioDuration.js lives in voice/, not utils/

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Ensure tmp/ exists at module load time
const TMP_DIR = path.join(process.cwd(), "tmp");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

/**
 * Converts text to an audio file.
 *
 * @param {Object} params
 * @param {string} params.text           - Text to synthesize
 * @param {Object} params.emotion        - { rate: 0.9–1.1 } from voice.emotion.js
 * @param {string} params.provider       - "openai" | "sarvam" (default: "openai")
 * @param {string} params.languageCode   - Sarvam: BCP-47 e.g. "hi-IN" (default: "en-IN")
 * @param {string} params.speaker        - Sarvam: voice name e.g. "meera", "arjun"
 *
 * @returns {Promise<{audioPath: string, durationMinutes: number}>}
 */
export const speakText = async ({
    text,
    emotion,
    provider = "openai",
    languageCode = "en-IN",
    speaker = "meera",
}) => {
    if (!text?.trim()) throw new Error("speakText: text is required");

    const ts = Date.now();
    const estimatedDuration = getTextSpeakingMinutes(text);

    if (provider === "sarvam") {
        const audioPath = path.join(TMP_DIR, `voice-${ts}.wav`);

        const pace = emotion?.rate
            ? Math.max(0.5, Math.min(2.0, emotion.rate))
            : 1.0;

        const buffer = await sarvamSynthesize(text, {
            languageCode,
            speaker,
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

        return { audioPath, durationMinutes };
    }

    // Default: OpenAI TTS
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

    return { audioPath, durationMinutes: estimatedDuration };
};

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
