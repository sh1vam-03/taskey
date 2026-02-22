/**
 * Google Gemini Service Adapter
 *
 * Handles direct Gemini API calls for simple, tool-free requests:
 *   - Conversation title generation
 *   - Health checks
 *
 * The main agentic pipeline (tool calling, streaming) routes through
 * LangChain's ChatGoogleGenerativeAI adapter in main.graph.js — NOT here.
 *
 * Requires:
 *   npm install @langchain/google-genai
 *   Env var: GEMINI_API_KEY (from Google AI Studio: aistudio.google.com)
 */

const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1";

const getGeminiKey = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY environment variable is not configured.");
    return key;
};

/**
 * Single-shot chat completion with Gemini 1.5 Flash (no tool calling).
 * Mirrors the interface of sarvamChat() so the orchestrator can call either uniformly.
 *
 * Messages use OpenAI-compatible format: { role: "user"|"assistant"|"system", content }
 * System messages are extracted and sent as Gemini's systemInstruction field.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} opts
 * @param {number} opts.maxTokens   - Max output tokens (default: 2048)
 * @param {number} opts.temperature - 0–1 (default: 0)
 * @returns {Promise<string>} AI reply text
 */
export const geminiChat = async (messages, opts = {}) => {
    const key = getGeminiKey();

    // Gemini separates system instructions from conversation messages
    const systemMsg = messages.find(m => m.role === "system");
    const conversationMsgs = messages.filter(m => m.role !== "system");

    // Convert to Gemini's contents format (role must be "user" or "model")
    const contents = conversationMsgs.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
    }));

    const body = {
        contents,
        generationConfig: {
            maxOutputTokens: opts.maxTokens ?? 2048,
            temperature: opts.temperature ?? 0
        }
    };

    if (systemMsg) {
        body.systemInstruction = {
            parts: [{ text: systemMsg.content }]
        };
    }

    const res = await fetch(
        `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${key}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        }
    );

    if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Gemini Chat API error [${res.status}]: ${errBody}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini Chat: Empty response from API");
    return text.trim();
};

/**
 * Verifies the Gemini API key is valid and the endpoint is reachable.
 * @returns {Promise<boolean>}
 */
export const geminiHealthCheck = async () => {
    try {
        await geminiChat([{ role: "user", content: "Hi" }], { maxTokens: 10 });
        return true;
    } catch {
        return false;
    }
};