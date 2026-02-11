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
                setCalendarData(calendar);
            } catch (err) {
                console.error("Streaks fetch error:", err);
                setError("Failed to load streak data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                        <div className="bg-gradient-to-br from-orange-900/40 to-black border border-orange-500/20 rounded-xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FaFire className="w-24 h-24 text-orange-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-orange-500/20 rounded-lg">
                                        <FaFire className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <h3 className="text-gray-400 font-medium">Current Streak</h3>
                                </div>
                                <div className="text-4xl font-bold text-white mb-1">
                                    {streakData?.currentStreak || 0} <span className="text-lg font-normal text-gray-500">days</span>
                                </div>
                                <p className="text-xs text-orange-400">Keep it burning!</p>
                            </div>
                        </div>

                        {/* Longest Streak */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 relative overflow-hidden">
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
