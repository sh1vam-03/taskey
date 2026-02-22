'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import aiService from '@/features/ai/ai.services';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

const AiContext = createContext(null);

export function AiProvider({ children }) {
    const { user } = useAuth();
    const { success, error: showError } = useToast();

    // ─── Settings State ─────────────────────────────────────────
    const [settings, setSettings] = useState({
        provider: 'openai',
        sttLang: 'unknown',
        speaker: 'shubh',
        creditBalance: 0,
        plan: 'FREE',
        ttsLanguageMode: 'auto',
        availableProviders: [],
        availableSttLangs: [],
        availableSpeakers: [],
    });

    // ─── Conversations State ────────────────────────────────────
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [messages, setMessages] = useState([]);

    // ─── UI State ───────────────────────────────────────────────
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessingVoice, setIsProcessingVoice] = useState(false);
    const [voiceResponse, setVoiceResponse] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [error, setError] = useState(null);

    // Ref to hold abort function for active stream
    const abortStreamRef = useRef(null);

    // ─── Load Settings on Mount ─────────────────────────────────
    const loadSettings = useCallback(async () => {
        try {
            const data = await aiService.getAiSettings();
            setSettings(prev => ({ ...prev, ...data }));
        } catch (err) {
            console.error('Failed to load AI settings:', err);
        }
    }, []);

    // ─── Update Settings ────────────────────────────────────────
    const updateSettings = useCallback(async (patch) => {
        try {
            const data = await aiService.updateAiSettings(patch);
            setSettings(prev => ({ ...prev, ...data, ...patch }));
            success('Settings updated');
        } catch (err) {
            console.error('Failed to update settings:', err);
            showError('Failed to update settings');
        }
    }, [success, showError]);

    // ─── Load Conversations ─────────────────────────────────────
    const loadConversations = useCallback(async () => {
        try {
            setIsLoadingConversations(true);
            const data = await aiService.getConversations();
            setConversations(data || []);
        } catch (err) {
            console.error('Failed to load conversations:', err);
        } finally {
            setIsLoadingConversations(false);
        }
    }, []);

    // ─── Open Conversation ──────────────────────────────────────
    const openConversation = useCallback(async (id) => {
        setActiveConversationId(id);
        setMessages([]);
        setStreamingContent('');
        setIsStreaming(false);

        try {
            setIsLoadingMessages(true);
            const msgs = await aiService.getMessages(id);
            setMessages(msgs || []);
        } catch (err) {
            console.error('Failed to load messages:', err);
            showError('Failed to load messages');
        } finally {
            setIsLoadingMessages(false);
        }
    }, [showError]);

    // ─── Create New Conversation ────────────────────────────────
    const createNewConversation = useCallback(async (initialMessage) => {
        try {
            const data = await aiService.createConversation(initialMessage);
            const newConv = data.conversation || data;
            setConversations(prev => [newConv, ...prev]);
            setActiveConversationId(newConv.id);
            setMessages([]);
            return newConv;
        } catch (err) {
            console.error('Failed to create conversation:', err);
            showError('Failed to create new chat');
            throw err;
        }
    }, [showError]);

    // ─── Delete Conversation ────────────────────────────────────
    const deleteConversation = useCallback(async (id) => {
        try {
            await aiService.deleteConversation(id);
            setConversations(prev => prev.filter(c => c.id !== id));
            if (activeConversationId === id) {
                setActiveConversationId(null);
                setMessages([]);
            }
            success('Conversation deleted');
        } catch (err) {
            console.error('Failed to delete conversation:', err);
            showError('Failed to delete conversation');
        }
    }, [activeConversationId, success, showError]);

    // ─── Rename Conversation ────────────────────────────────────
    const renameConversation = useCallback(async (id, title) => {
        try {
            await aiService.updateConversation(id, title);
            setConversations(prev =>
                prev.map(c => c.id === id ? { ...c, title } : c)
            );
            success('Chat renamed');
        } catch (err) {
            console.error('Failed to rename conversation:', err);
            showError('Failed to rename chat');
        }
    }, [success, showError]);

    // ─── Send Message (with streaming) ──────────────────────────
    const sendMessage = useCallback(async (text) => {
        if (!text.trim()) return;

        let convId = activeConversationId;

        // Auto-create conversation if none active
        if (!convId) {
            try {
                const newConv = await createNewConversation();
                convId = newConv.id;
            } catch {
                return;
            }
        }

        // Optimistic: append user message immediately
        const userMsg = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: text,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMsg]);
        setIsSendingMessage(true);
        setIsStreaming(true);
        setStreamingContent('');
        setError(null);

        // Stream the response
        const abort = aiService.sendMessageStream(
            convId,
            text,
            // onToken
            (token) => {
                setStreamingContent(prev => prev + token);
            },
            // onDone
            (fullText) => {
                const assistantMsg = {
                    id: `msg-${Date.now()}`,
                    role: 'assistant',
                    content: fullText,
                    createdAt: new Date().toISOString(),
                };
                setMessages(prev => [...prev, assistantMsg]);
                setStreamingContent('');
                setIsStreaming(false);
                setIsSendingMessage(false);

                // Refresh conversation list to reorder by updatedAt
                loadConversations();
                // Refresh credits
                loadSettings();
            },
            // onError
            (err) => {
                console.error('Streaming error:', err);
                setIsStreaming(false);
                setIsSendingMessage(false);
                setStreamingContent('');

                if (err.status === 402) {
                    showError('Insufficient credits. Please upgrade your plan.');
                    setMessages(prev => [...prev, {
                        id: `err-${Date.now()}`,
                        role: 'assistant',
                        content: '⚠️ **Insufficient credits.** Please upgrade your plan to continue using AI features.',
                        createdAt: new Date().toISOString(),
                    }]);
                } else {
                    showError(err.message || 'Failed to get AI response');
                    setMessages(prev => [...prev, {
                        id: `err-${Date.now()}`,
                        role: 'assistant',
                        content: `⚠️ **Error**: ${err.message || 'Response interrupted. Please try again.'}`,
                        createdAt: new Date().toISOString(),
                    }]);
                }
            }
        );

        abortStreamRef.current = abort;
    }, [activeConversationId, createNewConversation, loadConversations, loadSettings, showError]);

    // ─── Send Voice Message ─────────────────────────────────────
    const sendVoiceMessage = useCallback(async (audioBlob) => {
        let convId = activeConversationId;

        if (!convId) {
            try {
                const newConv = await createNewConversation();
                convId = newConv.id;
            } catch {
                return;
            }
        }

        // Optimistic: show placeholder
        const placeholderMsg = {
            id: `voice-${Date.now()}`,
            role: 'user',
            content: '🎤 Processing audio...',
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, placeholderMsg]);
        setIsProcessingVoice(true);
        setError(null);

        try {
            const response = await aiService.sendVoiceMessage(convId, audioBlob);

            // Update user message with actual transcript
            setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.id === placeholderMsg.id);
                if (idx !== -1 && response.userText) {
                    updated[idx] = { ...updated[idx], content: response.userText };
                }
                // Add AI response
                updated.push({
                    id: `voice-reply-${Date.now()}`,
                    role: 'assistant',
                    content: response.reply,
                    createdAt: new Date().toISOString(),
                });
                return updated;
            });

            // Store voice response for audio playback
            if (response.audioUrl) {
                setVoiceResponse({ audioUrl: response.audioUrl });
            }

            // Refresh
            loadConversations();
            loadSettings();
        } catch (err) {
            console.error('Voice processing error:', err);
            const errMsg = err.response?.status === 402
                ? 'Insufficient credits for voice processing.'
                : (err.response?.data?.message || 'Voice processing failed.');
            showError(errMsg);
            setMessages(prev => [...prev, {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: `⚠️ **Error**: ${errMsg}`,
                createdAt: new Date().toISOString(),
            }]);
        } finally {
            setIsProcessingVoice(false);
        }
    }, [activeConversationId, createNewConversation, loadConversations, loadSettings, showError]);

    // ─── Stop Streaming ─────────────────────────────────────────
    const stopStreaming = useCallback(() => {
        if (abortStreamRef.current) {
            abortStreamRef.current();
            abortStreamRef.current = null;
        }
        if (streamingContent) {
            setMessages(prev => [...prev, {
                id: `stopped-${Date.now()}`,
                role: 'assistant',
                content: streamingContent + '\n\n*[Response stopped]*',
                createdAt: new Date().toISOString(),
            }]);
        }
        setIsStreaming(false);
        setStreamingContent('');
        setIsSendingMessage(false);
    }, [streamingContent]);

    // ─── Clear Error ────────────────────────────────────────────
    const clearError = useCallback(() => setError(null), []);

    // ─── Clear Voice Response ───────────────────────────────────
    const clearVoiceResponse = useCallback(() => setVoiceResponse(null), []);

    // ─── Init on User Login ─────────────────────────────────────
    useEffect(() => {
        if (user) {
            loadSettings();
            loadConversations();
        }
    }, [user, loadSettings, loadConversations]);

    const value = {
        // Settings
        settings,
        loadSettings,
        updateSettings,

        // Conversations
        conversations,
        activeConversationId,
        messages,
        openConversation,
        createNewConversation,
        deleteConversation,
        renameConversation,
        loadConversations,

        // Messaging
        sendMessage,
        stopStreaming,

        // Voice
        sendVoiceMessage,
        isRecording,
        setIsRecording,
        voiceResponse,
        clearVoiceResponse,

        // UI State
        isLoadingConversations,
        isLoadingMessages,
        isSendingMessage,
        isStreaming,
        streamingContent,
        isProcessingVoice,
        isSettingsOpen,
        setIsSettingsOpen,

        // Error
        error,
        clearError,
    };

    return (
        <AiContext.Provider value={value}>
            {children}
        </AiContext.Provider>
    );
}

export { AiContext };

export function useAiContext() {
    const ctx = useContext(AiContext);
    if (!ctx) throw new Error('useAiContext must be used within AiProvider');
    return ctx;
}
