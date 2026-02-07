"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { FaRobot, FaUser, FaPaperPlane } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function AiConsolePage() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q");
    const scrollRef = useRef(null);

    // Local state for demo/MVP (replace with real hook later if fully integrated)
    const [messages, setMessages] = useState([
        { id: 1, role: "system", content: "Taskey Neural Link Established. Ready for input." }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // Auto-send initial query
    useEffect(() => {
        if (initialQuery) {
            handleSend(initialQuery);
        }
    }, [initialQuery]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (text) => {
        if (!text.trim()) return;

        const userMsg = { id: Date.now(), role: "user", content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulate AI Response (Mock for now, replacing backend connection until finalized)
        setTimeout(() => {
            const aiMsg = {
                id: Date.now() + 1,
                role: "assistant",
                content: `Processed: "${text}". I have updated your schedule and task list accordingly.`
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm relative">
            {/* Grid Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
                style={{ backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)", backgroundSize: "40px 40px" }}
            />

            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-black/50 backdrop-blur-md flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/50 flex items-center justify-center border border-cyan-500/20">
                        <FaRobot className="text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white font-mono">NEURAL_CONSOLE_V1</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] text-gray-500 uppercase">System Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 z-10 scroll-smooth">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-purple-900/50 text-purple-200" : "bg-cyan-900/50 text-cyan-200"
                                }`}>
                                {msg.role === "user" ? <FaUser className="w-3 h-3" /> : <FaRobot className="w-3 h-3" />}
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                    ? "bg-purple-950/30 border border-purple-500/20 text-gray-200 rounded-tr-sm"
                                    : "bg-zinc-950/80 border border-white/10 text-gray-300 rounded-tl-sm shadow-xl"
                                }`}>
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center text-cyan-200">
                            <FaRobot className="w-3 h-3" />
                        </div>
                        <div className="flex items-center gap-1 p-4 bg-zinc-950/80 border border-white/10 rounded-2xl rounded-tl-sm">
                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/50 border-t border-white/5 backdrop-blur-md z-10">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                    className="flex items-center gap-2 bg-zinc-900/50 border border-white/10 rounded-xl p-2 focus-within:border-cyan-500/50 transition-colors"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a command..."
                        className="flex-1 bg-transparent border-none outline-none text-white px-2 font-mono text-sm placeholder-gray-600"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 transition-colors"
                    >
                        <FaPaperPlane className="w-3 h-3" />
                    </button>
                </form>
            </div>
        </div>
    );
}
