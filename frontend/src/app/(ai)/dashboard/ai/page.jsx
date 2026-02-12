"use client";

import { useState, useEffect, useRef } from 'react';
import aiService from '@/services/ai.service';
import { useAuth } from '@/context/AuthContext';
import { Bot, Mic, Send, Plus, MessageSquare, Trash2, StopCircle, Sparkles, BrainCircuit, MicOff, Calendar as CalendarIcon, Keyboard } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useToast } from '@/context/ToastContext';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import AiEnergySphere from '@/components/ui/AiEnergySphere';

export default function AIPage() {
    const { toast, success, error, info } = useToast();
    const { user, refreshProfile } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [currentConv, setCurrentConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [voiceMode, setVoiceMode] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const messagesEndRef = useRef(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    useEffect(() => {
        loadConversations();
    }, []);

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

    const loadConversations = async () => {
        try {
            const data = await aiService.getConversations();
            setConversations(data);
            if (data.length > 0 && !currentConv) {
                // Determine if we should auto-select based on URL or just don't select to show sphere
                // Letting user select or showing sphere is better UX for "AI Page"
                // But prompt said "If already exists... keep it".
                // Existing code auto-selected. Let's keep it but maybe only if there are convos.
                // Actually, to show off the Sphere, let's NOT auto-select if it's a fresh load, 
                // OR auto-select if user expects it. 
                // Let's stick to existing behavior: select first if available.
                setCurrentConv(data[0]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadMessages = async (id) => {
        try {
            const msgs = await aiService.getMessages(id);
            setMessages(msgs);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNewChat = async () => {
        try {
            const newConv = await aiService.createConversation("New Conversation");
            setConversations([newConv.conversation, ...conversations]);
            setCurrentConv(newConv.conversation);
            setMessages([]);
        } catch (err) {
            console.error(err);
        }
    };

    const confirmDeleteChat = (e, id) => {
        e.stopPropagation();
        setDeleteModal({ isOpen: true, id });
    };

    const handleDeleteChat = async () => {
        try {
            await aiService.deleteConversation(deleteModal.id);
            const updated = conversations.filter(c => c.id !== deleteModal.id);
            setConversations(updated);
            if (currentConv?.id === deleteModal.id) {
                setCurrentConv(updated[0] || null);
            }
            setDeleteModal({ isOpen: false, id: null });
            success("Conversation deleted");
        } catch (err) {
            console.error(err);
            error("Failed to delete conversation");
        }
    };

    const handleSend = async () => {
        if (!input.trim() && !voiceMode) return;

        let activeId = currentConv?.id;

        // Auto-create conversation if none selected
        if (!activeId) {
            try {
                const newConv = await aiService.createConversation(input.substring(0, 30) || "New Conversation");
                setConversations([newConv.conversation, ...conversations]);
                setCurrentConv(newConv.conversation);
                activeId = newConv.conversation.id;
            } catch (err) {
                console.error(err);
                error("Failed to start conversation");
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
        <div className="flex flex-1 w-full bg-black text-white font-sans overflow-hidden">
            {/* Sidebar - Fixed with ChatGPT style */}
            <div className="w-[260px] bg-[#171717] flex-col border-r border-white/5 hidden md:flex shrink-0">
                <div className="p-3">
                    <Button
                        onClick={handleNewChat}
                        variant="ghost"
                        className="w-full justify-start gap-3 border border-white/10 hover:bg-white/5 text-sm py-5 px-3 mb-2 transition-colors rounded-lg group"
                    >
                        <div className="p-1 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                            <Plus className="h-4 w-4" />
                        </div>
                        New chat
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                    <div className="text-xs font-medium text-gray-500 px-3 py-2">History</div>
                    {loading && conversations.length === 0 ? (
                        <div className="space-y-2 px-2">
                            <div className="h-8 bg-white/5 rounded w-full animate-pulse" />
                            <div className="h-8 bg-white/5 rounded w-3/4 animate-pulse" />
                        </div>
                    ) : (
                        conversations.map(c => (
                            <div
                                key={c.id}
                                className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer text-sm transition-colors relative ${currentConv?.id === c.id
                                    ? 'bg-[#212121] text-white'
                                    : 'text-gray-400 hover:bg-[#212121] hover:text-white'
                                    }`}
                                onClick={() => setCurrentConv(c)}
                            >
                                <MessageSquare className="h-4 w-4 shrink-0" />
                                <span className="truncate flex-1 text-sm">{c.title || "New chat"}</span>

                                {currentConv?.id === c.id && (
                                    <div className="absolute right-2 flex items-center bg-[#212121] shadow-[-10px_0_10px_#212121]">
                                        <button
                                            onClick={(e) => confirmDeleteChat(e, c.id)}
                                            className="p-1 hover:text-red-400 text-gray-400 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* User/Settings Area could go here */}
                <div className="p-3 border-t border-white/5">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-sm text-gray-300">
                        <div className="w-8 h-8 rounded bg-cyan-900/40 flex items-center justify-center text-cyan-400 font-bold border border-cyan-500/20">
                            AI
                        </div>
                        <div className="flex-1">
                            <div className="font-medium">My Plan</div>
                            <div className="text-xs text-gray-500">Free Tier</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full relative bg-[#212121]">
                {/* Header - Minimalist */}
                {/* Header removed from page, handled by layout */}

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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full px-6">
                                    {[
                                        { icon: Sparkles, label: "Brainstorm ideas", sub: "for a marketing campaign" },
                                        { icon: BrainCircuit, label: "Explain quantum computing", sub: "in simple terms" },
                                        { icon: CalendarIcon, label: "Plan my schedule", sub: "for the upcoming week" },
                                        { icon: MessageSquare, label: "Draft an email", sub: "requesting a deadline extension" }
                                    ].map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setInput(item.label + " " + item.sub)}
                                            className="text-left p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm group"
                                        >
                                            <div className="font-medium text-gray-200 mb-1 group-hover:text-white">{item.label}</div>
                                            <div className="text-gray-500 text-xs">{item.sub}</div>
                                        </button>
                                    ))}
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
                                        ${m.role === 'user' ? 'bg-[#2f2f2f] px-5 py-3 rounded-2xl rounded-tr-sm ml-auto' : 'w-full'}
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
                                        <div className="w-8 h-8 rounded-full bg-[#2f2f2f] flex items-center justify-center overflow-hidden shrink-0 mt-1">
                                            <div className="text-xs font-bold text-gray-300">YO</div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {loading && (
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-cyan-600/20 flex items-center justify-center border border-cyan-500/20 shrink-0">
                                        <div className="w-4 h-4 rounded-full border-2 border-cyan-400/50 border-t-cyan-400 animate-spin" />
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75" />
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    )}
                </div>

                {/* Fixed Input Area */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pb-6 pt-10 px-4">
                    <div className="max-w-3xl mx-auto relative">
                        {voiceMode ? (
                            <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center gap-4 bg-[#2f2f2f] rounded-full border border-white/10 p-2 pl-6 shadow-lg">
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
                            <div className="relative flex items-end gap-2 bg-[#2f2f2f] rounded-xl border border-white/10 shadow-lg focus-within:border-white/20 transition-colors p-3">
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

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDeleteChat}
                title="Delete Chat"
                message="Remove this conversation from your history?"
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}

