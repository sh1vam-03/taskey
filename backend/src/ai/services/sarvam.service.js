/**
 * Sarvam AI Service Adapter
 * Handles all direct communication with Sarvam AI APIs:
 *   - Chat completions via sarvam-m  (POST /v1/chat/completions)
 *   - Speech-to-Text via saaras:v3   (POST /speech-to-text)
 *   - Text-to-Speech via bulbul:v3   (POST /text-to-speech)
 *
 * Auth: api-subscription-key header (NOT Bearer token)
 * Base: https://api.sarvam.ai
 *
 * ⚠️  IMPORTANT: sarvam-m does NOT support tool/function calling.
 *     Tool-using agentic workflows must use OpenAI.
 *
 * ── Bulbul v3 Speakers ───────────────────────────────────────
 * Male:   shubh, amit, sumit, manan, rahul, ratan
 * Female: ritu, pooja, simran, kavya, priya, ishita, shreya, shruti
 *
 * ── Bulbul v3 Language Codes ─────────────────────────────────
 * en-IN  hi-IN  bn-IN  ta-IN  te-IN  kn-IN
 * ml-IN  mr-IN  gu-IN  pa-IN  od-IN
 *
 * The target_language_code is AUTO-DETECTED from text in tts.service.js.
 * This file only handles the raw API call — it takes whatever code is given.
 */

import fs from "fs";
import path from "path";

const SARVAM_BASE = process.env.SARVAM_API_BASE || "https://api.sarvam.ai";

const getSarvamKey = () => {
    const key = process.env.SARVAM_API_KEY;
    if (!key) throw new Error("SARVAM_API_KEY environment variable is not configured.");
    return key;
};

// ─────────────────────────────────────────────
// 1. CHAT — sarvam-m
// ─────────────────────────────────────────────

/**
 * Single-shot chat completion with sarvam-m.
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} opts
 * @returns {Promise<string>} AI reply text
 */
export const sarvamChat = async (messages, opts = {}) => {
    const key = getSarvamKey();

    const body = {
        model: opts.model || "sarvam-m",
        messages,
        temperature: opts.temperature ?? 0.2,
        top_p: opts.topP ?? 1,
        max_tokens: opts.maxTokens ?? 2048,
        stream: false,
        wiki_grounding: opts.wikiGrounding ?? false,
    };

    const res = await fetch(`${SARVAM_BASE}/v1/chat/completions`, {
        method: "POST",
        headers: {
            "api-subscription-key": key,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Sarvam Chat API error [${res.status}]: ${errBody}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Sarvam Chat: Empty response from API");
    return content;
};

/**
 * Streaming chat completion with sarvam-m (SSE generator).
 * Usage: for await (const token of sarvamChatStream(messages)) { ... }
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} opts
 * @yields {string} Token chunks
 */
export const sarvamChatStream = async function* (messages, opts = {}) {
    const key = getSarvamKey();

    const res = await fetch(`${SARVAM_BASE}/v1/chat/completions`, {
        method: "POST",
        headers: {
            "api-subscription-key": key,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: opts.model || "sarvam-m",
            messages,
            temperature: opts.temperature ?? 0.2,
            max_tokens: opts.maxTokens ?? 2048,
            stream: true,
        }),
    });

    if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Sarvam Stream API error [${res.status}]: ${errBody}`);
    }

    if (!res.body) throw new Error("Sarvam Stream: No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const raw = trimmed.slice(6);
            if (raw === "[DONE]") return;

            try {
                const parsed = JSON.parse(raw);
                const token = parsed?.choices?.[0]?.delta?.content;
                if (token) yield token;
            } catch {
                // skip malformed SSE line
            }
        }
    }
};

// ─────────────────────────────────────────────
// 2. SPEECH-TO-TEXT — saaras:v3
// ─────────────────────────────────────────────

/**
 * Transcribes an audio file using Sarvam Saaras v3.
 *
 * @param {string} filePath  - Local path to the audio file
 * @param {Object} opts
 * @param {string} opts.mode          - "transcribe" | "translate" | "verbatim"
 * @param {string} opts.languageCode  - BCP-47 e.g. "hi-IN".
 *                                      Pass "unknown" (or omit) to let Saaras auto-detect.
 *                                      ⚠️  DO NOT send "unknown" to the API — omit the field instead.
 * @returns {Promise<string>} Transcribed text
 */
export const sarvamTranscribe = async (filePath, opts = {}) => {
    const key = getSarvamKey();
    if (!filePath || !fs.existsSync(filePath)) {
        throw new Error(`Sarvam STT: File not found at path: ${filePath}`);
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = {
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".m4a": "audio/mp4",
        ".ogg": "audio/ogg",
        ".flac": "audio/flac",
        ".aac": "audio/aac",
        ".webm": "audio/webm",
    };
    const mimeType = mimeMap[ext] || "audio/wav";

    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: mimeType });

    const formData = new FormData();
    formData.append("file", blob, path.basename(filePath));
    formData.append("model", opts.model || "saaras:v3");
    formData.append("mode", opts.mode || "transcribe");

    // ✅ FIX: "unknown" is our internal sentinel for "let Saaras auto-detect".
    // The Saaras API auto-detects when the language_code field is OMITTED entirely.
    // Sending language_code: "unknown" would cause a 4xx API error.
    // Only append language_code when a real BCP-47 code is provided.
    if (opts.languageCode && opts.languageCode !== "unknown") {
        formData.append("language_code", opts.languageCode);
    }

    const res = await fetch(`${SARVAM_BASE}/speech-to-text`, {
        method: "POST",
        headers: {
            "api-subscription-key": key,
            // DO NOT set Content-Type manually — fetch sets it with boundary for FormData
        },
        body: formData,
    });

    if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Sarvam STT API error [${res.status}]: ${errBody}`);
    }

    const data = await res.json();
    const transcript = data?.transcript;
    if (!transcript) throw new Error("Sarvam STT: No transcript in API response");
    return transcript.trim();
};

// ─────────────────────────────────────────────
// 3. TEXT-TO-SPEECH — bulbul:v3
// ─────────────────────────────────────────────

/**
 * Synthesizes speech using Sarvam Bulbul v3.
 *
 * The `languageCode` here is the AUTO-DETECTED value from tts.service.js
 * (via languageDetect.js). This function does NOT detect language — it just
 * makes the raw API call with whatever code it's given.
 *
 * @param {string} text - Text to speak (max 2500 chars)
 * @param {Object} opts
 * @param {string} opts.languageCode  - BCP-47: "en-IN"|"hi-IN"|"bn-IN"|"ta-IN"|"te-IN"
 *                                             "kn-IN"|"ml-IN"|"mr-IN"|"gu-IN"|"pa-IN"|"od-IN"
 *                                      MUST be auto-detected before calling this.
 * @param {string} opts.speaker       - User-chosen voice:
 *                                      Male:   shubh, amit, sumit, manan, rahul, ratan
 *                                      Female: ritu, pooja, simran, kavya, priya, ishita, shreya, shruti
 * @param {number} opts.pace          - Speed 0.5–2.0 (default: 1.0)
 * @param {number} opts.sampleRate    - Hz: 8000|16000|22050|24000|44100 (default: 22050)
 * @returns {Promise<Buffer>} WAV audio buffer
 */
export const sarvamSynthesize = async (text, opts = {}) => {
    const key = getSarvamKey();

    if (!text || !text.trim()) throw new Error("Sarvam TTS: text is required");

    // Bulbul v3 max input: 2500 chars
    if (text.length > 2500) {
        console.warn("[Sarvam TTS] Text exceeds 2500 chars — truncating.");
        text = text.substring(0, 2500);
    }

    // Validated defaults
    const languageCode = opts.languageCode || "en-IN";
    const speaker = opts.speaker || "shubh";  // "shubh" is in the current valid list
    const pace = Math.max(0.5, Math.min(2.0, opts.pace || 1.0));
    const sampleRate = opts.sampleRate || 22050;

    const body = {
        inputs: [text],
        target_language_code: languageCode,
        speaker,
        model: opts.model || "bulbul:v3",
        pace,
        enable_preprocessing: true,
        speech_sample_rate: sampleRate,
        audio_format: "wav",
    };

    const res = await fetch(`${SARVAM_BASE}/text-to-speech`, {
        method: "POST",
        headers: {
            "api-subscription-key": key,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Sarvam TTS API error [${res.status}]: ${errBody}`);
    }

    const data = await res.json();
    const base64Audio = data?.audios?.[0];
    if (!base64Audio) throw new Error("Sarvam TTS: No audio data in response");

    return Buffer.from(base64Audio, "base64");
};

// ─────────────────────────────────────────────
// 4. HEALTH CHECK
// ─────────────────────────────────────────────

/**
 * Verifies the Sarvam API key is valid.
 * @returns {Promise<boolean>}
 */
export const sarvamHealthCheck = async () => {
    try {
        await sarvamChat([{ role: "user", content: "Hi" }], { maxTokens: 10 });
        return true;
    } catch {
        return false;
    }
};