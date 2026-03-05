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
     * @param {string} mode - "TEXT" or "VOICE"
     * @param {(token: string) => void} onToken - called with each text chunk
     * @param {(fullText: string) => void} onDone - called when stream finishes
     * @param {(error: Error) => void} onError - called on error
     * @returns {() => void} abort function
     */
    sendMessageStream(conversationId, message, mode, onToken, onDone, onError, onTitle, onWarning, signal = null) {
        const controller = new AbortController();
        const effectiveSignal = signal || controller.signal;

        (async () => {
            try {
                let response;

                const makeRequest = () => api.post(
                    `/ai/conversations/${conversationId}/message?stream=true`,
                    { message, stream: true, mode },
                    {
                        responseType: 'stream',
                        adapter: 'fetch', // Forces Axios to use the Fetch API natively, exposing a ReadableStream
                        signal: effectiveSignal
                    }
                );

                try {
                    response = await makeRequest();
                } catch (err) {
                    // Fallback intercept: Axios fetch adapter sometimes obscures error.response in streams.
                    // If it's a 401 Unauthorized, we manually trigger the rotation and retry.
                    const isUnauthorized = err.response?.status === 401 || err.message?.includes('401');

                    if (isUnauthorized) {
                        try {
                            await api.post('/auth/refresh');
                            response = await makeRequest(); // Retry successfully after new cookie
                        } catch (refreshErr) {
                            if (typeof window !== 'undefined') window.location.href = '/login';
                            throw new Error("Session expired. Please log in again.");
                        }
                    } else {
                        throw err; // Re-throw if not a token issue
                    }
                }

                // The response.data is now a ReadableStream thanks to responseType: 'stream' and adapter: 'fetch'
                const reader = response.data.getReader();
                const decoder = new TextDecoder();
                let fullText = "";
                let buffer = "";
                let pendingWarning = null;

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

                                // Check for structured error event from backend
                                if (parsed.error) {
                                    const err = new Error(parsed.error);
                                    err.status = parsed.code || 500;
                                    throw err;
                                }

                                if (parsed.token) {
                                    fullText += parsed.token;
                                    onToken(parsed.token);
                                }

                                if (parsed.title && onTitle) {
                                    onTitle(parsed.title);
                                }

                                if (parsed.warning) {
                                    pendingWarning = parsed.warning;
                                }
                            } catch (e) {
                                // If it's our structured error, re-throw
                                if (e.status) throw e;
                                console.warn("Stream parse error on chunk:", dataStr);
                            }
                        }
                    }
                }

                onDone(fullText);
                if (pendingWarning && onWarning) {
                    onWarning(pendingWarning);
                }
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
        const ext = audioBlob.type?.includes('wav') ? 'wav' : 'webm';
        formData.append("audio", audioBlob, `recording.${ext}`);

        const response = await api.post(
            `/ai/conversations/${conversationId}/voice`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data.data || response.data;
    },

    async transcribeAudio(audioBlob) {
        const formData = new FormData();
        const ext = audioBlob.type?.includes('wav') ? 'wav' : 'webm';
        formData.append("audio", audioBlob, `voice.${ext}`);

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
