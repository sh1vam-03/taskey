/**
 * Speech-to-Text Service (Multi-Provider)
 *
 * Providers:
 *   "openai"  → Whisper-1   (universal, strong on English)
 *   "sarvam"  → Saaras v3   (best for Indian languages & accents)
 *
 * Returns both the transcript text AND audio duration in minutes,
 * so the caller can compute exact per-minute billing.
 */

import fs from "fs";
import OpenAI from "openai";
import { sarvamTranscribe } from "../services/sarvam.service.js";
import { getAudioDurationMinutes } from "./audioDuration.js"; // ✅ FIX: was "/audioDuration.js" (absolute path crash)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Transcribes an audio file and returns transcript + duration.
 *
 * @param {string} filePath  - Absolute path to audio file
 * @param {string} provider  - "openai" | "sarvam" (default: "openai")
 * @param {Object} opts
 * @param {string} opts.languageCode - Sarvam: BCP-47 e.g. "hi-IN". "unknown" = auto-detect.
 * @param {string} opts.mode         - Sarvam: "transcribe" | "translate" | "verbatim"
 * @returns {Promise<{text: string, durationMinutes: number}>}
 */
export const transcribeAudio = async (filePath, provider = "openai", opts = {}) => {
    if (!filePath) throw new Error("Audio file path is required");

    // Measure duration BEFORE transcription (file still exists at this point)
    const durationMinutes = getAudioDurationMinutes(filePath);

    let text;

    if (provider === "sarvam") {
        text = await sarvamTranscribe(filePath, {
            mode: opts.mode || "transcribe",
            languageCode: opts.languageCode || "unknown",
        });
    } else {
        const result = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-1",
        });
        text = result.text.trim();
    }

    return { text, durationMinutes };
};

/**
 * Returns the canonical STT model name for billing purposes.
 * @param {string} provider
 * @returns {string}
 */
export const getSTTModelName = (provider = "openai") =>
    provider === "sarvam" ? "saaras:v3" : "whisper-1";
