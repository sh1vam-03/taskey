"use client";
import React, { useEffect, useState } from "react";
import dashboardService from "@/services/dashboard.service";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import { FaChartBar, FaChartLine, FaChartPie } from "react-icons/fa";
import PerformanceChart from "@/components/dashboard/charts/PerformanceChart";

export default function PerformancePage() {
    const [view, setView] = useState("daily"); // daily, weekly, monthly
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                let result;
                if (view === "daily") {
                    result = await dashboardService.getDailyPerformance();
                } else if (view === "weekly") {
                    result = await dashboardService.getWeeklyPerformance();
                } else if (view === "monthly") {
                    result = await dashboardService.getMonthlyPerformance();
                }
                setData(result);
            } catch (err) {
                console.error("Performance fetch error:", err);
                setError(`Failed to load ${view} performance data`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [view]);

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
                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                    <h3 className="text-gray-500 text-xs uppercase mb-1">Completion Rate</h3>
                                    <div className="text-3xl font-bold text-white">
                                        {data?.completionRate || 0}%
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">Average for this period</div>
                                </div>

                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                    <h3 className="text-gray-500 text-xs uppercase mb-1">Tasks Completed</h3>
                                    <div className="text-3xl font-bold text-cyan-400">
                                        {data?.totalCompleted || 0}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">Total volume</div>
                                </div>

                                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                                    <h3 className="text-gray-500 text-xs uppercase mb-1">Productivity Score</h3>
                                    <div className="text-3xl font-bold text-purple-400">
                                        {data?.productivityScore || 0}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">AI Estimated</div>
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
                                        type="bar"
                                        xAxisKey="time"
                                        height={400}
                                    />
                                )}
                                {view === 'weekly' && (
                                    <PerformanceChart
                                        data={data?.daily || []}
                                        type="bar"
                                        xAxisKey="day"
                                        height={400}
                                    />
                                )}
                                {view === 'monthly' && (
                                    <PerformanceChart
                                        data={data?.history || []}
                                        type="area"
                                        dataKey="completionRate"
                                        xAxisKey="date"
                                        height={400}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
