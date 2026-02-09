"use client";
import React, { useEffect, useState } from "react";
import dashboardService from "@/services/dashboard.service";
import StatCard from "@/components/dashboard/StatCard";
import TaskList from "@/components/dashboard/TaskList";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import { FaCheckCircle, FaClock, FaList, FaBolt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const overviewData = await dashboardService.getOverview();
                setData(overviewData);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, []);

    // Contextual Greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    if (error) {
        return (
            <div className="p-8 text-center text-red-400 bg-red-950/20 rounded-xl border border-red-900/50">
                <p>System Error: {error}</p>
            </div>
        );
    }

    // Process Timeline for TaskList (Mapping backend response to UI)
    // Backend returns: { stats: {...}, recentTasks: [...], upcomingSchedules: [...] }
    // We need to merge tasks and schedules for the timeline or just show recent tasks?
    // The design shows "Today's Focus", so we should ideally show items due today.
    // The `getOverview` endpoint (from controller) returns:
    // { stats: { taskCount, scheduleCount, behaviorCount }, recentTasks: [], upcomingSchedules: [] }

    // Let's combine recentTasks and upcomingSchedules for the list
    const combinedItems = [
        ...(data?.recentTasks || []).map(t => ({ ...t, type: 'TASK' })),
        ...(data?.upcomingSchedules || []).map(s => ({ ...s, type: 'SCHEDULE', title: s.task?.title || 'Untitled Schedule' }))
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(0, 5); // Just recent 5 items

    const displayItems = combinedItems.map(item => ({
        id: item.id,
        title: item.title,
        priority: item.priority || 'MEDIUM',
        status: item.status || (item.completedAt ? 'COMPLETED' : 'PENDING'), // Schedule doesn't have status field directly? 
        // usageLimit middleware suggests Task has priority/status, Schedule has completion relations.
        // For simple overview lists, we might need to adapt.
        dueDate: item.dueDate || item.scheduleDate,
        category: item.type === 'SCHEDULE' ? 'SCHEDULED' : (item.category?.name || 'General')
    }));

    return (
        <div className="space-y-8">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                        {getGreeting()}, <span className="text-gray-400">{user?.name || 'User'}</span>
                    </h1>
                    <div className="text-gray-500 text-sm">
                        {loading ? <SkeletonLoader className="h-4 w-48" /> : `Welcome to your command center.`}
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-xs font-mono text-cyan-500 bg-cyan-950/20 px-3 py-1 rounded-full border border-cyan-900/50 inline-flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        AI SYSTEM ONLINE
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {loading ? (
                    <>
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="card" />
                    </>
                ) : (
                    <>
                        <StatCard
                            label="Total Tasks"
                            value={data?.stats?.taskCount ?? 0}
                            icon={FaList}
                        />
                        <StatCard
                            label="Schedules"
                            value={data?.stats?.scheduleCount ?? 0}
                            icon={FaClock}
                        />
                        <StatCard
                            label="Behavior Entries"
                            value={data?.stats?.behaviorCount ?? 0}
                            icon={FaCheckCircle}
                        />
                        {/* Placeholder for Streak - endpoint separate or included? 
                             Controller says `getDashboardOverview` only returns counts. 
                             Streaks are in `getStreakOverview`.
                             For now keep it static or fetch separately? 
                             Let's fetch streaks in the same useEffect if we want them here, 
                             or strictly follow the route separation. 
                             I'll stick to what the route provides to be safe.
                         */}
                        <StatCard
                            label="Current Streak"
                            value="-"
                            icon={FaBolt}
                            subtext="Check Streak Tab"
                        />
                    </>
                )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <SkeletonLoader type="list" />
                    ) : (
                        <TaskList
                            title="Recent Activity"
                            tasks={displayItems}
                            link="/dashboard/tasks"
                        />
                    )}
                </div>

                {/* Right Column: AI / Insights */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FaBolt className="w-24 h-24 text-cyan-400" />
                        </div>
                        <h3 className="font-mono text-sm font-bold text-cyan-400 mb-4 uppercase tracking-wider">AI Insight</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Your dashboard is ready. Start by adding tasks or schedules to generate AI insights.
                        </p>
                        {/* <button className="text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-colors w-full text-center">
                            VIEW ANALYSIS
                        </button> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
