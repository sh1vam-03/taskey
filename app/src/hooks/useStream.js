import { useState, useCallback } from 'react';
import EventSource from 'react-native-sse';
import { Storage } from '../utils/storage';
import { API_BASE_URL } from '../utils/constants';

export function useStream() {
    const [messages, setMessages] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState(null);

    // Set initial text messages before stream
    const initializeMessages = useCallback((initialMessages) => {
        setMessages(initialMessages);
    }, []);

    const streamMessage = useCallback((conversationId, prompt, selectedModel) => {
        if (!prompt.trim() || !conversationId) return;

        // Add user message to UI immediately
        const userMsg = { id: Date.now(), role: 'user', content: prompt };
        // Add empty assistant message that will be filled by stream
        const assistantMsgId = Date.now() + 1;
        const assistantMsg = {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            isStreaming: true,
            model: selectedModel
        };

        setMessages(prev => [...prev, userMsg, assistantMsg]);
        setIsStreaming(true);
        setError(null);

        const token = Storage.getAccessToken();
        const url = `${API_BASE_URL}/ai/conversations/${conversationId}/stream`;

        // React Native SSE
        const es = new EventSource(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ prompt, model: selectedModel })
        });

        es.addEventListener('message', (event) => {
            try {
                if (event.data === '[DONE]') {
                    es.close();
                    setIsStreaming(false);
                    setMessages(prev => prev.map(m =>
                        m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                    ));
                    return;
                }

                const parsed = JSON.parse(event.data);
                if (parsed.content) {
                    setMessages(prev => prev.map(m => {
                        if (m.id === assistantMsgId) {
                            return { ...m, content: m.content + parsed.content };
                        }
                        return m;
                    }));
                }
            } catch (err) {
                console.error('SSE Error processing chunk', err);
            }
        });

        es.addEventListener('error', (event) => {
            console.error('SSE event error', event);
            setError('Connection error');
            setIsStreaming(false);
            es.close();
            setMessages(prev => prev.map(m =>
                m.id === assistantMsgId ? { ...m, isStreaming: false } : m
            ));
        });

        return () => {
            es.close();
        };
    }, []);

    return { messages, isStreaming, error, streamMessage, initializeMessages };
}
