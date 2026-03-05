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
    isChatNotFound: false,
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

        case 'ADD_WARNING_MESSAGE':
            return {
                ...state,
                messages: [
                    ...state.messages,
                    { id: `warning-${Date.now()}`, role: 'assistant', content: action.payload, createdAt: new Date().toISOString() }
                ]
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
            return { ...state, error: action.payload, isChatNotFound: action.isNotFound || false };

        case 'CLEAR_ERROR':
            return { ...state, error: null, isChatNotFound: false };

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
    const currentAudioRef = useRef(null); // Track the currently playing Audio object

    // Synthesis Throttling & Queueing
    const pendingSynthesisQueueRef = useRef([]);
    const activeSynthesisCountRef = useRef(0);
    const MAX_CONCURRENT_SYNTHESIS = 3;

    const processSynthesisQueue = useCallback(async () => {
        if (activeSynthesisCountRef.current >= MAX_CONCURRENT_SYNTHESIS || pendingSynthesisQueueRef.current.length === 0) {
            return;
        }

        const task = pendingSynthesisQueueRef.current.shift();
        activeSynthesisCountRef.current++;

        const synthesizeWithRetry = async (text, speaker, attempts = 0) => {
            try {
                const result = await aiService.synthesizeSpeech(text, speaker);
                if (!result?.audioUrl) throw new Error("Missing audioUrl");
                return result;
            } catch (err) {
                if (attempts < 2) {
                    console.warn(`[VoiceStream] TTS retry ${attempts + 1} for: ${text.substring(0, 30)}...`);
                    // Small delay before retry
                    await new Promise(r => setTimeout(r, 500 * (attempts + 1)));
                    return synthesizeWithRetry(text, speaker, attempts + 1);
                }
                throw err;
            }
        };

        try {
            const result = await synthesizeWithRetry(task.text, task.speaker);
            task.resolve(result);
        } catch (err) {
            console.error('[VoiceStream] TTS failed after retries:', err);
            task.resolve(null); // Resolve with null so the playback queue can skip it safely
        } finally {
            activeSynthesisCountRef.current--;
            processSynthesisQueue(); // Trigger next task
        }
    }, [state.settings.speaker]);

    const playAndRemoveNext = useCallback(async () => {
        if (isPlayingAudioRef.current || audioQueueRef.current.length === 0) return;

        isPlayingAudioRef.current = true;

        // Grab the *promise* or *object* from the front of the queue
        const item = audioQueueRef.current[0];

        try {
            // Await the item in case the API call is still inflight
            const synthesizedAudio = await item.promise;

            if (!synthesizedAudio?.audioUrl) {
                // If it failed/returned empty, remove from queue and proceed to next
                audioQueueRef.current.shift();
                isPlayingAudioRef.current = false;
                playAndRemoveNext();
                return;
            }

            // Create and pre-load the HTMLAudioElement
            const audio = new Audio(synthesizedAudio.audioUrl);
            audio.preload = "auto";
            currentAudioRef.current = audio;

            audio.onended = () => {
                isPlayingAudioRef.current = false;
                currentAudioRef.current = null;
                audioQueueRef.current.shift(); // Remove only AFTER playing
                playAndRemoveNext(); // Play next
            };

            audio.onerror = () => {
                isPlayingAudioRef.current = false;
                currentAudioRef.current = null;
                audioQueueRef.current.shift();
                playAndRemoveNext();
            };

            await audio.play();

        } catch (err) {
            console.error('[VoiceStream] Audio playback/fetch failed:', err);
            isPlayingAudioRef.current = false;
            currentAudioRef.current = null;
            audioQueueRef.current.shift();
            playAndRemoveNext();
        }

    }, []);

    /**
     * Splits text into sentences and triggers TTS sequentially for each.
     */
    const playVoiceStream = useCallback(async (fullText, isFinal = false) => {
        // Only run if we actually started a voice session
        if (!window.__voiceState || typeof window.__voiceState !== 'object') return;

        const newText = fullText.substring(window.__voiceState.processedIndex);
        window.__voiceState.processedIndex = fullText.length;
        window.__voiceState.pendingText += newText;

        // Split by sentence boundaries and commas: . , ! ? or newline
        // Adding comma (,) makes chunks much smaller, allowing Sarvam to return audio much faster
        // which eliminates latency between sentences.
        const sentences = window.__voiceState.pendingText.split(/([.,!?\n]+)/);

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

            // 1) Create a deferred promise that will be resolved by the synthesis manager
            let resolvePromise;
            const fetchPromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });

            // 2) Push to the internal synthesis worker queue
            pendingSynthesisQueueRef.current.push({
                text,
                speaker: state.settings.speaker,
                resolve: resolvePromise
            });

            // 3) Push the pending promise into the strictly-ordered timeline queue!
            audioQueueRef.current.push({ text, promise: fetchPromise });
        }

        // 4) Start synthesis workers
        for (let i = 0; i < MAX_CONCURRENT_SYNTHESIS; i++) {
            processSynthesisQueue();
        }

        // 5) Nudge the playback loop. It will await the promise at the front of the queue.
        playAndRemoveNext();

    }, [playAndRemoveNext, processSynthesisQueue, state.settings.speaker]);

    // OBSOLETE - replaced by playAndRemoveNext
    // Keeping stopVoiceAudio intact below.

    const stopVoiceAudio = useCallback(() => {
        audioQueueRef.current = [];
        pendingSynthesisQueueRef.current = []; // Clear pending synthesis too
        isPlayingAudioRef.current = false;
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
            currentAudioRef.current = null;
        }
    }, []);

    const openConversation = useCallback(async (id) => {
        // Just set the active ID, the layout/page will trigger message loading if needed
        // or we can load it here if we want it to be centralized.
        // Let's keep it here but ensure we clear messages if ID is null.
        dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: id });
        if (!id) {
            dispatch({ type: 'SET_MESSAGES', payload: [] });
            dispatch({ type: 'CLEAR_ERROR' });
            return;
        }

        dispatch({ type: 'SET_LOADING', key: 'isLoadingMessages', value: true });
        try {
            const data = await aiService.getMessages(id);
            dispatch({ type: 'SET_MESSAGES', payload: data || [] });
            dispatch({ type: 'CLEAR_ERROR' });
        } catch (err) {
            const isNotFound = err.response?.status === 404;
            dispatch({
                type: 'SET_ERROR',
                payload: isNotFound ? 'Conversation not found' : 'Failed to load messages',
                isNotFound
            });
        }
    }, []);

    const loadConversations = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', key: 'isLoadingConversations', value: true });
        try {
            const data = await aiService.getConversations();
            dispatch({ type: 'SET_CONVERSATIONS', payload: data || [] });

            // Remove automatic loading of most recent conversation.
            // We want /dashboard/ai to be a new chat by default.
            if (!hasInitializedRef.current) {
                hasInitializedRef.current = true;
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
        } else {
            // Nullify voice state so the text streaming useEffect doesn't trigger voice
            window.__voiceState = null;
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
            "TEXT",
            (token, currentFullText) => {
                dispatch({ type: 'APPEND_STREAM_TOKEN', payload: token });
                if (isVoiceMode) {
                    playVoiceStream(currentFullText, false);
                }
            },
            (fullText) => {
                dispatch({ type: 'STREAM_DONE', payload: fullText });
                if (isVoiceMode) playVoiceStream(fullText, true);
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

                dispatch({ type: 'STREAM_DONE', payload: displayMsg });
            },
            (title) => {
                dispatch({ type: 'UPDATE_CONVERSATION_IN_LIST', payload: { id: convId, title } });
            },
            (warning) => {
                dispatch({ type: 'ADD_WARNING_MESSAGE', payload: warning.message });
            },
            abortController.signal
        );
        return () => abortController.abort();
    }, [state.activeConversationId, createNewConversation, loadSettings, playVoiceStream, stopVoiceAudio]);

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
                "VOICE",
                (token, currentFullText) => {
                    dispatch({ type: 'APPEND_STREAM_TOKEN', payload: token });
                    // Directly trigger TTS instead of waiting for a React batch update/useEffect
                    playVoiceStream(currentFullText, false);
                },
                (fullText) => {
                    dispatch({ type: 'STREAM_DONE', payload: fullText });
                    playVoiceStream(fullText, true);
                    loadSettings();
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

                    dispatch({ type: 'STREAM_DONE', payload: displayMsg });
                },
                (title) => {
                    dispatch({ type: 'UPDATE_CONVERSATION_IN_LIST', payload: { id: convId, title } });
                },
                (warning) => {
                    dispatch({ type: 'ADD_WARNING_MESSAGE', payload: warning.message });
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
    }, [state.activeConversationId, createNewConversation, loadSettings, playVoiceStream, stopVoiceAudio]);

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

    // Remove obsolete useEffect that triggered voice stream via state.streamingContent since 
    // it's now handled smoothly and directly in the api streaming hook.

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
