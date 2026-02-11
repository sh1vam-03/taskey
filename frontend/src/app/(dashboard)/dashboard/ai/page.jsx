'use client';

import { useState, useEffect, useRef } from 'react';
import aiService from '@/services/ai.service';
import { useAuth } from '@/context/AuthContext';
import { Bot, Mic, Send, Plus, MessageSquare, Trash2, StopCircle, Sparkles, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function AIPage() {
    const { user, refreshProfile } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [currentConv, setCurrentConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const messagesEndRef = useRef(null);

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

    const handleDeleteChat = async (e, id) => {
        e.stopPropagation();
        if (!confirm("Delete this chat?")) return;
        try {
            await aiService.deleteConversation(id);
            const updated = conversations.filter(c => c.id !== id);
            setConversations(updated);
            if (currentConv?.id === id) {
                setCurrentConv(updated[0] || null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !currentConv) return;

        const tempMsg = { role: 'user', content: input, id: Date.now() };
        setMessages(prev => [...prev, tempMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await aiService.sendMessage(currentConv.id, input);
            setMessages(prev => [...prev, response]);
            if (refreshProfile) refreshProfile();
        } catch (err) {
            console.error(err);
            alert("Failed to send message. Check credits.");
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
            alert("Microphone access denied");
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
            alert("Voice processing failed. Check credits.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Sidebar List */}
            <Card className="w-80 flex flex-col p-0 overflow-hidden bg-black/50 border-white/10">
                <div className="p-4 border-b border-white/10">
                    <Button onClick={handleNewChat} variant="scanline" className="w-full">
                        <Plus className="h-4 w-4" /> INITIALIZE_NEW_SESSION
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {conversations.map(c => (
                        <div
                            key={c.id}
                            onClick={() => setCurrentConv(c)}
                            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer text-sm mb-1 transition-all border border-transparent ${currentConv?.id === c.id
                                    ? 'bg-white/10 text-white border-white/10 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3 truncate">
                                <MessageSquare className={`h-4 w-4 min-w-4 transition-colors ${currentConv?.id === c.id ? 'text-cyan-400' : 'text-gray-600'}`} />
                                <span className="truncate font-mono text-xs tracking-wide">{c.title || "UNTITLED_SESSION"}</span>
                            </div>
                            <button
                                onClick={(e) => handleDeleteChat(e, c.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/20 hover:text-red-400 transition-all text-gray-500"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col p-0 overflow-hidden bg-black/50 border-white/10 relative">
                {!currentConv ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <div className="relative">
                            <Bot className="h-24 w-24 mb-6 opacity-20 text-cyan-500" />
                            <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">AI Neural Interface</h2>
                        <p className="font-mono text-sm">Select or initialize a conversation node.</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50 backdrop-blur-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                    <BrainCircuit className="h-4 w-4 text-cyan-400" />
                                </div>
                                <h2 className="font-bold text-white truncate max-w-md tracking-tight">{currentConv.title || "Active Session"}</h2>
                            </div>
                            <div className="text-[10px] font-mono text-gray-500 flex items-center gap-3 uppercase tracking-wider">
                                <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5">
                                    <Sparkles className="w-3 h-3 text-cyan-500" />
                                    <span>Chat: 1 Token</span>
                                </span>
                                <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5">
                                    <Mic className="w-3 h-3 text-purple-500" />
                                    <span>Voice: 3 Tokens</span>
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm relative group ${m.role === 'user'
                                        ? 'bg-white text-black rounded-br-none'
                                        : 'bg-white/5 text-gray-200 border border-white/10 rounded-bl-none'
                                        }`}>

                                        {/* Avatar for AI */}
                                        {m.role !== 'user' && (
                                            <div className="absolute -left-10 bottom-0 w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center">
                                                <Bot className="w-4 h-4 text-cyan-500" />
                                            </div>
                                        )}

                                        <div className="prose prose-sm prose-invert max-w-none leading-relaxed">
                                            <ReactMarkdown>{m.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-75" />
                                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-black/80 backdrop-blur-xl rounded-b-xl">
                            <div className="flex gap-3 max-w-4xl mx-auto">
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`p-3 rounded-xl transition-all duration-300 border ${isRecording
                                            ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse'
                                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                        }`}
                                    title={isRecording ? "Stop Recording" : "Start Voice (3 Credits)"}
                                >
                                    {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                </button>

                                <div className="flex-1 relative">
                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                        placeholder="Execute command or query... (1 Token)"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm"
                                        disabled={loading || isRecording}
                                    />
                                    <div className="absolute right-2 top-2 p-1 bg-black/50 rounded text-[10px] text-gray-500 font-mono hidden md:block">
                                        RET
                                    </div>
                                </div>

                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading}
                                    className="p-3 bg-white text-black rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}
