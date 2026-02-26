"use client";
import React, { useEffect, useState } from "react";
import dashboardService from "@/services/dashboard.service";
import scheduleService from "@/services/schedule.service";
import taskService from "@/services/task.service";
import Card from "@/components/ui/Card";
import TaskList from "@/components/dashboard/TaskList";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { CheckSquare, Clock, PieChart, Plus, Calendar } from 'lucide-react';
import UniversalTaskCard from '@/components/dashboard/UniversalTaskCard';

export default function TodayDashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [isAddingTask, setIsAddingTask] = useState(false);

    const fetchData = async () => {
        try {
            const localDate = new Date().toLocaleDateString('en-CA');
            const result = await dashboardService.getToday(localDate);
            setData(result);
        } catch (err) {
            console.error("Today fetch error:", err);
            setError("Failed to load daily dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleSchedule = async (id, isCompleted) => {
        try {
            // Optimistic update
            const updatedTimeline = data.timeline.map(item => {
                if (item.id === id || item.scheduleId === id) {
                    return { ...item, status: isCompleted ? 'COMPLETED' : 'PENDING' };
                }
                return item;
            });

            // Update local state immediately
            setData({ ...data, timeline: updatedTimeline });

            const localDate = new Date().toLocaleDateString('en-CA');
            if (isCompleted) {
                await scheduleService.completeSchedule(id, localDate);
            } else {
                await scheduleService.undoCompleteSchedule(id, localDate);
            }

            // Refetch in background (ensure data consistency)
            const result = await dashboardService.getToday(localDate);
            setData(result);
        } catch (err) {
            console.error("Schedule toggle error:", err);
            // Revert/Reload if error
            fetchData();
        }
    };

    const handleToggleTask = async (id, isCompleted) => {
        try {
            // Optimistic update
            const updatedTimeline = data.timeline.map(item => {
                if (item.id === id || item.taskId === id) {
                    return { ...item, status: isCompleted ? 'COMPLETED' : 'PENDING', isCompleted: isCompleted };
                }
                return item;
            });

            // Update local state immediately
            setData({ ...data, timeline: updatedTimeline });

            const localDate = new Date().toLocaleDateString('en-CA');
            if (isCompleted) {
                await taskService.completeTask(id, localDate);
            } else {
                await taskService.undoCompleteTask(id, localDate);
            }

            // Refetch in background (ensure data consistency)
            const result = await dashboardService.getToday(localDate);
            setData(result);
        } catch (err) {
            console.error("Task toggle error:", err);
            // Revert/Reload if error
            fetchData();
        }
    };

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            setIsAddingTask(true);
            await taskService.createTask({
                title: newTaskTitle,
                priority: "MEDIUM"
            });
            setNewTaskTitle("");
            fetchData();
        } catch (err) {
            console.error("Quick add error:", err);
            setError("Failed to create task");
            setTimeout(() => setError(null), 3000);
        } finally {
            setIsAddingTask(false);
        }
    };

    if (error) {
        return (
            <div className="p-8 text-center text-red-400 bg-red-950/20 rounded-xl border border-red-900/50">
                <p>System Error: {error}</p>
            </div>
        );
    }

    // Process Timeline
    // Backend returns: { timeline: [...], stats: {...} }
    const timelineItems = (data?.timeline || []).map(item => ({
        ...item,
        id: item.id || item.taskId || item.scheduleId,
        title: item.title,
        priority: item.priority || 'MEDIUM',
        status: item.status, // COMPLETED, MISSED, PENDING
        type: item.type, // TASK or SCHEDULED
        startTime: item.startTime, // Pass raw
        endTime: item.endTime,     // Pass raw
        time: item.startTime ? `${item.startTime.slice(0, 5)} - ${item.endTime?.slice(0, 5)}` : 'All Day',
        // Use actual category if available, otherwise fallback/null -> Component handles null
        category: item.category
    }));

    const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Today's Focus</h1>
                    <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
                        <Calendar className="text-cyan-500 h-4 w-4" />
                        <span>{todayDate}</span>
                    </div>
                </div>
                {/* Quick Add */}
                <form onSubmit={handleQuickAdd} className="flex items-center gap-2 w-full md:w-auto">
                    <Input
                        placeholder="Quick add task..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full md:w-64 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-lg focus:ring-cyan-500/50"
                        disabled={isAddingTask}
                    />
                    <Button
                        type="submit"
                        disabled={isAddingTask || !newTaskTitle.trim()}
                        variant="primary"
                        size="sm"
                        className="shrink-0"
                    >
                        {isAddingTask ? <span className="animate-pulse">...</span> : <Plus size={16} />}
                    </Button>
                </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    <>
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="card" />
                    </>
                ) : (
                    <>
                        {/* Total Tasks */}
                        <Card
                            title="Total Focus"
                            icon={CheckSquare}
                            className="min-h-[140px]"
                        >
                            <div className="flex-1 flex items-center">
                                <div className="text-3xl font-bold text-white">{data?.stats?.total ?? 0}</div>
                            </div>
                            <p className="text-xs text-gray-500 font-mono mt-1">
                                Scheduled Items
                            </p>
                        </Card>

                        {/* Pending */}
                        <Card
                            title="Pending"
                            icon={Clock}
                            className="min-h-[140px]"
                        >
                            <div className="flex-1 flex items-center">
                                <div className="text-3xl font-bold text-white">{data?.stats?.pending ?? 0}</div>
                            </div>
                            <p className="text-xs text-gray-500 font-mono mt-1">
                                Remaining Tasks
                            </p>
                        </Card>

                        {/* Completion Rate */}
                        <Card
                            title="Completion Rate"
                            icon={PieChart}
                            className="min-h-[140px]"
                        >
                            <div className="flex-1 flex flex-col justify-center gap-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-3xl font-bold text-white">
                                        {Math.round((data?.stats?.completed || 0) / (data?.stats?.total || 1) * 100)}%
                                    </span>
                                    <span className="text-xs text-gray-500 font-mono mb-1">
                                        {data?.stats?.completed ?? 0} / {data?.stats?.total ?? 0} Done
                                    </span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(((data?.stats?.completed || 0) / (data?.stats?.total || 1)) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </Card>
                    </>
                )}
            </div>


            {/* Timeline */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6">
                <h2 className="text-lg font-mono font-bold text-cyan-400 mb-4 uppercase tracking-wider">Timeline</h2>
                {loading ? (
                    <SkeletonLoader type="list" />
                ) : (
                    <div className="space-y-4">
                        {timelineItems.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">No items scheduled for today.</p>
                        ) : (
                            timelineItems.map((item) => (
                                <UniversalTaskCard
                                    key={item.id}
                                    item={item}
                                    type={item.type}
                                    onComplete={() => {
                                        if (item.type === 'SCHEDULED') {
                                            handleToggleSchedule(item.id, item.status !== 'COMPLETED');
                                        } else {
                                            handleToggleTask(item.id, item.status !== 'COMPLETED');
                                        }
                                    }}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
