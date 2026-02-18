"use client";

import { useState, useEffect, useRef } from 'react';
import aiService from '@/services/ai.service';
import { useAuth } from '@/context/AuthContext';
import { useAi } from '@/context/AiContext';
import { Bot, Mic, Send, StopCircle, Sparkles, BrainCircuit, Calendar as CalendarIcon, Keyboard, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/context/ToastContext';
import AiEnergySphere from '@/components/ui/AiEnergySphere';

export default function AIPage() {
    const { error } = useToast();
    const { user, refreshProfile } = useAuth();
    const { currentConv, setCurrentConv, createNewChat, loadConversations } = useAi(); // Consume Context

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [voiceMode, setVoiceMode] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (currentConv) {
            loadMessages(currentConv.id);
        } else {
            setMessages([]);
        }
    }, [currentConv]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadMessages = async (id) => {
        try {
            const msgs = await aiService.getMessages(id);
            setMessages(msgs);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = async () => {
        if (!input.trim() && !voiceMode) return;

        let activeId = currentConv?.id;

        // Auto-create conversation if none selected
        if (!activeId) {
            try {
                // Use context method
                const newConv = await createNewChat();
                activeId = newConv.id;
            } catch (err) {
                console.error(err);
                // Error handled in context
                return;
            }
        }

        const tempMsg = { role: 'user', content: input, id: Date.now() };
        setMessages(prev => [...prev, tempMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await aiService.sendMessage(activeId, input);
            setMessages(prev => [...prev, response]);
            if (refreshProfile) refreshProfile();
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.status === 429
                ? (err.response.data?.message || "AI Service is temporarily unavailable due to quota limits.")
                : (err.response?.data?.message || "Failed to send message. Check credits.");

            error(errMsg);
            setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ **Error**: ${errMsg}` }]);
        } finally {
            setLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await handleVoiceUpload(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Mic error", err);
            error("Microphone access denied");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleVoiceUpload = async (blob) => {
        if (!currentConv) return;
        setLoading(true);
        setMessages(prev => [...prev, { role: 'user', content: "🎤 [Voice Message]" }]);

        try {
            const response = await aiService.sendVoiceMessage(currentConv.id, blob);
            setMessages(prev => {
                return [...prev, { role: 'assistant', content: response.reply }];
            });

            if (response.audioUrl) {
                const audio = new Audio(response.audioUrl);
                audio.play();
            }

            if (refreshProfile) refreshProfile();
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.status === 429
                ? (err.response.data?.message || "AI Service is temporarily unavailable due to quota limits.")
                : (err.response?.data?.message || "Voice processing failed. Check credits.");

            error(errMsg);
            setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ **Error**: ${errMsg}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-1 w-full text-white font-sans overflow-hidden bg-black">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full relative">

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 w-full pb-32">
                    {!currentConv || messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center -mt-20">
                            {!voiceMode && (
                                <div className="relative mb-8 group cursor-pointer" onClick={() => { }}>
                                    <AiEnergySphere
                                        size={480}
                                        baseRadius={60}
                                        rotationSpeed={0.003}
                                        waveStrength={5}
                                        particleCount={600}
                                        hoverRadius={50}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <Bot className="h-10 w-10 text-white/80" />
                                    </div>
                                </div>
                            )}
                            <h2 className="text-2xl font-semibold text-white mb-8">
                                {voiceMode ? (isRecording ? "Listening..." : "Voice Mode Active") : "How can I help you today?"}
                            </h2>

                            {!voiceMode && (
                                <div className="flex flex-col items-center gap-6 max-w-2xl w-full px-6">
                                    {/* Context Badge */}
                                    <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/30 border border-cyan-500/20 rounded-full text-xs text-cyan-400 font-medium animate-pulse">
                                        <Sparkles className="w-3 h-3" />
                                        <span>Context Active: Schedule • Tasks • Habits</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                        {[
                                            { icon: CalendarIcon, label: "What should I focus on?", sub: "Check my tasks & schedule" },
                                            { icon: BrainCircuit, label: "Do I have free time?", sub: "Analyze my calendar today" },
                                            { icon: Sparkles, label: "I'm feeling overwhelmed", sub: "Help me prioritize" },
                                            { icon: MessageSquare, label: "Review my habits", sub: "How is my sleep & mood?" }
                                        ].map((item, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setInput(item.label)}
                                                className="text-left p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm group bg-[#1e1e1e]/50 hover:border-cyan-500/30"
                                            >
                                                <div className="font-medium text-gray-200 mb-1 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                                                    <item.icon className="w-4 h-4" />
                                                    {item.label}
                                                </div>
                                                <div className="text-gray-500 text-xs">{item.sub}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto w-full px-4 md:px-0 pt-4 flex flex-col gap-6">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex gap-4 mb-6 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {/* AI Avatar Removed */}

                                    {/* Message Bubble */}
                                    <div className={`
                                        prose prose-invert max-w-[85%] md:max-w-[75%] text-[15px] leading-7 relative group
                                        ${m.role === 'user'
                                            ? 'bg-[#2f2f2f] px-5 py-2.5 rounded-[20px] text-gray-100'
                                            : 'w-full px-0 text-gray-200'}
                                    `}>
                                        <ReactMarkdown components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                return !inline && match ? (
                                                    <div className="rounded-md bg-[#0d0d0d] border border-white/10 my-4 overflow-hidden">
                                                        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 text-xs text-gray-400">
                                                            <span>{match[1]}</span>
                                                            <span>Copy code</span>
                                                        </div>
                                                        <div className="p-4 overflow-x-auto">
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <code className="bg-white/10 rounded px-1.5 py-0.5 text-sm" {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}>
                                            {m.content}
                                        </ReactMarkdown>
                                    </div>

                                    {/* No User Avatar - Just Bubble */}
                                </div>
                            ))}

                            {/* Loading State Removed - Streaming happens in real-time */}

                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    )}
                </div>

                {/* Fixed Input Area */}
                <div className="absolute bottom-0 left-0 w-full pb-6 pt-24 px-4 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
                    <div className="max-w-3xl mx-auto relative pointer-events-auto">
                        {voiceMode ? (
                            <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                {/* Voice Visualization / Status */}
                                <div className="flex items-center gap-3 px-6 py-3 bg-[#1e1e1e] rounded-full border border-white/10 shadow-2xl shadow-cyan-900/10">
                                    <div className="flex gap-1 h-4 items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className={`w-1 bg-cyan-500 rounded-full animate-pulse`}
                                                style={{
                                                    height: isRecording ? `${Math.random() * 16 + 4}px` : '4px',
                                                    animationDuration: isRecording ? '0.5s' : '2s'
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-cyan-100">
                                        {isRecording ? "Listening..." : "Tap mic to speak"}
                                    </span>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => {
                                            stopRecording();
                                            setVoiceMode(false);
                                        }}
                                        className="p-4 rounded-full bg-[#1e1e1e] text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-all border border-white/5"
                                        title="Switch to Keyboard"
                                    >
                                        <Keyboard className="h-6 w-6" />
                                    </button>

                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`p-6 rounded-full transition-all duration-300 shadow-xl ${isRecording
                                            ? 'bg-red-500 text-white shadow-red-500/30 scale-110'
                                            : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-500/20 hover:scale-105'
                                            }`}
                                    >
                                        {isRecording ? <StopCircle className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="group relative flex items-center gap-3 bg-[#0a0a0a]/80 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-2 transition-all duration-300 focus-within:border-cyan-500/30 focus-within:bg-[#0a0a0a]/90 focus-within:shadow-cyan-900/10">
                                {/* Voice Toggle */}
                                <button
                                    onClick={() => setVoiceMode(true)}
                                    className="p-3 rounded-full hover:bg-white/10 text-gray-400 hover:text-cyan-400 transition-all ml-1 shrink-0"
                                    title="Switch to Voice Mode"
                                >
                                    <Mic className="h-5 w-5" />
                                </button>

                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Message Taskey AI..."
                                    className="flex-1 max-h-[200px] min-h-[24px] bg-transparent border-0 text-white placeholder:text-gray-500 focus:ring-0 text-[16px] leading-[1.5] resize-none py-3 scrollbar-thin scrollbar-thumb-white/10 cursor-text"
                                    rows={1}
                                    style={{ height: 'auto', minHeight: '48px' }}
                                    onInput={(e) => {
                                        e.currentTarget.style.height = 'auto';
                                        e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                    }}
                                    disabled={loading}
                                />

                                {/* Send Button */}
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading}
                                    className={`p-3 rounded-full transition-all duration-200 shrink-0 mr-1 ${input.trim() && !loading
                                        ? 'bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-105 shadow-lg shadow-cyan-500/20'
                                        : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                        }`}
                                >
                                    {loading ? (
                                        <Sparkles className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Send className="h-5 w-5 ml-0.5" />
                                    )}
                                </button>
                            </div>
                        )}

                        <div className="text-center text-[10px] text-gray-600 mt-3 font-medium tracking-wide">
                            AI can make mistakes. Please verify important information.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
