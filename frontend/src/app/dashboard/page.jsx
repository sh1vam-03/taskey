"use client";
import React, { useEffect, useState } from "react";
import dashboardService from "@/services/dashboard.service";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
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
        <div className="space-y-6">
            <PageHeader
                title={getGreeting()}
                subtitle={`System Ready. ${user?.name || 'User'} detected.`}
                action={
                    <div className="text-xs font-mono text-cyan-500 bg-cyan-950/20 px-3 py-1 rounded-full border border-cyan-900/50 inline-flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                        AI_CORE_ONLINE
                    </div>
                }
            />

            {/* Bento Grid Stats */}
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
                        <DashboardCard
                            title="Total Tasks"
                            value={data?.stats?.taskCount ?? 0}
                            icon={FaList}
                            delay={1}
                        />
                        <DashboardCard
                            title="Scheduled"
                            value={data?.stats?.scheduleCount ?? 0}
                            icon={FaClock}
                            delay={2}
                        />
                        <DashboardCard
                            title="Focus Entries"
                            value={data?.stats?.behaviorCount ?? 0}
                            icon={FaCheckCircle}
                            delay={3}
                        />
                        <DashboardCard
                            title="Streak"
                            value={data?.streak ?? "0"}
                            subtext="Days Active"
                            icon={FaBolt}
                            delay={4}
                            className="border-cyan-500/30 bg-cyan-950/10"
                        />
                    </>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 min-h-[400px]">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaList className="text-gray-500" /> Recent Activity
                        </h3>
                        {loading ? (
                            <SkeletonLoader type="list" />
                        ) : (
                            <TaskList
                                tasks={displayItems}
                                link="/dashboard/tasks"
                                compact={true}
                            />
                        )}
                    </div>
                </div>

                {/* AI / Quick Actions Column */}
                <div className="space-y-6">
                    {/* AI Insight Card */}
                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-linear-to-br from-zinc-900 to-black p-6 group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FaBolt className="w-32 h-32 text-cyan-500 -rotate-12 translate-x-4 -translate-y-4" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="font-mono text-xs font-bold text-cyan-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                AI_Insight_Module
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                System awaiting more data to generate personalized optimization patterns. Complete tasks to train the neural engine.
                            </p>
                            <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-gray-300 transition-colors uppercase tracking-wider">
                                // INITIALIZE_SCAN
                            </button>
                        </div>
                    </div>

                    {/* Quick Action - e.g. Add Task */}
                    {/* This could be a separate component later */}
                </div>
            </div>
        </div>
    );
}
