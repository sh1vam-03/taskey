'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, X, Send, Loader2 } from 'lucide-react';
import { useVoice } from '@/features/ai/useAi';

export default function VoiceRecorder({ onClose }) {
    const { sendVoiceMessage, isProcessingVoice } = useVoice();

    const [state, setState] = useState('idle'); // idle | recording | uploading
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const streamRef = useRef(null);

    const MAX_DURATION = 120; // 2 minutes

    // Detect supported mime type
    const getMimeType = () => {
        if (typeof MediaRecorder === 'undefined') return null;
        if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
        return 'audio/webm'; // fallback
    };

    const startRecording = useCallback(async () => {
        setError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mimeType = getMimeType();
            if (!mimeType) {
                setError('Audio recording is not supported in your browser');
                return;
            }

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                setState('uploading');

                try {
                    await sendVoiceMessage(blob);
                    onClose();
                } catch (err) {
                    setError('Failed to process voice message');
                    setState('idle');
                }
            };

            recorder.start(250); // collect chunks every 250ms
            setState('recording');
            setDuration(0);

            // Start duration timer
            timerRef.current = setInterval(() => {
                setDuration(prev => {
                    if (prev >= MAX_DURATION - 1) {
                        stopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (err) {
            console.error('Mic error:', err);
            if (err.name === 'NotAllowedError') {
                setError('Microphone access denied. Please allow microphone access.');
            } else {
                setError('Failed to access microphone');
            }
        }
    }, [sendVoiceMessage, onClose]);

    const stopRecording = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }

        // Stop all tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    }, []);

    const cancelRecording = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            // Remove the onstop handler so we don't process the audio
            mediaRecorderRef.current.onstop = null;
            mediaRecorderRef.current.stop();
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }

        setState('idle');
        setDuration(0);
        onClose();
    }, [onClose]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    // Auto-start recording when component mounts
    useEffect(() => {
        startRecording();
    }, [startRecording]);

    const formatDuration = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (error) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] rounded-2xl border border-red-500/20">
                <span className="text-sm text-red-400 flex-1">{error}</span>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    if (state === 'uploading' || isProcessingVoice) {
        return (
            <div className="flex items-center justify-center gap-3 px-4 py-4 bg-[#1a1a1a] rounded-2xl border border-white/[0.08]">
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                <span className="text-sm text-gray-300">Processing voice message...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] rounded-2xl border border-red-500/20 animate-in fade-in duration-200">
            {/* Pulsing red dot + timer */}
            <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <span className="text-sm font-mono text-gray-300 tabular-nums min-w-[40px]">
                    {formatDuration(duration)}
                </span>
            </div>

            {/* Waveform visualization (simple bars) */}
            <div className="flex-1 flex items-center justify-center gap-[2px] h-8 px-4">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div
                        key={i}
                        className="w-[3px] bg-red-400/60 rounded-full animate-pulse"
                        style={{
                            height: `${Math.random() * 20 + 8}px`,
                            animationDelay: `${i * 50}ms`,
                            animationDuration: `${600 + Math.random() * 400}ms`,
                        }}
                    />
                ))}
            </div>

            {/* Max duration warning */}
            {duration >= MAX_DURATION - 10 && (
                <span className="text-[10px] text-yellow-400 shrink-0">
                    {MAX_DURATION - duration}s left
                </span>
            )}

            {/* Cancel */}
            <button
                onClick={cancelRecording}
                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors shrink-0"
                title="Cancel"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Send */}
            <button
                onClick={stopRecording}
                className="p-2.5 bg-cyan-500 hover:bg-cyan-400 rounded-xl text-black transition-all duration-200 shrink-0 hover:scale-105"
                title="Send voice message"
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
    );
}
