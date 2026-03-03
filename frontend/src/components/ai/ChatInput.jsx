'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Mic, Square, Sparkles } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useAi } from '@/features/ai/useAi';
import VoiceRecorder from '@/components/ai/VoiceRecorder';

export default function ChatInput() {
    const router = useRouter();
    const params = useParams();
    const {
        sendMessage,
        stopStreaming,
        isSendingMessage,
        isStreaming,
        isProcessingVoice,
        activeConversationId,
    } = useAi();

    const [input, setInput] = useState('');
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const textareaRef = useRef(null);

    const isDisabled = isStreaming || isSendingMessage || isProcessingVoice;

    const handleSend = useCallback(async () => {
        if (!input.trim() || isDisabled) return;

        const currentInput = input.trim();
        setInput('');

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        const abortFn = await sendMessage(currentInput);

        // If we were on /dashboard/ai (new chat), navigation will be handled by context sync 
        // OR we can explicitly navigate here after a short delay to ensure conv created.
        // Actually, our layout sync is better if we fix it to only redirect URL -> Context
        // and Context -> URL ONLY when moving from null to non-null.
    }, [input, isDisabled, sendMessage]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e) => {
        setInput(e.target.value);
        // Auto-resize
        const el = e.currentTarget;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 192) + 'px'; // max ~6 lines
    };

    // Focus textarea when voice recorder closes
    useEffect(() => {
        if (!showVoiceRecorder && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [showVoiceRecorder]);

    return (
        <div className="px-4 pb-6 pt-2 bg-linear-to-t from-[#0d0d0d] via-[#0d0d0d]/95 to-transparent">
            <div className="max-w-3xl mx-auto">
                {/* Voice Recorder (replaces input when active) */}
                {showVoiceRecorder ? (
                    <VoiceRecorder onClose={() => setShowVoiceRecorder(false)} />
                ) : (
                    <div className="relative flex items-end gap-2 bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-white/8
                        shadow-2xl p-2 transition-all duration-200 focus-within:border-cyan-500/20 focus-within:shadow-cyan-900/5">
                        {/* Voice Button */}
                        <button
                            onClick={() => setShowVoiceRecorder(true)}
                            disabled={isDisabled}
                            className="p-2.5 rounded-xl hover:bg-white/6 text-gray-400 hover:text-cyan-400
                                transition-all duration-200 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Voice input"
                        >
                            <Mic className="w-5 h-5" />
                        </button>

                        {/* Textarea */}
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            placeholder="Message Taskey AI..."
                            disabled={isDisabled}
                            rows={1}
                            className="flex-1 max-h-48 min-h-[40px] bg-transparent border-0 text-white placeholder:text-gray-600
                                focus:ring-0 focus:outline-none text-[15px] leading-relaxed resize-none py-2
                                scrollbar-thin scrollbar-thumb-white/10 disabled:opacity-50"
                            style={{ height: 'auto' }}
                        />

                        {/* Send / Stop Button */}
                        {isStreaming ? (
                            <button
                                onClick={stopStreaming}
                                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white
                                    transition-all duration-200 shrink-0"
                                title="Stop generating"
                            >
                                <Square className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isDisabled}
                                className={`p-2.5 rounded-xl transition-all duration-200 shrink-0 ${input.trim() && !isDisabled
                                    ? 'bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-105 shadow-lg shadow-cyan-500/20'
                                    : 'bg-white/4 text-gray-600 cursor-not-allowed'
                                    }`}
                                title="Send message"
                            >
                                {isSendingMessage ? (
                                    <Sparkles className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        )}
                    </div>
                )}

                <p className="text-center text-[10px] text-gray-600 mt-2.5 font-medium tracking-wide">
                    AI can make mistakes. Please verify important information.
                </p>
            </div>
        </div>
    );
}
