"use client";
import React, { useEffect, useState } from "react";
import behaviorService from "@/services/behavior.service";
import BehaviorLogModal from "@/components/dashboard/BehaviorLogModal";
import { BrainCircuit, TrendingUp, Lightbulb, Activity, CheckCircle2, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function BehaviorPage() {
    const [summary, setSummary] = useState(null);
    const [todayLog, setTodayLog] = useState(null);
    const [explanation, setExplanation] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const [summaryData, logData, explainData] = await Promise.all([
                behaviorService.getSummary(7),
                behaviorService.getBehaviorByDate(today).catch(() => null),
                behaviorService.explainScore(today).catch(() => ({ explanation: "Not enough data for explanation yet." }))
            ]);

            setSummary(summaryData);
            setTodayLog(logData);
            setExplanation(explainData?.explanation || "No explanation available.");
        } catch (err) {
            console.error("Behavior fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper to get color based on score
    const getScoreColor = (score) => {
        if (score >= 80) return "text-green-500 border-green-500/50 shadow-green-900/50";
        if (score >= 60) return "text-cyan-500 border-cyan-500/50 shadow-cyan-900/50";
        if (score >= 40) return "text-yellow-500 border-yellow-500/50 shadow-yellow-900/50";
        return "text-red-500 border-red-500/50 shadow-red-900/50";
    };

    const currentScore = todayLog?.score || 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
                        <BrainCircuit className="h-8 w-8 text-cyan-500" />
                        Neural Analysis
                    </h1>
                    <p className="text-gray-400 font-mono text-sm max-w-xl">
                        Monitor behavioral patterns and productivity metrics.
                    </p>
                </div>

                <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="scanline"
                    className="shrink-0"
                >
                    <Activity className="h-4 w-4" /> Log Current State
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Score Gauge */}
                <Card className="flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <BrainCircuit className="w-64 h-64" />
                    </div>

                    <h2 className="text-gray-400 text-sm font-mono font-bold uppercase tracking-widest mb-8">
                        Productivity Index
                    </h2>

                    {loading ? (
                        <div className="w-48 h-48 rounded-full border-4 border-white/5 animate-spin border-t-cyan-500 flex items-center justify-center">
                            <span className="text-cyan-500 font-mono text-xs animate-pulse">CALCULATING...</span>
                        </div>
                    ) : (
                        <div className="relative group">
                            <div className={`
                                w-56 h-56 rounded-full border-8 flex items-center justify-center transition-all duration-1000
                                ${getScoreColor(currentScore).replace('text-', 'border-')} 
                                shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black/50 backdrop-blur-sm
                            `}>
                                <div className="text-center z-10">
                                    <span className={`text-7xl font-black tracking-tighter shimmer-text ${getScoreColor(currentScore).split(' ')[0]}`}>
                                        {currentScore}
                                    </span>
                                    <div className="text-xs text-gray-500 font-mono mt-2 bg-black/50 px-2 py-1 rounded inline-block border border-white/5">
                                        MAX CAPACITY
                                    </div>
                                </div>
                            </div>

                            {/* Decorative rings */}
                            <div className="absolute inset-0 rounded-full border border-white/5 scale-110 animate-pulse-slow" />
                            <div className="absolute inset-0 rounded-full border border-white/5 scale-125 opacity-30" />
                        </div>
                    )}

                    <div className="mt-10 text-center max-w-md bg-white/5 p-4 rounded-lg border border-white/5 backdrop-blur-sm">
                        <div className="flex items-start justify-center gap-3 text-gray-300 text-sm">
                            <Lightbulb className="text-yellow-500 shrink-0 mt-0.5 h-4 w-4" />
                            <p className="font-mono text-xs leading-relaxed">
                                {loading ? "ANALYZING NEURAL PATTERNS..." : explanation}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Trends & Stats */}
                <div className="space-y-6">
                    {/* Trend Chart */}
                    <Card title="7-Day Trend Analysis" icon={TrendingUp}>
                        {loading ? (
                            <div className="h-48 flex items-end justify-between gap-2 px-2 opacity-50">
                                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                    <div key={i} className="w-full bg-white/5 rounded-t animate-pulse" style={{ height: `${Math.random() * 80 + 20}%` }} />
                                ))}
                            </div>
                        ) : (
                            <div className="h-64 flex items-end justify-between gap-3 px-2 pt-8 pb-2">
                                {(summary?.history || []).length > 0 ? (
                                    (summary?.history || []).map((day, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-3 group w-full h-full justify-end">
                                            <div
                                                className={`
                                                    w-full rounded-t transition-all duration-500 hover:opacity-80 relative group-hover:scale-110 origin-bottom
                                                    ${getScoreColor(day.score || 0).replace('text-', 'bg-').split(' ')[0]}
                                                `}
                                                style={{ height: `${Math.max(day.score || 5, 5)}%` }}
                                            >
                                                {/* Tooltip */}
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/20 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                                    Score: {day.score}
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-500 font-mono border-t border-white/10 pt-2 w-full text-center">
                                                {new Date(day.date).getDate()}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-lg">
                                        <TrendingUp className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-xs">Insufficient trend data</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <Card className="border-t-4 border-t-purple-500/50">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Focus Duration</div>
                                <Clock className="h-4 w-4 text-purple-500" />
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight">
                                {loading ? "-" : (todayLog?.focusHours || 0)}
                                <span className="text-sm font-normal text-gray-500 ml-1">hrs</span>
                            </div>
                        </Card>

                        <Card className="border-t-4 border-t-cyan-500/50">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Tasks Executed</div>
                                <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight">
                                {loading ? "-" : (todayLog?.tasksCompleted || 0)}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <BehaviorLogModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onLogSaved={fetchData}
                currentLog={todayLog}
            />
        </div>
    );
}
