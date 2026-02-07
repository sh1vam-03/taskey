import api from "@/services/api";

export const aiService = {
    // Create or Start Conversation
    createConversation: async (initialMessage) => {
        const response = await api.post("/ai/conversations", { message: initialMessage });
        return response.data;
    },

    // Get All Conversations
    getConversations: async () => {
        const response = await api.get("/ai/conversations");
        return response.data;
    },

    // Get Messages for a Conversation
    getMessages: async (conversationId) => {
        const response = await api.get(`/ai/conversations/${conversationId}/messages`);
        return response.data;
    },

    // Send Message
    sendMessage: async (conversationId, message) => {
        const response = await api.post(`/ai/conversations/${conversationId}/message`, { message });
        return response.data;
    }
};
