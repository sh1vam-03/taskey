'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import aiService from '@/services/ai.service';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

const AiContext = createContext();

export function AiProvider({ children }) {
    const { user } = useAuth();
    const { success, error } = useToast();
    const [conversations, setConversations] = useState([]);
    const [currentConv, setCurrentConv] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await aiService.getConversations();
            setConversations(data);
            // Optional: Auto-select first conversation if exists and none selected
            if (data.length > 0 && !currentConv) {
                setCurrentConv(data[0]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createNewChat = async (initialMessage = "New Conversation") => {
        try {
            const newConv = await aiService.createConversation(initialMessage);
            setConversations([newConv.conversation, ...conversations]);
            setCurrentConv(newConv.conversation);
            return newConv.conversation;
        } catch (err) {
            console.error(err);
            error("Failed to create new chat");
            throw err;
        }
    };

    const renameChat = async (id, newTitle) => {
        try {
            await aiService.updateConversation(id, newTitle);
            const updated = conversations.map(c =>
                c.id === id ? { ...c, title: newTitle } : c
            );
            setConversations(updated);
            if (currentConv?.id === id) {
                setCurrentConv({ ...currentConv, title: newTitle });
            }
            success("Chat renamed");
        } catch (err) {
            console.error(err);
            error("Failed to rename chat");
        }
    };

    const deleteConversation = async (id) => {
        try {
            await aiService.deleteConversation(id);
            const updated = conversations.filter(c => c.id !== id);
            setConversations(updated);
            if (currentConv?.id === id) {
                setCurrentConv(updated[0] || null);
            } // If deleted logic matches current, switch
            success("Conversation deleted");
        } catch (err) {
            console.error(err);
            error("Failed to delete conversation");
        }
    };

    return (
        <AiContext.Provider value={{
            conversations,
            currentConv,
            setCurrentConv,
            loading,
            loadConversations,
            createNewChat,
            deleteConversation,
            renameChat
        }}>
            {children}
        </AiContext.Provider>
    );
}

export function useAi() {
    return useContext(AiContext);
}
