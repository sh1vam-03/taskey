import api from "./api";

const aiService = {
    /**
     * Get all conversations
     */
    async getConversations() {
        const response = await api.get("/ai/conversations");
        return response.data; // Assuming backend returns array or { data: [] }
    },

    /**
     * Create a new conversation
     * @param {string} title - Optional title
     */
    async createConversation(title) {
        const response = await api.post("/ai/conversations", { title });
        return response.data;
    },

    /**
     * Get messages for a conversation
     * @param {string} conversationId
     */
    async getMessages(conversationId) {
        const response = await api.get(`/ai/conversations/${conversationId}/messages`);
        return response.data;
    },

    /**
     * Send a message to a conversation
     * @param {string} conversationId
     * @param {string} message - User's message text
     */
    async sendMessage(conversationId, message) {
        const response = await api.post(`/ai/conversations/${conversationId}/message`, { message });
        return response.data; // Returns AI response
    },

    /**
     * Delete a conversation
     * @param {string} conversationId
     */
    async deleteConversation(conversationId) {
        const response = await api.delete(`/ai/conversations/${conversationId}`);
        return response.data;
    }
};

export default aiService;
