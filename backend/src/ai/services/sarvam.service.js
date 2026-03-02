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
 * ── Tool Calling ─────────────────────────────────────────────
 * sarvam-m DOES support tool/function calling via its OpenAI-compatible
 * /v1/chat/completions endpoint. The main.graph.js routes Sarvam through
 * LangChain's ChatOpenAI adapter (pointed at Sarvam's base URL), which
 * handles tool binding and the full agentic loop automatically.
 *
 * The raw sarvamChat / sarvamChatStream functions in this file are used for:
 *   - Conversation title generation (simple, no tools needed)
 *   - Health checks
 * They are NOT used for the main agentic pipeline anymore (main.graph.js handles that).
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

/**
 * Robust fetch wrapper for Sarvam AI with timeout and retry logic.
 * Helps diagnose and mitigate ConnectTimeoutErrors.
 */
const sarvamFetch = async (url, options = {}, retries = 3) => {
    const timeout = 12000; // 12 seconds
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);

        const isTimeout = err.name === 'AbortError' || err.message?.includes('timeout');
        const isNetworkError = err.message?.includes('fetch failed') || err.code === 'ECONNREFUSED';

        if ((isTimeout || isNetworkError) && retries > 0) {
            console.warn(`[Sarvam Connectivity] ${err.message}. Retrying... (${retries} left) Target: ${url}`);
            // Wait 1s before retry
            await new Promise(r => setTimeout(r, 1000));
            return sarvamFetch(url, options, retries - 1);
        }

        console.error(`[Sarvam Error] Connectivity issue for ${url}:`, err.message);
        throw err;
    }
};

// ─────────────────────────────────────────────
// 1. CHAT — sarvam-m (simple, no tools)
// Used for title generation and health checks only.
// The agentic pipeline uses LangChain's ChatOpenAI adapter (main.graph.js).
// ─────────────────────────────────────────────

/**
 * Single-shot chat completion with sarvam-m (no tool calling).
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

    const res = await sarvamFetch(`${SARVAM_BASE}/v1/chat/completions`, {
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
 * Streaming chat completion with sarvam-m (SSE generator, no tool calling).
 * Used for simple streaming responses. The agentic streaming pipeline
 * goes through LangChain's ChatOpenAI adapter in main.graph.js.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} opts
 * @yields {string} Token chunks
 */
export const sarvamChatStream = async function* (messages, opts = {}) {
    const key = getSarvamKey();

    const res = await sarvamFetch(`${SARVAM_BASE}/v1/chat/completions`, {
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
    // If extension is missing (common in multer dest), fall back to provided mimetype or audio/webm
    const mimeType = mimeMap[ext] || opts.mimetype || "audio/webm";

    const fileBuffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);

    // ⚠️ CRITICAL: Sarvam often needs the filename extension hint even if Blob type is set.
    // Multer files in tmp/ usually lack extensions, so we append one based on mimeType.
    const reverseMimeMap = {
        "audio/mpeg": ".mp3",
        "audio/wav": ".wav",
        "audio/mp4": ".m4a",
        "audio/ogg": ".ogg",
        "audio/flac": ".flac",
        "audio/aac": ".aac",
        "audio/webm": ".webm",
    };
    const extension = reverseMimeMap[mimeType] || ".webm";
    const fileName = path.basename(filePath).includes('.')
        ? path.basename(filePath)
        : `${path.basename(filePath)}${extension}`;

    // Use Blob + Filename for better compatibility across fetch implementations
    const blob = new Blob([fileBuffer], { type: mimeType });

    const formData = new FormData();
    formData.append("file", blob, fileName);
    formData.append("model", opts.model || "saaras:v3");
    formData.append("mode", opts.mode || "transcribe");

    // ✅ "unknown" is our internal sentinel for "let Saaras auto-detect".
    // The Saaras API auto-detects when the language_code field is OMITTED entirely.
    // Sending language_code: "unknown" would cause a 4xx API error.
    // Only append language_code when a real BCP-47 code is provided.
    if (opts.languageCode && opts.languageCode !== "unknown") {
        formData.append("language_code", opts.languageCode);
    }

    const res = await sarvamFetch(`${SARVAM_BASE}/speech-to-text`, {
        method: "POST",
        headers: {
            "api-subscription-key": key,
            // DO NOT set Content-Type manually — fetch sets it with boundary for FormData
        },
        body: formData,
    });

    if (!res.ok) {
        const errBody = await res.text();
        console.error(`[Sarvam STT Diagnostic] FAILED: ${res.status} | URL: ${SARVAM_BASE}/speech-to-text | Size: ${stats.size} | Mime: ${mimeType} | Filename: ${fileName}`);
        throw new Error(`Sarvam STT API error [${res.status}]: ${errBody}`);
    }

    const data = await res.json();

    // Allow empty string if no speech detected, but throw if the field is missing entirely
    if (data?.transcript === undefined) {
        console.error("[Sarvam STT Diagnostic] SUCCESS BUT MISSING TRANSCRIPT FIELD. Response Body:", JSON.stringify(data));
        throw new Error("Sarvam STT: No transcript field in API response");
    }
    return (data.transcript || "").trim();
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
    const speaker = opts.speaker || "shubh";
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

    const res = await sarvamFetch(`${SARVAM_BASE}/text-to-speech`, {
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