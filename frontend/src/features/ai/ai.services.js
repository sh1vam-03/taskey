import api from "@/services/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
                const response = await fetch(
                    `${BASE_URL}/ai/conversations/${conversationId}/message?stream=true`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ message, stream: true }),
                        credentials: "include",
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    let errorMsg = "Failed to send message";
                    try {
                        const errData = await response.json();
                        errorMsg = errData.message || errorMsg;
                    } catch (_) { /* ignore parse error */ }

                    const err = new Error(errorMsg);
                    err.status = response.status;
                    throw err;
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullText = "";

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });

                    // Parse SSE format: lines starting with "data: "
                    const lines = chunk.split("\n");
                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6);
                            if (data === "[DONE]") continue;
                            fullText += data;
                            onToken(data);
                        } else if (line.trim() && !line.startsWith(":")) {
                            // Raw text chunk (non-SSE format)
                            fullText += line;
                            onToken(line);
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
