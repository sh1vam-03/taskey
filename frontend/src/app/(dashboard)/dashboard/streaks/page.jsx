"use client";
import React, { useEffect, useState } from "react";
import dashboardService from "@/services/dashboard.service";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import { FaFire, FaTrophy, FaCalendarCheck } from "react-icons/fa";

export default function StreaksPage() {
    const [streakData, setStreakData] = useState(null);
    const [calendarData, setCalendarData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [streaks, calendar] = await Promise.all([
                    dashboardService.getStreaks(),
                    dashboardService.getStreakCalendar()
                ]);
                setStreakData(streaks);

                // Transform { "YYYY-MM-DD": "PERFECT"|"MISSED"|"EMPTY" } to Array<{ date, count }>
                const calendarArray = Object.entries(calendar || {}).map(([date, status]) => {
                    let count = 0;
                    if (status === "PERFECT") count = 4;
                    else if (status === "MISSED") count = 2; // Show failed attempt as low intensity
                    // EMPTY remains 0

                    return { date, count };
                }).sort((a, b) => new Date(a.date) - new Date(b.date));

                setCalendarData(calendarArray);
            } catch (err) {
                console.error("Streaks fetch error:", err);
                setError("Failed to load streak data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Milestones Logic
    const getNextMilestone = (current) => {
        const milestones = [7, 14, 30, 60, 90, 100, 365];
        const next = milestones.find(m => m > current) || 365;
        const progress = Math.min((current / next) * 100, 100);
        return { next, progress, remaining: next - current };
    };

    // Insights Logic
    const getInsights = () => {
        if (!calendarData || calendarData.length === 0) return [];

        let perfectCount = 0;
        const dayCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }; // Sun-Sat

        calendarData.forEach(d => {
            if (d.count >= 4) {
                perfectCount++;
                const dayOfWeek = new Date(d.date).getDay();
                dayCounts[dayOfWeek]++;
            }
        });

        const insights = [];

        // Consistency
        const consistency = Math.round((perfectCount / calendarData.length) * 100) || 0;
        if (consistency > 80) insights.push("You are unstoppable! Extremely consistent.");
        else if (consistency > 50) insights.push("Building good habits. Keep it up!");
        else insights.push("Try to perform tasks at least 3 days a week.");

        // Best Day
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let bestDayIndex = 0;
        let maxCount = -1;
        Object.entries(dayCounts).forEach(([day, count]) => {
            if (count > maxCount) {
                maxCount = count;
                bestDayIndex = Number(day);
            }
        });

        if (maxCount > 0) {
            insights.push(`You are most productive on ${days[bestDayIndex]}s.`);
        }

        return insights;
    };

    if (error) {
        return (
            <div className="p-8 text-center text-red-400 bg-red-950/20 rounded-xl border border-red-900/50">
                <p>System Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-white mb-6">Streak & Habits</h1>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    <>
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="card" />
                    </>
                ) : (
                    <>
                        {/* Current Streak */}
                        <div className="bg-gradient-to-br from-orange-900/40 to-black border border-orange-500/20 rounded-xl p-6 relative overflow-hidden group shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity animate-pulse">
                                <FaFire className="w-24 h-24 text-orange-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-orange-500/20 rounded-lg shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                                        <FaFire className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <h3 className="text-gray-400 font-medium">Current Streak</h3>
                                </div>
                                <div className="text-4xl font-bold text-white mb-1 drop-shadow-lg">
                                    {streakData?.currentStreak || 0} <span className="text-lg font-normal text-gray-500">days</span>
                                </div>
                                <p className="text-xs text-orange-400 font-bold tracking-wide uppercase">Keep it burning!</p>
                            </div>
                        </div>

                        {/* Longest Streak */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <FaTrophy className="w-20 h-20 text-yellow-500" />
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-yellow-500/20 rounded-lg">
                                    <FaTrophy className="w-5 h-5 text-yellow-500" />
                                </div>
                                <h3 className="text-gray-400 font-medium">Best Streak</h3>
                            </div>
                            <div className="text-4xl font-bold text-white mb-1">
                                {streakData?.longestStreak || 0} <span className="text-lg font-normal text-gray-500">days</span>
                            </div>
                            <p className="text-xs text-gray-500">Your personal record</p>
                        </div>

                        {/* Total Active Days */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <FaCalendarCheck className="w-20 h-20 text-cyan-500" />
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-cyan-500/20 rounded-lg">
                                    <FaCalendarCheck className="w-5 h-5 text-cyan-500" />
                                </div>
                                <h3 className="text-gray-400 font-medium">Total Active Days</h3>
                            </div>
                            <div className="text-4xl font-bold text-white mb-1">
                                {streakData?.totalActiveDays || 0}
                            </div>
                            <p className="text-xs text-gray-500">Consistency is key</p>
                        </div>
                    </>
                )}
            </div>

            {/* Milestones & Insights */}
            {!loading && streakData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Next Milestone */}
                    <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6">
                        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4">Next Goal</h3>
                        {(() => {
                            const { next, progress, remaining } = getNextMilestone(streakData.currentStreak || 0);
                            return (
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="text-2xl font-bold text-white">{next} Days</div>
                                        <div className="text-sm text-cyan-400 font-mono">{remaining} days left</div>
                                    </div>
                                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-linear-to-r from-cyan-600 to-purple-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="mt-3 text-xs text-gray-500">
                                        Reach a {next}-day streak to unlock the next level of consistency.
                                    </p>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Quick Insights */}
                    <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6">
                        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4">Streak Habits</h3>
                        <div className="space-y-3">
                            {getInsights().map((text, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
                                    <p className="text-sm text-gray-300">{text}</p>
                                </div>
                            ))}
                            {getInsights().length === 0 && (
                                <p className="text-sm text-gray-500 italic">No activity data to analyze yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar Heatmap (Simplified Visualization) */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6">
                <h2 className="text-lg font-mono font-bold text-gray-300 mb-6 uppercase tracking-wider">Activity Log</h2>

                {loading ? (
                    <SkeletonLoader type="list" />
                ) : (
                    <div className="w-full overflow-x-auto pb-4">
                        <div className="min-w-[700px]">
                            {/* 
                                Since we don't have a heatmap library installed, we'll build a simple GitHub-style contribution graph approximation.
                                Assuming calendarData is an array of dates or objects with date & intensity.
                            */}
                            {(!calendarData || calendarData.length === 0) ? (
                                <p className="text-center text-gray-500 py-8">No activity data available yet.</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-wrap gap-1 max-w-4xl">
                                        {/* 
                                           Assuming calendarData is array of { date: 'YYYY-MM-DD', count: 5 } 
                                           We render a simple grid of squares.
                                        */}
                                        {calendarData.map((day, idx) => {
                                            const intensity = Math.min(day.count || 0, 4); // 0-4 scale
                                            const colors = [
                                                'bg-white/5',           // 0
                                                'bg-cyan-900/40',       // 1
                                                'bg-cyan-700/60',       // 2
                                                'bg-cyan-500/80',       // 3
                                                'bg-cyan-400'           // 4
                                            ];

                                            // Tooltip logic would be nice, but simple title attribute works for now
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`w-4 h-4 rounded-sm ${colors[intensity]} hover:ring-1 ring-white/50 transition-all`}
                                                    title={`${day.date}: ${day.count} tasks`}
                                                />
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500 font-mono">
                                        <span>LESS</span>
                                        <div className="flex gap-1">
                                            <div className="w-3 h-3 rounded-sm bg-white/5" />
                                            <div className="w-3 h-3 rounded-sm bg-cyan-900/40" />
                                            <div className="w-3 h-3 rounded-sm bg-cyan-700/60" />
                                            <div className="w-3 h-3 rounded-sm bg-cyan-500/80" />
                                            <div className="w-3 h-3 rounded-sm bg-cyan-400" />
                                        </div>
                                        <span>MORE</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
