'use client';

import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import aiService from '@/features/ai/ai.services';

const AiContext = createContext(null);

// ── Initial State ─────────────────────────────────────────────

const initialState = {
    // Settings — loaded once on mount, updated on PATCH response
    settings: {
        chatModel: 'gemini-1.5-flash',
        voiceModel: 'gemini-1.5-flash',
        ttsModel: 'bulbul:v3',
        sttModel: 'saaras:v3',
        sttLang: 'unknown',
        speaker: 'shubh',
        creditBalance: 0,
        plan: 'FREE',

        // Catalog arrays — populated from GET /settings
        availableChatModels: [],
        availableVoiceModels: [],
        availableTtsModels: [],
        availableSttModels: [],
        availableSttLangs: [],
        availableSpeakers: [],
        ttsLanguageMode: 'auto',
    },

    // Conversations
    conversations: [],
    activeConversationId: null,
    messages: [],

    // Loading states
    isLoadingSettings: false,
    isLoadingConversations: false,
    isLoadingMessages: false,
    isSendingMessage: false,
    isStreaming: false,
    streamingContent: '',
    isRecording: false,
    isProcessingVoice: false,

    // Voice response from last voice call
    voiceResponse: null,

    // Settings panel open state
    isSettingsOpen: false,

    // Error
    error: null,
};

// ── Reducer ───────────────────────────────────────────────────

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_SETTINGS':
            return { ...state, settings: { ...state.settings, ...action.payload }, isLoadingSettings: false };

        case 'SET_CONVERSATIONS':
            return { ...state, conversations: action.payload, isLoadingConversations: false };

        case 'SET_ACTIVE_CONVERSATION':
            if (state.activeConversationId === action.payload) {
                return state;
            }
            return { ...state, activeConversationId: action.payload, messages: [], streamingContent: '' };

        case 'SET_MESSAGES':
            return { ...state, messages: action.payload, isLoadingMessages: false };

        case 'APPEND_MESSAGE':
            return { ...state, messages: [...state.messages, action.payload] };

        case 'UPDATE_LAST_USER_MESSAGE':
            return {
                ...state,
                messages: state.messages.map((m, i) =>
                    i === state.messages.length - 1 && m.role === 'user'
                        ? { ...m, content: action.payload }
                        : m
                ),
            };

        case 'SET_STREAMING':
            return { ...state, isStreaming: action.payload, streamingContent: action.payload ? state.streamingContent : '' };

        case 'APPEND_STREAM_TOKEN':
            return { ...state, streamingContent: state.streamingContent + action.payload };

        case 'STREAM_DONE':
            return {
                ...state,
                isStreaming: false,
                streamingContent: '',
                isSendingMessage: false,
                messages: [
                    ...state.messages,
                    { id: Date.now().toString(), role: 'assistant', content: action.payload, createdAt: new Date().toISOString() },
                ],
            };

        case 'SET_VOICE_RESPONSE':
            return { ...state, voiceResponse: action.payload, isProcessingVoice: false };

        case 'UPDATE_CONVERSATION_IN_LIST': {
            const updated = action.payload;
            return {
                ...state,
                conversations: state.conversations.map(c => c.id === updated.id ? { ...c, ...updated } : c),
            };
        }

        case 'REMOVE_CONVERSATION':
            return {
                ...state,
                conversations: state.conversations.filter(c => c.id !== action.payload),
                activeConversationId: state.activeConversationId === action.payload ? null : state.activeConversationId,
            };

        case 'ADD_CONVERSATION':
            return { ...state, conversations: [action.payload, ...state.conversations] };

        case 'SET_LOADING':
            return { ...state, [action.key]: action.value };

        case 'SET_ERROR':
            return { ...state, error: action.payload };

        case 'CLEAR_ERROR':
            return { ...state, error: null };

        default:
            return state;
    }
};

// ── Provider ──────────────────────────────────────────────────

export function AiProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const hasInitializedRef = useRef(false);

    // Load settings on mount
    const loadSettings = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', key: 'isLoadingSettings', value: true });
        try {
            const data = await aiService.getAiSettings();
            dispatch({ type: 'SET_SETTINGS', payload: data });
        } catch (err) {
            console.error('Failed to load AI settings:', err);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load AI settings' });
        }
    }, []);

    /**
     * Updates any subset of model settings.
     * Accepts: { chatModel?, voiceModel?, ttsModel?, sttModel?, sttLang?, speaker? }
     */
    const updateSettings = useCallback(async (patch) => {
        try {
            await aiService.updateAiSettings(patch);
            // Refresh full settings to get updated catalog data
            const fresh = await aiService.getAiSettings();
            dispatch({ type: 'SET_SETTINGS', payload: fresh });
        } catch {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to update settings' });
        }
    }, []);

    const openConversation = useCallback(async (id) => {
        dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: id });
        if (!id) return; // Allow opening "null" for New Chats

        dispatch({ type: 'SET_LOADING', key: 'isLoadingMessages', value: true });
        try {
            const data = await aiService.getMessages(id);
            dispatch({ type: 'SET_MESSAGES', payload: data || [] });
        } catch {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load messages' });
        }
    }, []);

    const loadConversations = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', key: 'isLoadingConversations', value: true });
        try {
            const data = await aiService.getConversations();
            dispatch({ type: 'SET_CONVERSATIONS', payload: data || [] });

            // Auto-load most recent conversation on init if none is active
            if (!hasInitializedRef.current) {
                hasInitializedRef.current = true;
                if (data?.length > 0) {
                    openConversation(data[0].id);
                }
            }
        } catch {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load conversations' });
        }
    }, [openConversation]);

    const createNewConversation = useCallback(async () => {
        try {
            const data = await aiService.createConversation();
            const conv = data.conversation || data;
            dispatch({ type: 'ADD_CONVERSATION', payload: conv });
            dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conv.id });
            dispatch({ type: 'SET_MESSAGES', payload: [] });
            return conv.id;
        } catch {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to create conversation' });
        }
    }, []);

    const renameConversation = useCallback(async (id, title) => {
        try {
            await aiService.updateConversation(id, title);
            dispatch({ type: 'UPDATE_CONVERSATION_IN_LIST', payload: { id, title } });
        } catch {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to rename conversation' });
        }
    }, []);

    const deleteConversation = useCallback(async (id) => {
        try {
            await aiService.deleteConversation(id);
            dispatch({ type: 'REMOVE_CONVERSATION', payload: id });
        } catch {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to delete conversation' });
        }
    }, []);

    /**
     * Sends a text message with streaming.
     * Optimistically appends user bubble immediately, then streams AI response.
     */
    const sendMessage = useCallback(async (text) => {
        let convId = state.activeConversationId;
        if (!text.trim()) return;

        // Auto-create conversation if none active
        if (!convId) {
            convId = await createNewConversation();
            if (!convId) return;
        }

        // Optimistic user bubble
        const optimisticUserMsg = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: text,
            createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'APPEND_MESSAGE', payload: optimisticUserMsg });
        dispatch({ type: 'SET_LOADING', key: 'isSendingMessage', value: true });
        dispatch({ type: 'SET_STREAMING', payload: true });

        aiService.sendMessageStream(
            convId,
            text,
            (token) => dispatch({ type: 'APPEND_STREAM_TOKEN', payload: token }),
            (fullText) => {
                dispatch({ type: 'STREAM_DONE', payload: fullText });

                loadConversations();
                loadSettings(); // refresh credit balance
            },
            (err) => {
                dispatch({ type: 'SET_STREAMING', payload: false });
                dispatch({ type: 'SET_LOADING', key: 'isSendingMessage', value: false });

                const errMsg = typeof err === 'string' ? err : err?.message || 'Failed to get AI response';
                const status = err?.status;

                if (status === 402) {
                    dispatch({
                        type: 'APPEND_MESSAGE', payload: {
                            id: `err-${Date.now()}`, role: 'assistant',
                            content: '⚠️ **Insufficient credits.** Please upgrade your plan to continue.',
                            createdAt: new Date().toISOString(),
                        }
                    });
                } else {
                    dispatch({
                        type: 'APPEND_MESSAGE', payload: {
                            id: `err-${Date.now()}`, role: 'assistant',
                            content: `⚠️ **Error**: ${errMsg}`,
                            createdAt: new Date().toISOString(),
                        }
                    });
                }
                dispatch({ type: 'SET_ERROR', payload: errMsg });
            }
        );
    }, [state.activeConversationId, createNewConversation, loadConversations, loadSettings]);

    /**
     * Full voice pipeline.
     * Optimistically shows "🎤 Processing audio..." then replaces with real transcript.
     */
    const sendVoiceMessage = useCallback(async (audioBlob) => {
        let convId = state.activeConversationId;

        if (!convId) {
            convId = await createNewConversation();
            if (!convId) return;
        }

        const placeholderMsg = {
            id: `voice-temp-${Date.now()}`,
            role: 'user',
            content: '🎤 Processing audio...',
            createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'APPEND_MESSAGE', payload: placeholderMsg });
        dispatch({ type: 'SET_LOADING', key: 'isProcessingVoice', value: true });

        try {
            const res = await aiService.sendVoiceMessage(convId, audioBlob);
            const data = res.data || res;
            const { userText, reply, audioUrl, billing, models } = data;

            // Replace placeholder with real transcript
            dispatch({ type: 'UPDATE_LAST_USER_MESSAGE', payload: userText || '🎤 Voice message' });

            // Add AI response
            dispatch({
                type: 'APPEND_MESSAGE',
                payload: { id: `ai-${Date.now()}`, role: 'assistant', content: reply, createdAt: new Date().toISOString() },
            });

            // Store audio + billing info for VoicePlayer
            dispatch({ type: 'SET_VOICE_RESPONSE', payload: { audioUrl, userText, reply, billing, models } });

            loadConversations();
            loadSettings();
        } catch (err) {
            dispatch({ type: 'UPDATE_LAST_USER_MESSAGE', payload: '🎤 Voice message failed' });
            dispatch({ type: 'SET_LOADING', key: 'isProcessingVoice', value: false });
            dispatch({ type: 'SET_ERROR', payload: 'Voice processing failed' });
        }
    }, [state.activeConversationId, createNewConversation, loadConversations, loadSettings]);

    const stopStreaming = useCallback(() => {
        // No abort ref in reducer pattern — just commit what we have
        if (state.streamingContent) {
            dispatch({ type: 'STREAM_DONE', payload: state.streamingContent + '\n\n*[Response stopped]*' });
        } else {
            dispatch({ type: 'SET_STREAMING', payload: false });
            dispatch({ type: 'SET_LOADING', key: 'isSendingMessage', value: false });
        }
    }, [state.streamingContent]);

    const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);
    const clearVoiceResponse = useCallback(() => dispatch({ type: 'SET_VOICE_RESPONSE', payload: null }), []);

    // ── Init on mount ─────────────────────────────────────────
    useEffect(() => {
        loadSettings();
        loadConversations();
    }, [loadSettings, loadConversations]);

    const value = {
        ...state,
        loadSettings,
        updateSettings,
        loadConversations,
        openConversation,
        createNewConversation,
        renameConversation,
        deleteConversation,
        sendMessage,
        sendVoiceMessage,
        stopStreaming,
        clearError,
        clearVoiceResponse,
        setIsSettingsOpen: (v) => dispatch({ type: 'SET_LOADING', key: 'isSettingsOpen', value: v }),
        setIsRecording: (v) => dispatch({ type: 'SET_LOADING', key: 'isRecording', value: v }),
    };

    return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
}

export { AiContext };

export function useAiContext() {
    const ctx = useContext(AiContext);
    if (!ctx) throw new Error('useAiContext must be used within AiProvider');
    return ctx;
}
