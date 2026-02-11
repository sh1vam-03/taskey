"use client";
import React, { useEffect, useState, useRef } from "react";
import aiService from "@/services/ai.service";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { FaPlus, FaPaperPlane, FaTrash, FaRobot, FaUser, FaBars } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

export default function AIChatPage() {
    const [conversations, setConversations] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [messages, setMessages] = useState([]); // [{ role, content }]
    const [input, setInput] = useState("");
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load Conversations on Mount
    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        setLoadingConversations(true);
        try {
            const list = await aiService.getConversations();
            if (Array.isArray(list)) {
                setConversations(list);
                if (list.length > 0 && !currentConversationId) {
                    setCurrentConversationId(list[0].id);
                }
            }
        } catch (err) {
            console.error("Failed to load conversations", err);
        } finally {
            setLoadingConversations(false);
        }
    };

    // Load Messages when current conversation changes
    useEffect(() => {
        if (!currentConversationId) {
            setMessages([]);
            return;
        }

        const loadMessages = async () => {
            setLoadingMessages(true);
            try {
                const list = await aiService.getMessages(currentConversationId);
                setMessages(Array.isArray(list) ? list : []);
            } catch (err) {
                console.error("Failed to load messages", err);
            } finally {
                setLoadingMessages(false);
            }
        };

        loadMessages();
    }, [currentConversationId]);

    const handleNewChat = async () => {
        try {
            const fresh = await aiService.createConversation("New Chat");
            // Add to list and select
            if (fresh) {
                setConversations([fresh, ...conversations]);
                setCurrentConversationId(fresh.id);
                setMessages([]);
                // Mobile: Close sidebar
                if (window.innerWidth < 768) setSidebarOpen(false);
            }
        } catch (err) {
            console.error("Create chat error", err);
        }
    };

    const handleDeleteChat = async (e, id) => {
        e.stopPropagation();
        if (!confirm("Delete this conversation?")) return;
        try {
            await aiService.deleteConversation(id);
            const updated = conversations.filter(c => c.id !== id);
            setConversations(updated);
            if (currentConversationId === id) {
                setCurrentConversationId(updated[0]?.id || null);
            }
        } catch (err) {
            console.error("Delete chat error", err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !currentConversationId) return;

        const userMsg = input;
        setInput("");
        setSending(true);

        // Optimistic Update
        const tempUserMsg = { role: "user", content: userMsg, id: Date.now() };
        setMessages(prev => [...prev, tempUserMsg]);

        try {
            const aiMsg = await aiService.sendMessage(currentConversationId, userMsg);

            // Add AI message to state
            // If backend returns just content string, we wrap it. If object, use it.
            const validAiMsg = aiMsg.content ? aiMsg : { role: "assistant", content: typeof aiMsg === 'string' ? aiMsg : JSON.stringify(aiMsg) };

            setMessages(prev => [...prev, validAiMsg]);
        } catch (err) {
            console.error("Send error", err);
            // Optionally remove optimistic message or show error
            setMessages(prev => [...prev, { role: "system", content: "Error sending message. Please try again." }]);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] gap-4">
            {/* Header - Compact for Chat */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-950/30 rounded-lg border border-cyan-500/30">
                        <FaRobot className="text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">AI Console</h1>
                        <div className="flex items-center gap-2">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] text-gray-400 font-mono uppercase">Neural_Net_Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm shadow-2xl relative">
                {/* Sidebar */}
                <div className={`${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:translate-x-0'} absolute md:relative z-20 h-full bg-zinc-900/95 md:bg-zinc-900/50 border-r border-white/5 flex flex-col transition-all duration-300`}>
                    <div className="p-4 border-b border-white/5">
                        <Button
                            onClick={handleNewChat}
                            variant="scanline"
                            className="w-full"
                        >
                            <FaPlus className="mr-2 group-hover:rotate-90 transition-transform" /> Initialize_Sequence
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {loadingConversations ? (
                            <SkeletonLoader type="list" />
                        ) : conversations.length === 0 ? (
                            <div className="text-center p-8 opacity-50">
                                <div className="text-[10px] font-mono text-gray-500 uppercase">No_Data_Packets</div>
                            </div>
                        ) : (
                            conversations.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => {
                                        setCurrentConversationId(c.id);
                                        if (window.innerWidth < 768) setSidebarOpen(false);
                                    }}
                                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border border-transparent ${currentConversationId === c.id
                                        ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-100 shadow-[0_0_15px_rgba(8,145,178,0.1)]'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 hover:border-white/5'
                                        }`}
                                >
                                    <div className="truncate text-xs font-mono pr-2 opacity-80 group-hover:opacity-100">
                                        {c.title || `LOG_SEQ_${c?.id?.slice(0, 4)}`}
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteChat(e, c.id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1.5 hover:bg-red-950/30 rounded"
                                    >
                                        <FaTrash size={10} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-zinc-950/30 relative min-w-0">
                    {/* Mobile Header Toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`md:hidden absolute top-4 left-4 z-30 p-2 bg-black/50 rounded text-gray-400 border border-white/10 backdrop-blur-md ${sidebarOpen ? 'hidden' : 'block'}`}
                    >
                        <FaBars />
                    </button>

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth custom-scrollbar">
                        {!currentConversationId ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-20 select-none">
                                <FaRobot className="w-24 h-24 mb-6" />
                                <p className="font-mono text-sm uppercase tracking-widest">System_Standby</p>
                            </div>
                        ) : loadingMessages ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                                    <div className="text-[10px] font-mono text-cyan-500 animate-pulse">DECRYPTING_Logs...</div>
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center">
                                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 max-w-sm text-center">
                                    <div className="w-12 h-12 bg-cyan-950/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                                        <FaRobot className="text-cyan-400" />
                                    </div>
                                    <h3 className="text-white font-bold mb-2">Neural Interface Ready</h3>
                                    <p className="text-sm text-gray-500 mb-6">Ask me to analyze your schedule, suggest focus times, or break down complex tasks.</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {["Analyze my productivity", "Draft a schedule for tomorrow", "Help me focus"].map(suggestion => (
                                            <button
                                                key={suggestion}
                                                onClick={() => setInput(suggestion)}
                                                className="text-xs text-gray-400 hover:text-cyan-400 bg-black/20 hover:bg-cyan-950/20 py-2 rounded border border-white/5 hover:border-cyan-500/30 transition-colors"
                                            >
                                                "{suggestion}"
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start group`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-lg ${msg.role === 'user'
                                        ? 'bg-zinc-900 border-gray-700 text-gray-300'
                                        : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-400 shadow-cyan-900/10'
                                        }`}>
                                        {msg.role === 'user' ? <FaUser size={12} /> : <FaRobot size={14} />}
                                    </div>

                                    <div className={`max-w-[85%] md:max-w-[75%]`}>
                                        <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm relative ${msg.role === 'user'
                                            ? 'bg-zinc-800 text-gray-200 rounded-tr-sm border border-white/5'
                                            : 'bg-black/40 text-gray-300 rounded-tl-sm border border-cyan-900/20 shadow-[0_0_15px_rgba(0,0,0,0.2)]'
                                            }`}>
                                            {/* Technical Header for AI */}
                                            {msg.role === 'assistant' && (
                                                <div className="absolute -top-5 left-0 text-[8px] font-mono text-cyan-600/50 uppercase tracking-widest pl-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Response_Packet_ID_{idx}
                                                </div>
                                            )}

                                            {msg.role === 'assistant' ? (
                                                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-code:text-cyan-300">
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            )}
                                        </div>
                                        <div className={`text-[10px] text-gray-600 mt-1 font-mono ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {sending && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-center shrink-0 animate-pulse">
                                    <FaRobot size={14} className="text-cyan-400" />
                                </div>
                                <div className="bg-black/40 px-5 py-4 rounded-2xl rounded-tl-sm border border-cyan-900/20 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-zinc-900/80 border-t border-white/5 backdrop-blur-md">
                        <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto flex gap-2">
                            <Input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={currentConversationId ? "Enter command or query..." : "Initialize conversation first..."}
                                disabled={!currentConversationId || sending}
                                className="h-12 rounded-lg pr-12"
                            />
                            <Button
                                type="submit"
                                disabled={!currentConversationId || !input.trim() || sending}
                                variant="scanline"
                                className="h-12 w-12 p-0 flex items-center justify-center rounded-lg"
                            >
                                <FaPaperPlane size={14} />
                            </Button>
                        </form>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-gray-700 font-mono">AI_MODEL_V2.0 // SYSTEM_OPTIMIZED</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
