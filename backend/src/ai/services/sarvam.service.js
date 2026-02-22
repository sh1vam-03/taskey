/**
 * Sarvam AI Service Adapter
 * Handles all direct communication with Sarvam AI APIs:
 *   - Chat completions via sarvam-m (POST /v1/chat/completions)
 *   - Speech-to-Text via saaras:v3 (POST /speech-to-text)
 *   - Text-to-Speech via bulbul:v3 (POST /text-to-speech)
 *
 * Auth: api-subscription-key header (NOT Bearer token)
 * Base: https://api.sarvam.ai
 *
 * ⚠️  IMPORTANT: sarvam-m does NOT support tool/function calling.
 *     It is used for direct conversational responses only.
 *     Tool-using agentic workflows must use OpenAI.
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
        buffer = lines.pop() ?? ""; // retain incomplete last line

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
 * @param {string} filePath  - Local path to the audio file (WAV/MP3/etc.)
 * @param {Object} opts
 * @param {string} opts.mode  - "transcribe" | "translate" | "verbatim" (default: "transcribe")
 * @param {string} opts.languageCode - BCP-47 code, e.g. "hi-IN". Use "unknown" for auto-detect.
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

    // Use native FormData + Blob (Node 18+)
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: mimeType });

    const formData = new FormData();
    formData.append("file", blob, path.basename(filePath));
    formData.append("model", opts.model || "saaras:v3");
    formData.append("mode", opts.mode || "transcribe");
    if (opts.languageCode) {
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
 * Synthesizes text to speech using Sarvam Bulbul v3.
 * Returns a Buffer of WAV audio data (decoded from base64 response).
 *
 * @param {string} text - Text to speak (max 2500 chars for bulbul:v3)
 * @param {Object} opts
 * @param {string} opts.speaker - Voice name (e.g. "meera", "priya", "arjun", "anushka")
 * @param {string} opts.languageCode - BCP-47 e.g. "en-IN", "hi-IN" (default: "en-IN")
 * @param {number} opts.pace - Speed 0.5–2.0 (default: 1.0)
 * @param {number} opts.sampleRate - Hz: 8000|16000|22050|24000|44100 (default: 22050)
 * @returns {Promise<Buffer>} WAV audio buffer
 */
export const sarvamSynthesize = async (text, opts = {}) => {
    const key = getSarvamKey();

    if (!text || !text.trim()) throw new Error("Sarvam TTS: text is required");
    if (text.length > 2500) {
        console.warn("[Sarvam TTS] Text exceeds 2500 chars — truncating.");
        text = text.substring(0, 2500);
    }

    const body = {
        inputs: [text],
        target_language_code: opts.languageCode || "en-IN",
        speaker: opts.speaker || "meera",
        model: opts.model || "bulbul:v3",
        pace: opts.pace || 1.0,
        enable_preprocessing: true,
        speech_sample_rate: opts.sampleRate || 22050,
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
    // Response: { request_id: string, audios: [base64string] }
    const base64Audio = data?.audios?.[0];
    if (!base64Audio) throw new Error("Sarvam TTS: No audio data in response");

    return Buffer.from(base64Audio, "base64");
};

// ─────────────────────────────────────────────
// 4. HEALTH CHECK
// ─────────────────────────────────────────────

/**
 * Quick health check — verifies API key is valid by calling chat with minimal tokens.
 * @returns {Promise<boolean>}
 */
export const sarvamHealthCheck = async () => {
    try {
        await sarvamChat(
            [{ role: "user", content: "Hi" }],
            { maxTokens: 10 }
        );
        return true;
    } catch {
        return false;
    }
};