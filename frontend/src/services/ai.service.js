import api from "./api";

const aiService = {
    /**
     * Get all conversations
     */
    async getConversations() {
        const response = await api.get("/ai/conversations");
        return response.data.data || [];
    },

    /**
     * Create a new conversation
     * @param {string} title - Optional title
     */
    async createConversation(title) {
        const response = await api.post("/ai/conversations", { title });
        return response.data.data;
    },

    /**
     * Get messages for a conversation
     * @param {string} conversationId
     */
    async getMessages(conversationId) {
        const response = await api.get(`/ai/conversations/${conversationId}/messages`);
        return response.data.data || [];
    },

    /**
     * Send a message to a conversation
     * @param {string} conversationId
     * @param {string} message - User's message text
     */
    async sendMessage(conversationId, message) {
        const response = await api.post(`/ai/conversations/${conversationId}/message`, { message });
        return response.data.data; // Returns AI message object
    },

    /**
     * Send message with streaming response
     * Yields text chunks
     */
    async *sendMessageStream(conversationId, message) {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${baseURL}/ai/conversations/${conversationId}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add Authorization if using Bearer, but we rely on Cookies/Axios normally.
                // Fetch needs credentials: 'include' for cookies.
            },
            body: JSON.stringify({ message, stream: true }),
            credentials: 'include'
        });

        if (!response.ok) {
            // Try to parse error
            let errorMsg = "Failed to send message";
            try {
                const errData = await response.json();
                errorMsg = errData.message || errorMsg;
            } catch (e) { }

            // Check for 429 specifically
            if (response.status === 429) {
                const err = new Error(errorMsg);
                err.status = 429; // Tag it
                throw err;
            }
            throw new Error(errorMsg);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            yield chunk;
        }
    },

    /**
     * Delete a conversation
     * @param {string} conversationId
     */
    async deleteConversation(conversationId) {
        const response = await api.delete(`/ai/conversations/${conversationId}`);
        return response.data;
    },

    /**
     * Send voice audio to conversation
     * @param {string} conversationId 
     * @param {Blob} audioBlob 
     */
    async sendVoiceMessage(conversationId, audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice.webm');

        const response = await api.post(`/ai/conversations/${conversationId}/voice`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.data;
    }
};

export default aiService;
