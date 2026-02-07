import { useState, useCallback } from "react";
import { aiService } from "./ai.services";

export const useAi = () => {
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);

    // Load History
    const loadConversations = useCallback(async () => {
        try {
            setLoading(true);
            const data = await aiService.getConversations();
            setConversations(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load Specific Chat
    const loadMessages = useCallback(async (id) => {
        try {
            setLoading(true);
            setActiveConversationId(id);
            const data = await aiService.getMessages(id);
            setMessages(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Send Message
    const sendMessage = async (text, conversationId = activeConversationId) => {
        try {
            setSending(true);

            // Optimistic Update
            const tempId = Date.now();
            const optimisticMsg = { id: tempId, role: "user", content: text, createdAt: new Date().toISOString() };
            setMessages(prev => [...prev, optimisticMsg]);

            let response;
            if (!conversationId) {
                // Create new if none exists
                response = await aiService.createConversation(text);
                setConversations(prev => [response.conversation, ...prev]);
                setActiveConversationId(response.conversation.id);
                // AI response is likely in response.message or we need to fetch?
                // Assuming response structure: { conversation, message, ... }
                if (response.message) {
                    setMessages([optimisticMsg, response.message]);
                } else {
                    // Fallback if needed
                    await loadMessages(response.conversation.id);
                }
            } else {
                response = await aiService.sendMessage(conversationId, text);
                // Append AI response
                setMessages(prev => [...prev.filter(m => m.id !== tempId), optimisticMsg, response.data]);
            }

        } catch (err) {
            setError(err.message);
            // Rollback optimistic update if strictly needed, but simple error toast is usually fine for MVP
        } finally {
            setSending(false);
        }
    };

    return {
        conversations,
        messages,
        activeConversationId,
        loading,
        sending,
        error,
        loadConversations,
        loadMessages,
        sendMessage
    };
};
