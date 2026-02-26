"use client";
import React, { useState, useEffect } from "react";
import { Smile, Meh, Frown, Sparkles, Check, Clock, ListTodo, Activity } from "lucide-react";
import behaviorService from "@/services/behavior.service";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function BehaviorLogModal({ isOpen, onClose, onLogSaved, currentLog = null, latestLog = null }) {
    const [mood, setMood] = useState("NEUTRAL");
    const [sleepHours, setSleepHours] = useState(7); // Default to reasonable amount
    const [exercise, setExercise] = useState(false);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            if (currentLog) {
                // Editing today's existing log
                setMood(currentLog.mood || "NEUTRAL");
                setSleepHours(currentLog.sleepHours ?? 7);
                setExercise(currentLog.exercise || false);
                setNotes(currentLog.notes || "");
            } else if (latestLog) {
                // Pre-fill from latest log (e.g. yesterday)
                setMood("NEUTRAL"); // Mood resets
                setSleepHours(latestLog.sleepHours ?? 7);
                setExercise(latestLog.exercise || false); // Maybe they usually exercise?
                setNotes(""); // Notes reset
            } else {
                // Defaults
                setMood("NEUTRAL");
                setSleepHours(7);
                setExercise(false);
                setNotes("");
            }
            setError(null);
        }
    }, [isOpen, currentLog, latestLog]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await behaviorService.upsertBehavior({
                date: new Date().toLocaleDateString('en-CA'),
                mood,
                sleepHours: Number(sleepHours),
                exercise,
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
        { value: "HAPPY", icon: Smile, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/50", label: "OPTIMAL" },
        { value: "NEUTRAL", icon: Meh, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/50", label: "NOMINAL" },
        { value: "SAD", icon: Frown, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/50", label: "CRITICAL" }
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="LOG NEURAL STATE"
            className="border-purple-500/20 bg-black/90 backdrop-blur-xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-200 text-sm rounded-lg font-mono">
                        {error}
                    </div>
                )}

                {/* Mood Selector */}
                <div className="space-y-3">
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-purple-400" /> Current Sentiment
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {moodOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setMood(option.value)}
                                className={`
                                    flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200
                                    ${mood === option.value
                                        ? `${option.bg} ${option.border} ring-1 ring-white/10`
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 opacity-70 hover:opacity-100'
                                    }
                                `}
                            >
                                <option.icon className={`h-6 w-6 ${option.color}`} />
                                <span className={`text-[10px] font-bold font-mono uppercase ${option.color}`}>{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Sleep Hours */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3 w-3" /> Sleep Duration
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="24"
                                step="0.5"
                                value={sleepHours}
                                onChange={(e) => setSleepHours(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm font-mono text-center"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs font-mono">HRS</span>
                        </div>
                    </div>
                    {/* Exercise Toggle */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="h-3 w-3" /> Exercise
                        </label>
                        <button
                            type="button"
                            onClick={() => setExercise(!exercise)}
                            className={`w-full h-[46px] rounded-lg border transition-all text-sm font-mono flex items-center justify-center gap-2
                                ${exercise
                                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                                    : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}
                            `}
                        >
                            {exercise ? <Check className="h-4 w-4" /> : null}
                            {exercise ? 'COMPLETED' : 'SKIPPED'}
                        </button>
                    </div>
                </div>



                {/* Notes */}
                <div className="space-y-2">
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-widest">Observation Log</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Record behavioral observations..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-all placeholder-gray-600 min-h-[100px] resize-none text-sm font-mono"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                    >
                        DISCARD
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="min-w-[140px]"
                    >
                        {loading ? 'SAVING...' : 'COMMIT LOG'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
