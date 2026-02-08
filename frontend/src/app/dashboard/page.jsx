"use client";
import React from "react";
import { useTodayDashboard } from "@/features/dashboard/useTodayDashboard";
import StatCard from "@/components/dashboard/StatCard";
import TaskList from "@/components/dashboard/TaskList";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import { FaCheckCircle, FaClock, FaList, FaBolt } from "react-icons/fa";

export default function DashboardPage() {
    const { data, loading, error } = useTodayDashboard();

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

    // Process Timeline for TaskList
    const tasks = data?.timeline?.map(item => ({
        id: item.taskId || item.scheduleId,
        title: item.title,
        priority: item.priority,
        status: item.status,
        dueDate: item.startTime ? new Date().setHours(...item.startTime.split(':')) : null,
        category: item.type === 'SCHEDULED' ? 'SCHEDULED' : null
    })) || [];

    const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'MISSED');

    return (
        <div className="space-y-8">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                        {getGreeting()}, <span className="text-gray-400">User</span>
                    </h1>
                    <div className="text-gray-500 text-sm">
                        {loading ? <SkeletonLoader className="h-4 w-48" /> : `You have ${pendingTasks.length} pending items for today.`}
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-xs font-mono text-cyan-500 bg-cyan-950/20 px-3 py-1 rounded-full border border-cyan-900/50 inline-flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        AI AGENT ACTIVE
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
                            value={data?.stats?.total ?? 0}
                            icon={FaList}
                        />
                        <StatCard
                            label="Completed"
                            value={data?.stats?.completed ?? 0}
                            icon={FaCheckCircle}
                            subtext={`${Math.round((data?.stats?.completed || 0) / (data?.stats?.total || 1) * 100)}% completion rate`}
                        />
                        <StatCard
                            label="Pending"
                            value={data?.stats?.pending ?? 0}
                            icon={FaClock}
                        />
                        <StatCard
                            label="Current Streak"
                            value="-"
                            icon={FaBolt}
                            subtext="Keep the momentum"
                        />
                    </>
                )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Focus */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <SkeletonLoader type="list" />
                    ) : (
                        <TaskList
                            title="Today's Focus"
                            tasks={tasks}
                            link="/dashboard/schedule" // Redirect to schedule detailed view
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
                            Based on your morning velocity, you are on track to complete your schedule by 18:00. Note: You tend to slow down around 15:00.
                        </p>
                        <button className="text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-colors w-full text-center">
                            VIEW ANALYSIS
                        </button>
                    </div>

                    {/* Quick Streak Mini-View */}
                    <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20 rounded-xl p-6">
                        <h3 className="font-mono text-sm font-bold text-purple-400 mb-2 uppercase tracking-wider">Focus Mode</h3>
                        <p className="text-xs text-gray-500 mb-4">Minimize distractions to maintain flow.</p>
                        <button className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                            ACTIVATE DEEP WORK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
