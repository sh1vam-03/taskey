"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPaperPlane, FaMicrophone } from "react-icons/fa";

export default function AiCommandInput({ className = "" }) {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Navigate to AI Console with query
        router.push(`/dashboard/ai?q=${encodeURIComponent(query)}`);
    };

    return (
        <form onSubmit={handleSubmit} className={`relative group ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-center bg-black border border-white/10 rounded-xl p-2 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all shadow-xl">
                <button type="button" className="p-3 text-gray-500 hover:text-cyan-400 transition-colors">
                    <FaMicrophone />
                </button>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask Taskey to plan your day..."
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600 px-2 font-mono text-sm"
                />

                <button
                    type="submit"
                    disabled={!query.trim()}
                    className="p-2 bg-gradient-to-br from-cyan-600 to-cyan-800 text-white rounded-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaPaperPlane className="w-3 h-3" />
                </button>
            </div>
        </form>
    );
}
