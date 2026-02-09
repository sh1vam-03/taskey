"use client";
import React, { useEffect, useState } from "react";
import behaviorService from "@/services/behavior.service";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import BehaviorLogModal from "@/components/dashboard/BehaviorLogModal";
import { FaBrain, FaChartLine, FaLightbulb } from "react-icons/fa";

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
        if (score >= 80) return "text-green-400 border-green-500/50 shadow-green-900/50";
        if (score >= 60) return "text-cyan-400 border-cyan-500/50 shadow-cyan-900/50";
        if (score >= 40) return "text-yellow-400 border-yellow-500/50 shadow-yellow-900/50";
        return "text-red-400 border-red-500/50 shadow-red-900/50";
    };

    const currentScore = todayLog?.score || 0;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FaBrain className="text-pink-500" /> AI Behavior Analysis
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-pink-900/20 transition-all"
                >
                    + Log Today
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Score Gauge */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <FaBrain className="w-48 h-48" />
                    </div>

                    <h2 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-6">Today's Productivity Score</h2>

                    {loading ? (
                        <div className="w-48 h-48 rounded-full border-4 border-white/5 animate-pulse flex items-center justify-center">
                            <span className="text-gray-600">Calculating...</span>
                        </div>
                    ) : (
                        <div className={`w-48 h-48 rounded-full border-8 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all ${getScoreColor(currentScore).replace('text-', 'border-')}`}>
                            <div className="text-center">
                                <span className={`text-6xl font-black ${getScoreColor(currentScore).split(' ')[0]}`}>
                                    {currentScore}
                                </span>
                                <div className="text-xs text-gray-500 font-mono mt-1">/ 100</div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 text-center max-w-sm">
                        <div className="flex items-start justify-center gap-2 text-gray-400 text-sm italic">
                            <FaLightbulb className="text-yellow-400 shrink-0 mt-0.5" />
                            <p>{loading ? "Analyzing patterns..." : explanation}</p>
                        </div>
                    </div>
                </div>

                {/* Trends & Stats */}
                <div className="space-y-6">
                    {/* Trend Chart Placeholder */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                            <FaChartLine /> 7-Day Trend
                        </h3>
                        {loading ? (
                            <SkeletonLoader type="list" />
                        ) : (
                            <div className="h-48 flex items-end justify-between gap-2 px-2">
                                {(summary?.history || []).map((day, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-2 group w-full">
                                        <div
                                            className={`w-full rounded-t-sm transition-all hover:opacity-80 ${getScoreColor(day.score || 0).replace('text-', 'bg-').split(' ')[0]}`}
                                            style={{ height: `${Math.max(day.score || 5, 5)}%` }}
                                        ></div>
                                        <span className="text-[10px] text-gray-600 font-mono">{new Date(day.date).getDate()}</span>
                                    </div>
                                ))}
                                {(summary?.history || []).length === 0 && (
                                    <p className="w-full text-center text-gray-600 text-sm self-center">No sufficient data for trend.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                            <div className="text-xs text-gray-500 uppercase">Focus Hours</div>
                            <div className="text-2xl font-bold text-white">{loading ? "-" : (todayLog?.focusHours || 0)}h</div>
                        </div>
                        <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                            <div className="text-xs text-gray-500 uppercase">Tasks Done</div>
                            <div className="text-2xl font-bold text-cyan-400">{loading ? "-" : (todayLog?.tasksCompleted || 0)}</div>
                        </div>
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
