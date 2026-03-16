import { useState, useCallback } from 'react';
import EventSource from 'react-native-sse';
import { Storage } from '../utils/storage';
import { API_BASE_URL } from '../utils/constants';

export function useStream() {
    const [messages, setMessages] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);

    const initializeMessages = useCallback((initialMessages) => {
        setMessages(Array.isArray(initialMessages) ? initialMessages : []);
    }, []);

    // Generic message adder for optimistic UI
    const addMessage = useCallback((msg) => {
        setMessages(prev => [...prev, msg]);
    }, []);

    const streamMessage = useCallback((conversationId, prompt, selectedModel, options = {}) => {
        const { onTitle, onWarning, onToken, onDone, onError } = options;
        if (!conversationId) return;

        // Prevent overlapping streams
        if (isStreaming || isSending) {
            console.log('[useStream] Guard: Stream already in progress');
            return;
        }

        const url = `${API_BASE_URL}/ai/conversations/${conversationId}/message?stream=true`;

        const data = {
            message: prompt,
            stream: true,
            mode: options.mode || 'TEXT',
            model: selectedModel
        };

        setIsStreaming(true);
        setIsSending(true);
        setStreamingContent('');
        setError(null);

        // Note: User message is now added optimistically by the screen using addMessage()

        const token = Storage.getAccessToken();
        const es = new EventSource(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
            timeout: 60000,
            autoReconnect: false
        });

        let accumulated = '';

        const cleanup = () => {
            es.close();
            setIsStreaming(false);
            setIsSending(false);
            setStreamingContent('');
        };

        es.addEventListener('open', () => {
            console.log('SSE connection opened');
        });

        es.addEventListener('message', (event) => {
            if (event.data === '[DONE]') {
                cleanup();

                // Finalize: Add AI message to persistent list
                const aiMsg = {
                    id: `ai-${Date.now()}`,
                    role: 'assistant',
                    content: accumulated,
                    model: selectedModel,
                    createdAt: new Date().toISOString()
                };
                setMessages(prev => [...prev, aiMsg]);

                if (onDone) onDone(accumulated);
                return;
            }

            try {
                const parsed = JSON.parse(event.data);

                if (parsed.token) {
                    accumulated += parsed.token;
                    setStreamingContent(accumulated);
                    if (onToken) onToken(parsed.token, accumulated);
                }

                if (parsed.title && onTitle) {
                    onTitle(parsed.title);
                }

                if (parsed.warning && onWarning) {
                    onWarning(parsed.warning);
                }

                if (parsed.error) {
                    console.error('SSE Logic Error:', parsed.error);
                    setError(parsed.error);
                    cleanup();
                    if (onError) onError(parsed.error);
                }
            } catch (e) {
                console.log('SSE Parse Error:', e);
            }
        });

        es.addEventListener('error', (event) => {
            console.error('SSE Connection Error:', event);

            let msg = 'Connection interrupted';
            // Detect 401 Unauthorized (Expired Token) on mobile
            if (event.xhrStatus === 401 || (event.message && event.message.includes('401'))) {
                msg = 'Session expired. Please try sending again.';
            }

            setError(msg);
            cleanup();
            if (onError) onError(msg);
        });

        return () => {
            es.close();
        };
    }, [isStreaming, isSending]); // Added deps for safety

    return {
        messages,
        isStreaming,
        streamingContent,
        isSending,
        error,
        streamMessage,
        initializeMessages,
        addMessage
    };
}
