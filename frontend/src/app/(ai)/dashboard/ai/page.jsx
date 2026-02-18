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
    const { refreshProfile } = useAuth();
    const { currentConv, setCurrentConv, createNewChat } = useAi(); // Consume Context

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [voiceMode, setVoiceMode] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const messagesEndRef = useRef(null);
    const [thinkingText, setThinkingText] = useState("Thinking...");

    const THINKING_STEPS = [
        "Reading your schedule...",
        "Checking pending tasks...",
        "Analyzing recent habits...",
        "Formulating plan..."
    ];

    useEffect(() => {
        if (!loading) return;

        let step = 0;
        setThinkingText(THINKING_STEPS[0]);

        const interval = setInterval(() => {
            step = (step + 1) % THINKING_STEPS.length;
            setThinkingText(THINKING_STEPS[step]);
        }, 2000); // Change every 2s

        return () => clearInterval(interval);
    }, [loading]);

    useEffect(() => {
        if (currentConv) {
            loadMessages(currentConv.id);
        } else {
            setMessages([]);
        }
    }, [currentConv]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, thinkingText]); // Scroll when text changes too

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
                const newConv = await createNewChat(input.substring(0, 30) || "New Conversation");
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
            error("Failed to send message. Check credits.");
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
            error("Voice processing failed. Check credits.");
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
                                <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {m.role !== 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-cyan-600/20 flex items-center justify-center border border-cyan-500/20 shrink-0 mt-1">
                                            <Bot className="w-5 h-5 text-cyan-400" />
                                        </div>
                                    )}

                                    <div className={`
                                        prose prose-invert max-w-[85%] md:max-w-none text-[15px] leading-7
                                        ${m.role === 'user' ? 'bg-[#212121] px-5 py-3 rounded-2xl rounded-tr-sm ml-auto' : 'w-full'}
                                    `}>
                                        <ReactMarkdown components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                return !inline && match ? (
                                                    <div className="rounded-md bg-black/50 p-4 border border-white/10 my-4 overflow-x-auto">
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    </div>
                                                ) : (
                                                    <code className="bg-white/10 rounded px-1 py-0.5 text-sm" {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}>
                                            {m.content}
                                        </ReactMarkdown>
                                    </div>

                                    {m.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-[#212121] flex items-center justify-center overflow-hidden shrink-0 mt-1">
                                            <div className="text-xs font-bold text-gray-300">YO</div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {loading && (
                                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="w-8 h-8 rounded-full bg-cyan-600/20 flex items-center justify-center border border-cyan-500/20 shrink-0">
                                        <BrainCircuit className="w-4 h-4 text-cyan-400 animate-pulse" />
                                    </div>
                                    <div className="flex flex-col justify-center gap-1 mt-1">
                                        <div className="text-sm text-cyan-400 font-mono tracking-wide animate-pulse">
                                            {thinkingText}
                                        </div>
                                        {/* Little dots */}
                                        <div className="flex gap-1">
                                            <span className="w-1 h-1 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1 h-1 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1 h-1 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    )}
                </div>

                {/* Fixed Input Area */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black to-transparent pb-6 pt-10 px-4">
                    <div className="max-w-3xl mx-auto relative">
                        {voiceMode ? (
                            <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center gap-4 bg-[#1e1e1e] rounded-full border border-white/10 p-2 pl-6 shadow-lg">
                                    <span className="text-sm font-mono text-gray-400 animate-pulse">
                                        {isRecording ? "Listening..." : "Tap mic to speak"}
                                    </span>
                                    <div className="h-8 w-px bg-white/10" />
                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`p-4 rounded-full transition-all duration-300 ${isRecording
                                            ? 'bg-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-110'
                                            : 'bg-white/5 text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {isRecording ? <StopCircle className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                                    </button>
                                    <div className="h-8 w-px bg-white/10" />
                                    <button
                                        onClick={() => {
                                            stopRecording();
                                            setVoiceMode(false);
                                        }}
                                        className="p-3 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                                        title="Switch to Keyboard"
                                    >
                                        <Keyboard className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative flex items-end gap-2 bg-[#1e1e1e] rounded-xl border border-white/10 shadow-lg focus-within:border-white/20 transition-colors p-3">
                                <button
                                    onClick={() => setVoiceMode(true)}
                                    className="p-2 rounded-lg transition-all hover:bg-black/20 text-gray-400 hover:text-white"
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
                                    className="flex-1 max-h-[200px] min-h-[24px] bg-transparent border-0 text-white placeholder:text-gray-500 focus:ring-0 text-base resize-none py-1 scrollbar-thin scrollbar-thumb-white/10"
                                    rows={1}
                                    style={{ height: 'auto', minHeight: '24px' }}
                                    onInput={(e) => {
                                        e.currentTarget.style.height = 'auto';
                                        e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                    }}
                                    disabled={loading}
                                />

                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading}
                                    className={`p-2 rounded-lg transition-all ${input.trim() && !loading
                                        ? 'bg-cyan-600 text-white hover:bg-cyan-500'
                                        : 'bg-transparent text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        <div className="text-center text-xs text-gray-500 mt-2 font-mono">
                            AI can make mistakes. Check important info.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
