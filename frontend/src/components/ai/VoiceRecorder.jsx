'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, X, Send, Loader2 } from 'lucide-react';
import { useAiContext } from '@/context/AiContext';

/**
 * VoiceRecorder — Records audio and sends as WAV for maximum STT compatibility
 *
 * WHY WAV instead of WebM?
 * Browser MediaRecorder typically outputs webm/opus, which many STT APIs 
 * (including Sarvam Saaras v3 in certain configurations) fail to decode.
 * By capturing raw PCM via ScriptProcessorNode and encoding WAV ourselves,
 * we guarantee a format that ALL STT services can read.
 *
 * Audio constraints include echoCancellation and autoGainControl for 
 * headphone mic and USB mic compatibility.
 */
const VoiceRecorder = ({ onClose }) => {
    const { sendVoiceMessage, isProcessingVoice, updateLiveTranscript } = useAiContext();

    const [state, setState] = useState('idle'); // idle | recording | uploading
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState(null);

    const timerRef = useRef(null);
    const streamRef = useRef(null);
    const recognitionRef = useRef(null);

    // WAV recording refs
    const audioContextRef = useRef(null);
    const sourceRef = useRef(null);
    const processorRef = useRef(null);
    const rawSamplesRef = useRef([]);

    const MAX_DURATION = 120; // 2 minutes
    const SAMPLE_RATE = 16000; // Sarvam prefers 16kHz

    /**
     * Encode raw PCM float32 samples → WAV Blob
     * Format: 16-bit mono PCM WAV (universally supported by all STT APIs)
     */
    const encodeWav = (samples, sampleRate) => {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);

        const writeStr = (offset, str) => {
            for (let i = 0; i < str.length; i++) {
                view.setUint8(offset + i, str.charCodeAt(i));
            }
        };

        writeStr(0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        writeStr(8, 'WAVE');
        writeStr(12, 'fmt ');
        view.setUint32(16, 16, true);            // subchunk size
        view.setUint16(20, 1, true);             // PCM format
        view.setUint16(22, 1, true);             // mono
        view.setUint32(24, sampleRate, true);    // sample rate
        view.setUint32(28, sampleRate * 2, true); // byte rate (16-bit mono)
        view.setUint16(32, 2, true);             // block align
        view.setUint16(34, 16, true);            // bits per sample

        writeStr(36, 'data');
        view.setUint32(40, samples.length * 2, true);

        // Convert float32 [-1, 1] → int16
        for (let i = 0; i < samples.length; i++) {
            const s = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }

        return new Blob([buffer], { type: 'audio/wav' });
    };

    const startRecording = useCallback(async () => {
        setError(null);

        try {
            // Request mic with explicit constraints for headphone/USB mic compatibility
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    channelCount: { ideal: 1 },
                }
            });
            streamRef.current = stream;

            // Verify audio track is live
            const audioTrack = stream.getAudioTracks()[0];
            if (!audioTrack || audioTrack.readyState !== 'live') {
                setError('Microphone not available. Check your audio device settings.');
                return;
            }
            console.log(`[VoiceRecorder] Using: ${audioTrack.label || 'Default mic'}`);

            // ── Real-time STT Preview (Web Speech API) ───────
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;

                recognition.onresult = (event) => {
                    let transcript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        transcript += event.results[i][0].transcript;
                    }
                    if (transcript.trim()) {
                        updateLiveTranscript(transcript);
                    }
                };

                recognition.onerror = (e) => console.warn('[STT Preview]', e.error);
                recognition.start();
                recognitionRef.current = recognition;
            }

            // ── Raw PCM capture via AudioContext → ScriptProcessor ──
            const audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: SAMPLE_RATE,
            });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;

            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            rawSamplesRef.current = [];

            processor.onaudioprocess = (e) => {
                const input = e.inputBuffer.getChannelData(0);
                rawSamplesRef.current.push(new Float32Array(input));
            };

            source.connect(processor);
            processor.connect(audioContext.destination);
            processorRef.current = processor;

            setState('recording');
            setDuration(0);

            // Duration timer
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
            console.error('[VoiceRecorder] Mic error:', err);
            if (err.name === 'NotAllowedError') {
                setError('Microphone access denied. Please allow access in browser settings.');
            } else if (err.name === 'NotFoundError') {
                setError('No microphone found. Please connect a microphone or headset.');
            } else if (err.name === 'NotReadableError') {
                setError('Microphone is in use by another app. Close it and try again.');
            } else {
                setError(`Microphone error: ${err.message}`);
            }
        }
    }, [sendVoiceMessage, onClose, updateLiveTranscript]);

    const stopRecording = useCallback(async () => {
        // Stop timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Stop STT preview
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { }
            recognitionRef.current = null;
        }

        // Stop mic stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }

        // Disconnect audio processing
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }

        // Encode WAV from raw samples
        const allSamples = rawSamplesRef.current;
        if (allSamples.length === 0) {
            setError('No audio captured. Please check your microphone and try again.');
            setState('idle');
            return;
        }

        // Merge all chunks
        const totalLength = allSamples.reduce((sum, chunk) => sum + chunk.length, 0);
        const merged = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of allSamples) {
            merged.set(chunk, offset);
            offset += chunk.length;
        }

        // Check if there's actual audio content (not just silence)
        let maxAmplitude = 0;
        for (let i = 0; i < merged.length; i++) {
            const abs = Math.abs(merged[i]);
            if (abs > maxAmplitude) maxAmplitude = abs;
        }
        console.log(`[VoiceRecorder] Samples: ${totalLength}, Max amplitude: ${maxAmplitude.toFixed(4)}`);

        if (maxAmplitude < 0.005) {
            setError('No sound detected. Please check your microphone is working.');
            setState('idle');
            return;
        }

        const sampleRate = audioContextRef.current?.sampleRate || SAMPLE_RATE;
        const wavBlob = encodeWav(merged, sampleRate);
        console.log(`[VoiceRecorder] WAV: ${(wavBlob.size / 1024).toFixed(1)}KB, ${(totalLength / sampleRate).toFixed(1)}s`);

        // Close audio context
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }

        if (wavBlob.size < 500) {
            setError('Recording too short. Please speak for at least 1 second.');
            setState('idle');
            return;
        }

        // Send!
        setState('uploading');
        try {
            await sendVoiceMessage(wavBlob);
            onClose();
        } catch (err) {
            setError(err?.message || 'Failed to process voice message');
            setState('idle');
        }
    }, [sendVoiceMessage, onClose]);

    const cancelRecording = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { }
            recognitionRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }

        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }

        setState('idle');
        setDuration(0);
        onClose();
    }, [onClose]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch { }
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
            if (processorRef.current) processorRef.current.disconnect();
            if (sourceRef.current) sourceRef.current.disconnect();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(() => { });
            }
        };
    }, []);

    // Auto-start recording on mount
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
            <div className="flex items-center justify-center gap-3 px-4 py-4 bg-[#1a1a1a] rounded-2xl border border-white/8">
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

            {/* Waveform visualization */}
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
};

export default VoiceRecorder;
