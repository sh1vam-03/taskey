'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useAi } from '@/features/ai/useAi';
import MessageBubble from '@/components/ai/MessageBubble';
import StreamingMessage from '@/components/ai/StreamingMessage';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import AiEnergySphere from '@/components/ui/AiEnergySphere';
import { Sparkles, Calendar as CalendarIcon, Target, Clock, ArrowDown, SearchX, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChatWindow() {
    const {
        messages,
        activeConversationId,
        isLoadingMessages,
        isStreaming,
        streamingContent,
        isProcessingVoice,
        settings,
        isChatNotFound,
    } = useAi();

    const router = useRouter();

    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);
    const [userScrolledUp, setUserScrolledUp] = useState(false);

    // Auto-scroll to bottom on new messages
    const scrollToBottom = useCallback((smooth = true) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: smooth ? 'smooth' : 'instant',
        });
    }, []);

    useEffect(() => {
        if (!userScrolledUp) {
            scrollToBottom();
        }
    }, [messages, streamingContent, userScrolledUp, scrollToBottom]);

    // Detect if user has scrolled up
    const handleScroll = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setUserScrolledUp(distFromBottom > 100);
    }, []);

    const handleScrollToBottom = () => {
        setUserScrolledUp(false);
        scrollToBottom();
    };

    // Chat Not Found State
    if (isChatNotFound) {
        return <ChatNotFoundState onNewChat={() => router.push('/dashboard/ai')} />;
    }

    // No active conversation — show empty state
    if (!activeConversationId) {
        return <EmptyState />;
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
            {/* Study Mode Banner for Sarvam-M */}
            {settings?.chatModel === 'sarvam-m' && (
                <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-4 py-2.5 flex items-center justify-center gap-2 shrink-0">
                    <span className="text-cyan-400 text-[11px] font-medium tracking-wide">
                        📚 Alpha Mode — Sarvam-M is a knowledge-first model. Experimental support for tasks & calendar is active.
                    </span>
                </div>
            )}

            {/* Message List */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pb-4"
            >
                {isLoadingMessages ? (
                    <div className="max-w-3xl mx-auto w-full px-4 pt-4">
                        <SkeletonLoader type="chat-messages" />
                    </div>
                ) : messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="max-w-3xl mx-auto w-full px-4 md:px-0 pt-4 flex flex-col gap-1">
                        {messages.map((msg, i) => (
                            <MessageBubble key={msg.id || i} message={msg} />
                        ))}

                        {/* Streaming message */}
                        {isStreaming && streamingContent && (
                            <StreamingMessage content={streamingContent} />
                        )}

                        {/* Processing voice indicator */}
                        {isProcessingVoice && (
                            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span>Processing voice...</span>
                            </div>
                        )}

                        {/* Typing indicator when streaming hasn't started yet */}
                        {isStreaming && !streamingContent && (
                            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span>Thinking...</span>
                            </div>
                        )}

                        <div ref={messagesEndRef} className="h-2" />
                    </div>
                )}
            </div>

            {/* Scroll to bottom FAB */}
            {userScrolledUp && (
                <button
                    onClick={handleScrollToBottom}
                    className="absolute bottom-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/10
                        text-white shadow-lg transition-all duration-200 z-10"
                >
                    <ArrowDown className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

function EmptyState() {
    const { sendMessage, settings } = useAi();

    const suggestions = [
        { icon: CalendarIcon, label: "What should I focus on?", sub: "Check my tasks & schedule" },
        { icon: Target, label: "Create a session for me", sub: "Deep work or task focus" },
        { icon: Sparkles, label: "What can you do?", sub: "Explore AI capabilities" },
        { icon: Clock, label: "Analyze my time", sub: "Review habit consistency" }
    ];

    return (
        <div className="flex-1 flex flex-col min-h-0 items-center justify-center px-6 overflow-y-auto overflow-x-hidden w-full relative py-12">
            {/* Background Sphere - Repositioned behind the greeting */}
            <div className="absolute pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] opacity-35">
                <AiEnergySphere
                    size={800}
                    baseRadius={200}
                    rotationSpeed={0.02}
                    waveStrength={10}
                    particleCount={500}
                    hoverRadius={60}
                />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center w-full max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">How can I help you today?</h2>
                <p className="text-sm text-gray-400 mb-10 max-w-md leading-relaxed">
                    Ask me anything about your tasks, schedule, or habits. I'm here to help you stay organized and productive.
                </p>

                {settings?.chatModel === 'sarvam-m' && (
                    <div className="mb-8 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-[11px] md:text-xs text-cyan-400 font-medium tracking-wide">
                        📚 Alpha Mode — Sarvam-M is a knowledge-first model. Experimental support for tasks & calendar is active.
                    </div>
                )}

                {/* Suggestions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                    {suggestions.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => sendMessage(item.label)}
                            className="flex items-start gap-4 p-4 rounded-2xl bg-white/4 border border-white/8 hover:bg-white/8 hover:border-white/12 transition-all group text-left"
                        >
                            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform shrink-0">
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">{item.label}</span>
                                <span className="text-xs text-gray-500">{item.sub}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ChatNotFoundState({ onNewChat }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-6">
                <SearchX className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Chat Not Available</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-sm">
                This conversation doesn't exist or you don't have permission to access it.
            </p>
            <button
                onClick={onNewChat}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-medium transition-all"
            >
                <Plus className="w-4 h-4" />
                Start New Chat
            </button>
        </div>
    );
}
