'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useAi } from '@/features/ai/useAi';
import MessageBubble from '@/components/ai/MessageBubble';
import StreamingMessage from '@/components/ai/StreamingMessage';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import AiEnergySphere from '@/components/ui/AiEnergySphere';
import { Bot, Sparkles, BrainCircuit, Calendar as CalendarIcon, MessageSquare, ArrowDown } from 'lucide-react';

export default function ChatWindow() {
    const {
        messages,
        activeConversationId,
        isLoadingMessages,
        isStreaming,
        streamingContent,
        isProcessingVoice,
    } = useAi();

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

    // No active conversation — show empty state
    if (!activeConversationId) {
        return <EmptyState />;
    }

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden">
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
    const { sendMessage } = useAi();

    const suggestions = [
        { icon: CalendarIcon, label: "What should I focus on?", sub: "Check my tasks & schedule" },
        { icon: BrainCircuit, label: "Do I have free time?", sub: "Analyze my calendar today" },
        { icon: Sparkles, label: "I'm feeling overwhelmed", sub: "Help me prioritize" },
        { icon: MessageSquare, label: "Review my habits", sub: "How is my sleep & mood?" },
    ];

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-8">
            <div className="relative mb-6">
                <AiEnergySphere
                    size={400}
                    baseRadius={60}
                    rotationSpeed={0.003}
                    waveStrength={5}
                    particleCount={600}
                    hoverRadius={50}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Bot className="h-10 w-10 text-white/60" />
                </div>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-2">How can I help you today?</h2>
            <p className="text-sm text-gray-500 mb-8">Ask me anything about your tasks, schedule, or habits</p>

            {/* Context Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-950/30 border border-cyan-500/20 rounded-full text-[11px] text-cyan-400 font-medium mb-6">
                <Sparkles className="w-3 h-3" />
                <span>Context Active: Schedule • Tasks • Habits</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {suggestions.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => sendMessage(item.label)}
                        className="text-left p-4 rounded-xl border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200
                            text-sm group bg-white/[0.02] hover:border-cyan-500/20"
                    >
                        <div className="font-medium text-gray-200 mb-1 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </div>
                        <div className="text-gray-600 text-xs">{item.sub}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}
