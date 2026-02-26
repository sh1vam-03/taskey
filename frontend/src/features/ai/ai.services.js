import api from "@/services/api";

// Always use direct backend connection in development to bypass Next.js rewrite buffering bugs
const BASE_URL = process.env.NODE_ENV === 'production'
    ? (process.env.NEXT_PUBLIC_API_URL || '/api')
    : 'http://localhost:5000/api';

const aiService = {
    // ─── Settings ───────────────────────────────────────────────

    async getAiSettings() {
        const response = await api.get("/ai/settings");
        return response.data.data || response.data;
    },

    async updateAiSettings(patch) {
        // patch: { provider?, sttLang?, speaker? }
        const response = await api.patch("/ai/settings", patch);
        return response.data.data || response.data;
    },

    // ─── Conversations ─────────────────────────────────────────

    async createConversation(message) {
        const body = message ? { message } : {};
        const response = await api.post("/ai/conversations", body);
        return response.data.data || response.data;
    },

    async getConversations() {
        const response = await api.get("/ai/conversations");
        return response.data.data || response.data || [];
    },

    async getConversation(id) {
        const response = await api.get(`/ai/conversations/${id}`);
        return response.data.data || response.data;
    },

    async updateConversation(id, title) {
        const response = await api.put(`/ai/conversations/${id}`, { title });
        return response.data.data || response.data;
    },

    async deleteConversation(id) {
        const response = await api.delete(`/ai/conversations/${id}`);
        return response.data;
    },

    // ─── Messages ───────────────────────────────────────────────

    async getMessages(conversationId) {
        const response = await api.get(`/ai/conversations/${conversationId}/messages`);
        return response.data.data || response.data || [];
    },

    async sendMessage(conversationId, message) {
        const response = await api.post(`/ai/conversations/${conversationId}/message`, { message });
        return response.data.data || response.data;
    },

    /**
     * Send message with SSE streaming response.
     * Uses fetch + ReadableStream (not EventSource, which doesn't support POST).
     *
     * @param {string} conversationId
     * @param {string} message
     * @param {(token: string) => void} onToken - called with each text chunk
     * @param {(fullText: string) => void} onDone - called when stream finishes
     * @param {(error: Error) => void} onError - called on error
     * @returns {() => void} abort function
     */
    sendMessageStream(conversationId, message, onToken, onDone, onError) {
        const controller = new AbortController();

        (async () => {
            try {
                const response = await api.post(
                    `/ai/conversations/${conversationId}/message?stream=true`,
                    { message, stream: true },
                    {
                        responseType: 'stream',
                        adapter: 'fetch', // Forces Axios to use the Fetch API natively, exposing a ReadableStream
                        signal: controller.signal
                    }
                );

                // Axios handles 401 token refresh transparently, so no need for custom retry logic here.
                // If the request ultimately fails (e.g., after refresh attempts), Axios will throw an error.

                // The response.data is now a ReadableStream thanks to responseType: 'stream' and adapter: 'fetch'
                const reader = response.data.getReader();
                const decoder = new TextDecoder();
                let fullText = "";
                let buffer = "";

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split(/\r?\n\r?\n/);
                    buffer = lines.pop(); // Keep incomplete chunk in buffer

                    for (let line of lines) {
                        line = line.trim();
                        if (line.startsWith("data: ")) {
                            const dataStr = line.substring(6).trim();
                            if (dataStr === "[DONE]") continue;

                            try {
                                const parsed = JSON.parse(dataStr);
                                if (parsed.token) {
                                    console.log("STREAM TOKEN:", parsed.token);
                                    fullText += parsed.token;
                                    onToken(parsed.token);
                                }
                            } catch (e) {
                                console.warn("Stream parse error on chunk:", dataStr);
                            }
                        }
                    }
                }

                onDone(fullText);
            } catch (err) {
                if (err.name !== "AbortError") {
                    onError(err);
                }
            }
        })();

        // Return abort function
        return () => controller.abort();
    },

    // ─── Voice ──────────────────────────────────────────────────

    async sendVoiceMessage(conversationId, audioBlob) {
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        const response = await api.post(
            `/ai/conversations/${conversationId}/voice`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data.data || response.data;
    },

    async transcribeAudio(audioBlob) {
        const formData = new FormData();
        formData.append("audio", audioBlob, "voice.webm");

        const response = await api.post("/ai/voice/transcribe", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.data || response.data;
    },

    async synthesizeSpeech(text, speaker) {
        const body = { text };
        if (speaker) body.speaker = speaker;

        const response = await api.post("/ai/voice/tts", body);
        return response.data.data || response.data;
    },
};

export default aiService;
