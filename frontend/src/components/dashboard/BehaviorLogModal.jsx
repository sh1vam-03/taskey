"use client";
import React, { useState } from "react";
import { FaTimes, FaSave, FaSmile, FaMeh, FaFrown, FaBrain, FaCheck } from "react-icons/fa";
import behaviorService from "@/services/behavior.service";

export default function BehaviorLogModal({ isOpen, onClose, onLogSaved, currentLog = null }) {
    const [mood, setMood] = useState("NEUTRAL");
    const [focusHours, setFocusHours] = useState(0);
    const [tasksCompleted, setTasksCompleted] = useState(0);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Populate if existing log (for update) - though upsert handles it
    React.useEffect(() => {
        if (isOpen && currentLog) {
            setMood(currentLog.mood || "NEUTRAL");
            setFocusHours(currentLog.focusHours || 0);
            setTasksCompleted(currentLog.tasksCompleted || 0);
            setNotes(currentLog.notes || "");
        } else if (isOpen) {
            // Reset
            setMood("NEUTRAL");
            setFocusHours(0);
            setTasksCompleted(0);
            setNotes("");
        }
        setError(null);
    }, [isOpen, currentLog]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await behaviorService.upsertBehavior({
                mood,
                focusHours: Number(focusHours),
                tasksCompleted: Number(tasksCompleted),
                notes
            });
            onLogSaved();
            onClose();
        } catch (err) {
            console.error("Behavior log error:", err);
            if (err.response?.status === 403) {
                setError("Free plan limit reached. Upgrade to Pro.");
            } else {
                setError("Failed to save log. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const moodOptions = [
        { value: "GOOD", icon: FaSmile, color: "text-green-400", label: "Good" },
        { value: "NEUTRAL", icon: FaMeh, color: "text-yellow-400", label: "Neutral" },
        { value: "BAD", icon: FaFrown, color: "text-red-400", label: "Bad" }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FaBrain className="text-pink-500" /> Log Today's Vibe
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-200 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Mood Selector */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-3">How are you feeling?</label>
                        <div className="flex justify-between gap-4">
                            {moodOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setMood(option.value)}
                                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${mood === option.value ? 'bg-white/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-black/40 border-white/10 hover:bg-white/5'}`}
                                >
                                    <option.icon className={`text-2xl ${option.color}`} />
                                    <span className="text-xs font-bold text-gray-300">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Focus Hours */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Focus Hours</label>
                            <input
                                type="number"
                                min="0"
                                max="24"
                                step="0.5"
                                value={focusHours}
                                onChange={(e) => setFocusHours(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-sm text-center font-mono"
                            />
                        </div>
                        {/* Tasks Completed (Manual Override or Auto-filled) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tasks Done</label>
                            <input
                                type="number"
                                min="0"
                                value={tasksCompleted}
                                onChange={(e) => setTasksCompleted(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-sm text-center font-mono"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Daily Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="What went well? What didn't?"
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all placeholder-gray-600 min-h-[80px] resize-none text-sm"
                        />
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-cyan-900/20 disabled:opacity-50 ${loading ? 'cursor-not-allowed' : ''}`}
                        >
                            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaCheck />}
                            Save Log
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
