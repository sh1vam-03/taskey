"use client";
import React, { useEffect, useState } from "react";
import dashboardService from "@/services/dashboard.service";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import { FaChartBar, FaChartLine, FaChartPie } from "react-icons/fa";
import PerformanceChart from "@/components/dashboard/charts/PerformanceChart";

export default function PerformancePage() {
    const [view, setView] = useState("weekly"); // daily, weekly, monthly
    const [data, setData] = useState(null);
    const [cache, setCache] = useState({ daily: null, weekly: null, monthly: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            // Check cache first
            if (cache[view]) {
                setData(cache[view]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                let result;
                const localDate = new Date().toLocaleDateString('en-CA');
                if (view === "daily") {
                    result = await dashboardService.getDailyPerformance(localDate);
                } else if (view === "weekly") {
                    result = await dashboardService.getWeeklyPerformance(localDate);
                } else if (view === "monthly") {
                    const d = new Date();
                    result = await dashboardService.getMonthlyPerformance(d.getFullYear(), d.getMonth() + 1, localDate);
                }

                setData(result);
                setCache(prev => ({ ...prev, [view]: result }));
            } catch (err) {
                console.error("Performance fetch error:", err);
                setError(`Failed to load ${view} performance data`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [view]);

    // Simple Insights Engine
    const getInsights = () => {
        if (!data) return [];
        const insights = [];

        // Completion Rate Insight
        if (data.completionRate >= 80) {
            insights.push({ type: 'positive', text: "Excellent Consistency! You're hitting your targets reliably." });
        } else if (data.completionRate >= 50) {
            insights.push({ type: 'neutral', text: "Good momentum. Try to improve your task completion rate slightly." });
        } else {
            insights.push({ type: 'attention', text: "Focus needed. Your completion rate is below optimal levels." });
        }

        // Productivity Insight
        if (data.productivityScore >= 80) {
            insights.push({ type: 'positive', text: "High Productivity Zone. Your focus metrics are outstanding." });
        }

        // Volume Insight
        if (data.totalCompleted > 10) {
            insights.push({ type: 'neutral', text: `High Volume: You've crushed ${data.totalCompleted} tasks this period.` });
        }

        return insights;
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-white">Performance Analytics</h1>

                {/* View Toggles */}
                <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-white/10 w-fit">
                    <button
                        onClick={() => setView("daily")}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${view === "daily" ? "bg-cyan-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                            }`}
                    >
                        DAILY
                    </button>
                    <button
                        onClick={() => setView("weekly")}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${view === "weekly" ? "bg-cyan-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                            }`}
                    >
                        WEEKLY
                    </button>
                    <button
                        onClick={() => setView("monthly")}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${view === "monthly" ? "bg-cyan-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                            }`}
                    >
                        MONTHLY
                    </button>
                </div>
            </div>

            {error ? (
                <div className="p-8 text-center text-red-400 bg-red-950/20 rounded-xl border border-red-900/50">
                    <p>System Error: {error}</p>
                </div>
            ) : (
                <>
                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {loading ? (
                            <>
                                <SkeletonLoader type="card" />
                                <SkeletonLoader type="card" />
                                <SkeletonLoader type="card" />
                            </>
                        ) : (
                            <>
                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <FaChartPie className="w-16 h-16" />
                                    </div>
                                    <h3 className="text-gray-500 text-xs uppercase mb-1 font-mono tracking-wider">Completion Rate</h3>
                                    <div className="text-3xl font-bold text-white relative z-10">
                                        {data?.completionRate || 0}%
                                    </div>
                                    <div className="mt-2 text-xs text-cyan-400 font-mono">
                                        {data?.completionRate >= 80 ? '▲ OPTIMAL' : '▼ NEEDS FOCUS'}
                                    </div>
                                </div>

                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <FaChartBar className="w-16 h-16" />
                                    </div>
                                    <h3 className="text-gray-500 text-xs uppercase mb-1 font-mono tracking-wider">Tasks Completed</h3>
                                    <div className="text-3xl font-bold text-cyan-400 relative z-10">
                                        {data?.totalCompleted || 0}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500 font-mono">Total Volume</div>
                                </div>

                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-colors">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <FaChartLine className="w-16 h-16" />
                                    </div>
                                    <h3 className="text-gray-500 text-xs uppercase mb-1 font-mono tracking-wider">Productivity Score</h3>
                                    <div className="text-3xl font-bold text-purple-400 relative z-10">
                                        {data?.productivityScore || 0}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500 font-mono">AI Estimated</div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Chart Area */}
                    <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-8 min-h-[400px] flex items-center justify-center relative">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                            </div>
                        ) : (
                            <div className="w-full h-full min-h-[400px]">
                                {view === 'daily' && (
                                    <PerformanceChart
                                        data={data?.hourly || []}
                                        xAxisKey="time"
                                        dataKeys={[
                                            { key: 'total', name: 'Assigned', color: '#8b5cf6' },
                                            { key: 'completed', name: 'Completed', color: '#06b6d4' },
                                            { key: 'missed', name: 'Missed', color: '#f43f5e' }
                                        ]}
                                        height={400}
                                    />
                                )}
                                {view === 'weekly' && (
                                    <PerformanceChart
                                        data={data?.daily || []}
                                        xAxisKey="day"
                                        dataKeys={[
                                            { key: 'total', name: 'Assigned', color: '#8b5cf6' },
                                            { key: 'completed', name: 'Completed', color: '#06b6d4' },
                                            { key: 'missed', name: 'Missed', color: '#f43f5e' }
                                        ]}
                                        height={400}
                                    />
                                )}
                                {view === 'monthly' && (
                                    <PerformanceChart
                                        data={data?.history || []}
                                        xAxisKey="date"
                                        dataKeys={[
                                            { key: 'total', name: 'Assigned', color: '#8b5cf6' },
                                            { key: 'completed', name: 'Completed', color: '#06b6d4' },
                                            { key: 'missed', name: 'Missed', color: '#f43f5e' }
                                        ]}
                                        height={400}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Insights Section */}
            {!loading && data && (
                <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-4">
                        <span className="w-2 h-6 bg-cyan-500 rounded-full" />
                        AI Performance Insights
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getInsights().map((insight, idx) => (
                            <div key={idx} className={`p-4 rounded-lg border flex items-start gap-4 ${insight.type === 'positive' ? 'bg-green-500/10 border-green-500/20 text-green-200' :
                                insight.type === 'attention' ? 'bg-red-500/10 border-red-500/20 text-red-200' :
                                    'bg-blue-500/10 border-blue-500/20 text-blue-200'
                                }`}>
                                <div className="mt-1">
                                    {insight.type === 'positive' && <FaChartLine className="text-green-400" />}
                                    {insight.type === 'attention' && <FaChartBar className="text-red-400" />}
                                    {insight.type === 'neutral' && <FaChartPie className="text-blue-400" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{insight.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
