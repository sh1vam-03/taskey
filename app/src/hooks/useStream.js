/**
 * useStream.js  —  TASKTIME AI Streaming Hook  v2
 *
 * ── Fixes from v1 ───────────────────────────────────────────────────────────
 *  1. AbortController per-stream  →  no dangling fetch, no reconnect loop
 *  2. streamIdRef guard           →  stale callbacks from old streams are silently dropped
 *  3. onDone fires EXACTLY once   →  no duplicate AI messages
 *  4. messages are deduped by id  →  addMessage is safe to call optimistically
 *  5. initializeMessages replaces state atomically  →  no flash of old content
 * ────────────────────────────────────────────────────────────────────────────
 *
 * EXPECTED SSE FORMAT FROM BACKEND:
 *   data: {"type":"token","content":"Hello"}
 *   data: {"type":"title","title":"New Conversation"}
 *   data: {"type":"warning","code":402,"message":"Credits low"}
 *   data: {"type":"done","message":{"id":"...","role":"assistant","content":"..."}}
 *   data: [DONE]
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import Config from 'react-native-config';
import { useAuthStore } from '../store/auth.store';

const BASE_URL = Config.BASE_API_URL || 'https://tasktime-production.up.railway.app/api';
const STREAM_ENDPOINT = (convId) => `${BASE_URL}/ai/conversations/${convId}/stream`;

// ── Deduplication helper ────────────────────────────────────────────────────
const dedupeById = (arr) => {
    const seen = new Set();
    return arr.filter(m => {
        const key = m.id || m._id;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

export function useStream() {
    const [messages, setMessages] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [isSending, setIsSending] = useState(false);

    // ── Refs (never stale in callbacks) ─────────────────────────────────────
    const streamIdRef = useRef(0);          // incremented per streamMessage call
    const abortRef = useRef(null);       // AbortController for current fetch
    const isDoneRef = useRef(false);      // ensures onDone fires exactly once
    const isMountedRef = useRef(true);

    const accessToken = useAuthStore(s => s.accessToken);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            // Kill any in-flight stream on unmount
            abortRef.current?.abort();
        };
    }, []);

    // ── State helpers (safe: check isMounted) ───────────────────────────────
    const safeSet = useCallback((setter, value) => {
        if (isMountedRef.current) setter(value);
    }, []);

    // ── Public: initializeMessages ───────────────────────────────────────────
    const initializeMessages = useCallback((msgs) => {
        safeSet(setMessages, Array.isArray(msgs) ? dedupeById(msgs) : []);
        safeSet(setIsStreaming, false);
        safeSet(setStreamingContent, '');
        safeSet(setIsSending, false);
    }, [safeSet]);

    // ── Public: addMessage (optimistic, deduped) ─────────────────────────────
    const addMessage = useCallback((msg) => {
        if (!msg) return;
        safeSet(setMessages, prev => {
            const key = msg.id || msg._id;
            // If a message with this id already exists, skip
            if (key && prev.some(m => (m.id || m._id) === key)) return prev;
            return [...prev, msg];
        });
    }, [safeSet]);

    // ── Public: stopStream ───────────────────────────────────────────────────
    const stopStream = useCallback(() => {
        abortRef.current?.abort();
        if (isMountedRef.current) {
            setIsStreaming(false);
            setStreamingContent('');
            setIsSending(false);
        }
    }, []);

    // ── Public: streamMessage ────────────────────────────────────────────────
    const streamMessage = useCallback(async (convId, text, model, callbacks = {}) => {
        // ── 1. Abort any previous stream ──────────────────────────────────────
        abortRef.current?.abort();

        // ── 2. Assign a unique ID to this stream invocation ───────────────────
        const myId = ++streamIdRef.current;
        isDoneRef.current = false;

        const abort = new AbortController();
        abortRef.current = abort;

        // ── 3. Guard: check this stream is still current ──────────────────────
        const isCurrent = () => myId === streamIdRef.current && isMountedRef.current;

        if (!isCurrent()) return;

        safeSet(setIsSending, true);
        safeSet(setIsStreaming, false);
        safeSet(setStreamingContent, '');

        let fullContent = '';
        let finalMessage = null;
        let fetchFailed = false;

        try {
            const response = await fetch(STREAM_ENDPOINT(convId), {
                method: 'POST',
                signal: abort.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify({ content: text, model }),
            });

            if (!isCurrent()) return;

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            safeSet(setIsSending, false);
            safeSet(setIsStreaming, true);

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            // ── 4. Read stream line by line ───────────────────────────────────
            while (true) {
                if (!isCurrent()) break;

                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // keep incomplete last line

                for (const rawLine of lines) {
                    const line = rawLine.trim();
                    if (!line || line === ':') continue; // SSE keep-alive

                    // ── Parse [DONE] sentinel ─────────────────────────────────
                    if (line === 'data: [DONE]') {
                        break;
                    }

                    if (!line.startsWith('data:')) continue;

                    const jsonStr = line.slice(5).trim();

                    let event;
                    try {
                        event = JSON.parse(jsonStr);
                    } catch {
                        // Plain text token (some backends send raw text)
                        if (jsonStr) {
                            fullContent += jsonStr;
                            if (isCurrent()) {
                                safeSet(setStreamingContent, fullContent);
                                callbacks.onToken?.(jsonStr, fullContent);
                            }
                        }
                        continue;
                    }

                    if (!isCurrent()) break;

                    switch (event.type) {
                        case 'token':
                        case 'chunk':
                        case 'delta': {
                            const token = event.content || event.delta || event.text || '';
                            fullContent += token;
                            safeSet(setStreamingContent, fullContent);
                            callbacks.onToken?.(token, fullContent);
                            break;
                        }

                        case 'title': {
                            if (event.title) callbacks.onTitle?.(event.title);
                            break;
                        }

                        case 'warning': {
                            callbacks.onWarning?.(event);
                            break;
                        }

                        case 'done': {
                            finalMessage = event.message || null;
                            break;
                        }

                        case 'error': {
                            throw new Error(event.message || 'Stream error');
                        }

                        default:
                            break;
                    }
                }
            }

        } catch (err) {
            fetchFailed = true;

            if (err.name === 'AbortError') {
                // Intentional stop — not an error
                if (isCurrent()) {
                    safeSet(setIsStreaming, false);
                    safeSet(setStreamingContent, '');
                    safeSet(setIsSending, false);
                }
                return;
            }

            console.error('[useStream] fetch error:', err);
            if (isCurrent()) {
                safeSet(setIsStreaming, false);
                safeSet(setStreamingContent, '');
                safeSet(setIsSending, false);
                callbacks.onError?.(err);
            }
            return;
        }

        // ── 5. Stream ended normally ──────────────────────────────────────────
        if (!isCurrent() || isDoneRef.current) return;
        isDoneRef.current = true; // mark done BEFORE any state update

        // Add the completed AI message to messages array ONCE
        if (fullContent.trim()) {
            const aiMessage = finalMessage || {
                id: `ai-${myId}-${Date.now()}`,
                role: 'assistant',
                content: fullContent,
                createdAt: new Date().toISOString(),
            };

            safeSet(setMessages, prev => {
                // Don't add if already present (e.g. from initializeMessages)
                const key = aiMessage.id || aiMessage._id;
                if (key && prev.some(m => (m.id || m._id) === key)) return prev;
                return [...prev, aiMessage];
            });
        }

        safeSet(setIsStreaming, false);
        safeSet(setStreamingContent, '');
        safeSet(setIsSending, false);

        callbacks.onDone?.();

    }, [accessToken, safeSet]);

    return {
        messages,
        isStreaming,
        streamingContent,
        isSending,
        streamMessage,
        stopStream,
        initializeMessages,
        addMessage,
    };
}
