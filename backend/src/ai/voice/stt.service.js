/**
 * Speech-to-Text Service (Multi-Model)
 *
 * Routes transcription by STT model name directly — not by provider string.
 * This decouples STT from the LLM choice so users can independently select:
 *   - which LLM to think with (aiChatModel / aiVoiceModel)
 *   - which STT model to transcribe with (aiSttModel)
 *
 * Supported STT models:
 *   "saaras:v3"  → Sarvam Saaras v3  (best for Indian languages, DEFAULT)
 *   "whisper-1"  → OpenAI Whisper 1  (universal, strong on English)
 *
 * Returns { text, durationMinutes } for exact per-minute billing.
 */

import fs from "fs";
import OpenAI from "openai";
import { sarvamTranscribe } from "../services/sarvam.service.js";
import { getAudioDurationMinutes } from "./audioDuration.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Transcribes an audio file and returns the transcript + duration.
 *
 * @param {string} filePath  - Absolute path to audio file
 * @param {string} sttModel  - "saaras:v3" | "whisper-1"  (default: "saaras:v3")
 * @param {Object} opts
 * @param {string} opts.languageCode - For Saaras: BCP-47 e.g. "hi-IN".
 *                                     Pass "unknown" (or omit) to let Saaras auto-detect.
 * @param {string} opts.mode         - For Saaras: "transcribe" | "translate" | "verbatim"
 * @returns {Promise<{text: string, durationMinutes: number}>}
 */
export const transcribeAudio = async (filePath, sttModel = "saaras:v3", opts = {}) => {
    if (!filePath) throw new Error("Audio file path is required");

    // Measure duration BEFORE transcription (file still exists at this point)
    const durationMinutes = getAudioDurationMinutes(filePath);

    let text;

    if (sttModel === "saaras:v3") {
        text = await sarvamTranscribe(filePath, {
            mode: opts.mode || "transcribe",
            languageCode: opts.languageCode || "unknown",
            mimetype: opts.mimetype
        });
    } else {
        // whisper-1
        const result = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-1"
        });
        text = result.text.trim();
    }

    return { text, durationMinutes };
};