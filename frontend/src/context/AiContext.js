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

    // Real-time voice preview
    liveTranscript: '',

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

        case 'SET_LIVE_TRANSCRIPT':
            return { ...state, liveTranscript: action.payload };

        case 'APPEND_OR_UPDATE_LIVE_MESSAGE':
            // If the last message is a temporary live message, update it. Otherwise append.
            const lastMsg = state.messages[state.messages.length - 1];
            if (lastMsg && lastMsg.id === 'live-session') {
                return {
                    ...state,
                    messages: state.messages.map(m =>
                        m.id === 'live-session' ? { ...m, content: action.payload } : m
                    )
                };
            }
            return {
                ...state,
                messages: [...state.messages, {
                    id: 'live-session',
                    role: 'user',
                    content: action.payload,
                    createdAt: new Date().toISOString()
                }]
            };

        case 'FINALIZE_LIVE_MESSAGE':
            return {
                ...state,
                messages: state.messages.map(m =>
                    m.id === 'live-session' ? { ...m, id: `user-${Date.now()}` } : m
                )
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

    // Voice streaming refs
    const audioQueueRef = useRef([]);
    const isPlayingAudioRef = useRef(false);
    const audioAbortControllerRef = useRef(null);

    /**
     * Splits text into sentences and triggers TTS for each.
     */
    const playVoiceStream = useCallback(async (fullText, isFinal = false) => {
        // Use a persistent ref to keep track of what we've already sent to TTS
        if (!window.__voiceState) window.__voiceState = { processedIndex: 0, pendingText: '' };

        const newText = fullText.substring(window.__voiceState.processedIndex);
        window.__voiceState.processedIndex = fullText.length;
        window.__voiceState.pendingText += newText;

        // Split by sentence boundaries: . ! ? or newline
        const sentences = window.__voiceState.pendingText.split(/([.!?\n]+)/);

        // The last element might be an incomplete sentence unless isFinal is true
        let completeSentences = [];
        for (let i = 0; i < sentences.length - 1; i += 2) {
            const sentence = (sentences[i] + (sentences[i + 1] || '')).trim();
            if (sentence) completeSentences.push(sentence);
        }

        if (isFinal) {
            const last = sentences[sentences.length - 1]?.trim();
            if (last) completeSentences.push(last);
            window.__voiceState.pendingText = '';
        } else {
            window.__voiceState.pendingText = sentences[sentences.length - 1] || '';
        }

        for (const text of completeSentences) {
            if (text.length < 2) continue; // skip very short fragments

            try {
                const chunk = await aiService.synthesizeSpeech(text, state.settings.speaker);
                if (chunk?.audioUrl) {
                    audioQueueRef.current.push(chunk.audioUrl);
                    processAudioQueue();
                }
            } catch (err) {
                console.error('[VoiceStream] TTS chunk failed:', err);
            }
        }
    }, [state.settings.speaker]);

    const processAudioQueue = useCallback(() => {
        if (isPlayingAudioRef.current || audioQueueRef.current.length === 0) return;

        isPlayingAudioRef.current = true;
        const audioUrl = audioQueueRef.current.shift();
        const audio = new Audio(audioUrl);

        audio.onended = () => {
            isPlayingAudioRef.current = false;
            processAudioQueue();
        };

        audio.onerror = () => {
            isPlayingAudioRef.current = false;
            processAudioQueue();
        };

        audio.play().catch(e => {
            console.warn('[VoiceStream] Audio play failed:', e);
            isPlayingAudioRef.current = false;
            processAudioQueue();
        });
    }, []);

    const stopVoiceAudio = useCallback(() => {
        audioQueueRef.current = [];
        isPlayingAudioRef.current = false;
        // Ideally we'd keep track of the current Audio object to stop it
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
    const sendMessage = useCallback(async (text, isVoiceMode = false) => {
        let convId = state.activeConversationId;
        if (!text.trim()) return;

        if (isVoiceMode) {
            window.__voiceState = { processedIndex: 0, pendingText: '' };
            stopVoiceAudio();
        }

        // Auto-create conversation if none active
        if (!convId) {
            convId = await createNewConversation();
            if (!convId) return;
        }

        // Optimistic user bubble
        const optimisticUserMsg = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
            createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'APPEND_MESSAGE', payload: optimisticUserMsg });
        dispatch({ type: 'SET_LOADING', key: 'isSendingMessage', value: true });
        dispatch({ type: 'SET_STREAMING', payload: true });

        const abortController = new AbortController();
        audioAbortControllerRef.current = abortController;

        aiService.sendMessageStream(
            convId,
            text,
            (token) => dispatch({ type: 'APPEND_STREAM_TOKEN', payload: token }),
            (fullText) => {
                dispatch({ type: 'STREAM_DONE', payload: fullText });
                if (isVoiceMode) playVoiceStream(fullText, true);
                loadConversations();
                loadSettings(); // refresh credit balance
            },
            (err) => {
                dispatch({ type: 'SET_STREAMING', payload: false });
                dispatch({ type: 'SET_LOADING', key: 'isSendingMessage', value: false });

                const status = err?.status || err?.response?.status || 500;
                let displayMsg;
                if (status === 402) {
                    displayMsg = '⚠️ **Your AI credits are finished.** Please top-up credits now to continue using the AI assistant.';
                } else if (status === 503) {
                    displayMsg = '⚠️ **This model is currently not available.** Please use a different AI model from settings.';
                } else {
                    displayMsg = '⚠️ **Internal server error.** Please try again or use a different AI model.';
                }

                dispatch({ type: 'SET_ERROR', payload: displayMsg });
            },
            abortController.signal
        );
        return () => abortController.abort();
    }, [state.activeConversationId, createNewConversation, loadConversations, loadSettings, playVoiceStream, stopVoiceAudio]);

    /**
     * Full voice pipeline.
     */
    const sendVoiceMessage = useCallback(async (audioBlob) => {
        let convId = state.activeConversationId;

        if (!convId) {
            convId = await createNewConversation();
            if (!convId) return;
        }

        dispatch({ type: 'SET_LOADING', key: 'isProcessingVoice', value: true });

        try {
            // 1. Transcribe Only (Saaras v3)
            const res = await aiService.transcribeAudio(audioBlob);
            const userText = res.data?.text || res.text;

            if (!userText?.trim()) {
                throw new Error("Could not understand audio. Please check your microphone and try speaking more clearly.");
            }

            // Update chat with real transcript
            dispatch({ type: 'APPEND_OR_UPDATE_LIVE_MESSAGE', payload: userText });
            dispatch({ type: 'FINALIZE_LIVE_MESSAGE' });
            dispatch({ type: 'SET_LOADING', key: 'isProcessingVoice', value: false });

            // 2. Start Streaming AI Response with Chunked TTS
            window.__voiceState = { processedIndex: 0, pendingText: '' };
            stopVoiceAudio();

            dispatch({ type: 'SET_STREAMING', payload: true });

            const abortController = new AbortController();
            audioAbortControllerRef.current = abortController;

            aiService.sendMessageStream(
                convId,
                userText,
                (token) => {
                    dispatch({ type: 'APPEND_STREAM_TOKEN', payload: token });
                },
                (fullText) => {
                    dispatch({ type: 'STREAM_DONE', payload: fullText });
                    playVoiceStream(fullText, true);
                    loadConversations();
                    loadSettings();
                },
                (err) => {
                    dispatch({ type: 'SET_STREAMING', payload: false });
                    dispatch({ type: 'SET_LOADING', key: 'isSendingMessage', value: false });
                    dispatch({ type: 'SET_ERROR', payload: err.message || 'Voice processing failed' });
                },
                abortController.signal
            );

        } catch (err) {
            console.error('Voice message failed:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Voice processing failed';
            const isTimeout = errorMsg.includes('timeout') || errorMsg.includes('fetch failed');

            const displayMsg = isTimeout
                ? '🎤 **Connection Timeout**: The AI service is currently unreachable. Please check your internet or try another model.'
                : `🎤 Voice message failed: ${errorMsg}`;

            dispatch({ type: 'APPEND_OR_UPDATE_LIVE_MESSAGE', payload: displayMsg });
            dispatch({ type: 'FINALIZE_LIVE_MESSAGE' });
            dispatch({ type: 'SET_LOADING', key: 'isProcessingVoice', value: false });
            dispatch({ type: 'SET_ERROR', payload: displayMsg });
        }
    }, [state.activeConversationId, createNewConversation, loadConversations, loadSettings, playVoiceStream, stopVoiceAudio]);

    const stopStreaming = useCallback(() => {
        if (audioAbortControllerRef.current) {
            audioAbortControllerRef.current.abort();
            audioAbortControllerRef.current = null;
        }
        stopVoiceAudio();

        if (state.streamingContent) {
            dispatch({ type: 'STREAM_DONE', payload: state.streamingContent + '\n\n*[Response stopped]*' });
        } else {
            dispatch({ type: 'SET_STREAMING', payload: false });
            dispatch({ type: 'SET_LOADING', key: 'isSendingMessage', value: false });
        }
    }, [state.streamingContent, stopVoiceAudio]);

    const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);
    const clearVoiceResponse = useCallback(() => dispatch({ type: 'SET_VOICE_RESPONSE', payload: null }), []);

    // ── Init on mount ─────────────────────────────────────────
    useEffect(() => {
        loadSettings();
        loadConversations();

        return () => {
            stopVoiceAudio();
            if (audioAbortControllerRef.current) {
                audioAbortControllerRef.current.abort();
            }
        };
    }, [loadSettings, loadConversations, stopVoiceAudio]);

    // Use a reference to latest tokens for the voice stream playback
    useEffect(() => {
        if (state.isStreaming && window.__voiceState) {
            playVoiceStream(state.streamingContent);
        }
    }, [state.streamingContent, state.isStreaming, playVoiceStream]);

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
        setIsRecording: (v) => {
            if (v) dispatch({ type: 'APPEND_OR_UPDATE_LIVE_MESSAGE', payload: '🎤 Listening...' });
            else dispatch({ type: 'SET_LIVE_TRANSCRIPT', payload: '' });
            dispatch({ type: 'SET_LOADING', key: 'isRecording', value: v });
        },
        updateLiveTranscript: (text) => {
            dispatch({ type: 'SET_LIVE_TRANSCRIPT', payload: text });
            if (text.trim()) {
                dispatch({ type: 'APPEND_OR_UPDATE_LIVE_MESSAGE', payload: `🎤 ${text}` });
            }
        },
    };

    return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
}

export { AiContext };

export function useAiContext() {
    const ctx = useContext(AiContext);
    if (!ctx) throw new Error('useAiContext must be used within AiProvider');
    return ctx;
}
