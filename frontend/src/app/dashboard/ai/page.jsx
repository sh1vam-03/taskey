"use client";
import React, { useEffect, useState, useRef } from "react";
import aiService from "@/services/ai.service";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
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
            const data = await aiService.getConversations();
            // Backend likely returns { success: true, data: [...] } or just [...]
            const list = data.data || data || [];
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
                const data = await aiService.getMessages(currentConversationId);
                const list = data.data || data || [];
                // Sort by createdAt usually? Backend might store in order.
                setMessages(list); // Assuming valid order
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
            const newConv = await aiService.createConversation("New Chat");
            // Add to list and select
            const fresh = newConv.data || newConv;
            setConversations([fresh, ...conversations]);
            setCurrentConversationId(fresh.id);
            setMessages([]);
            // Mobile: Close sidebar
            if (window.innerWidth < 768) setSidebarOpen(false);
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
            const response = await aiService.sendMessage(currentConversationId, userMsg);
            // Response typically contains the AI message or the full new message object
            const aiMsg = response.data || response;
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
        <div className="flex h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] overflow-hidden rounded-xl border border-white/10 bg-black/40">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-0'} md:w-64 bg-zinc-900/80 border-r border-white/5 flex flex-col transition-all duration-300 overflow-hidden`}>
                <div className="p-4 border-b border-white/5">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-lg font-bold text-sm transition-colors"
                    >
                        <FaPlus /> New Chat
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
                    {loadingConversations ? (
                        <SkeletonLoader type="list" />
                    ) : conversations.length === 0 ? (
                        <p className="text-gray-500 text-xs text-center p-4">No conversations yet.</p>
                    ) : (
                        conversations.map(c => (
                            <div
                                key={c.id}
                                onClick={() => {
                                    setCurrentConversationId(c.id);
                                    if (window.innerWidth < 768) setSidebarOpen(false);
                                }}
                                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${currentConversationId === c.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                    }`}
                            >
                                <div className="truncate text-sm pr-2">
                                    {c.title || `Conversation ${c.id.slice(0, 4)}...`}
                                </div>
                                <button
                                    onClick={(e) => handleDeleteChat(e, c.id)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity p-1"
                                >
                                    <FaTrash size={12} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-zinc-950/30 relative">
                {/* Mobile Header Toggle */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden absolute top-4 left-4 z-10 p-2 bg-black/50 rounded text-gray-400"
                >
                    <FaBars />
                </button>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {!currentConversationId ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                            <FaRobot className="w-16 h-16 mb-4" />
                            <p>Select or start a new conversation</p>
                        </div>
                    ) : loadingMessages ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600">
                            <p>Start chatting with Taskey AI...</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-cyan-600' : 'bg-purple-600'
                                    }`}>
                                    {msg.role === 'user' ? <FaUser size={12} /> : <FaRobot size={14} />}
                                </div>
                                <div className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-cyan-900/30 text-cyan-50 border border-cyan-500/20'
                                        : 'bg-zinc-800/50 text-gray-200 border border-white/5'
                                    }`}>
                                    {msg.role === 'assistant' ? (
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    {sending && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0 animate-pulse">
                                <FaRobot size={14} />
                            </div>
                            <div className="bg-zinc-800/50 px-4 py-3 rounded-xl border border-white/5 flex items-center gap-2">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-zinc-900/50 border-t border-white/5">
                    <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={currentConversationId ? "Type a message..." : "Select a conversation first..."}
                            disabled={!currentConversationId || sending}
                            className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            type="submit"
                            disabled={!currentConversationId || !input.trim() || sending}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-0 disabled:pointer-events-none"
                        >
                            <FaPaperPlane size={14} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
