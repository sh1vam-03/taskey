"use client";
import React, { useEffect, useState } from "react";
import dashboardService from "@/services/dashboard.service";
import scheduleService from "@/services/schedule.service";
import taskService from "@/services/task.service";
import StatCard from "@/components/dashboard/StatCard";
import TaskList from "@/components/dashboard/TaskList";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { FaCheckCircle, FaClock, FaList, FaPlus, FaCalendarDay } from "react-icons/fa";

export default function TodayDashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [isAddingTask, setIsAddingTask] = useState(false);

    const fetchData = async () => {
        try {
            const result = await dashboardService.getToday();
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
                if ((item.id === id || item.scheduleId === id) && item.type === 'SCHEDULED') {
                    return { ...item, status: isCompleted ? 'COMPLETED' : 'PENDING' };
                }
                return item;
            });
            setData({ ...data, timeline: updatedTimeline });

            if (isCompleted) {
                await scheduleService.completeSchedule(id);
            } else {
                await scheduleService.undoCompleteSchedule(id);
            }
            // Refetch to ensure sync
            fetchData();
        } catch (err) {
            console.error("Schedule toggle error:", err);
            // Revert on error would be ideal, but for now just refetch
            fetchData();
        }
    };

    const handleToggleTask = async (id, isCompleted) => {
        try {
            // Optimistic update
            const updatedTimeline = data.timeline.map(item => {
                if ((item.id === id || item.taskId === id) && item.type === 'TASK') {
                    return { ...item, status: isCompleted ? 'COMPLETED' : 'PENDING' };
                }
                return item;
            });
            setData({ ...data, timeline: updatedTimeline });

            if (isCompleted) {
                await taskService.completeTask(id);
            } else {
                await taskService.undoCompleteTask(id);
            }
            // Refetch to ensure sync
            fetchData();
        } catch (err) {
            console.error("Task toggle error:", err);
            // Revert on error
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
                priority: "MEDIUM",
                // Due date today
                dueDate: new Date().toISOString()
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
        id: item.id || item.taskId || item.scheduleId,
        title: item.title,
        priority: item.priority || 'MEDIUM',
        status: item.status, // COMPLETED, MISSED, PENDING
        type: item.type, // TASK or SCHEDULED
        time: item.startTime ? `${item.startTime.slice(0, 5)} - ${item.endTime?.slice(0, 5)}` : 'All Day',
        category: item.type === 'SCHEDULED' ? 'SCHEDULED' : 'TASK'
    }));

    const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Today's Focus</h1>
                    <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
                        <FaCalendarDay className="text-cyan-500" />
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
                        {isAddingTask ? <span className="animate-pulse">...</span> : <FaPlus />}
                    </Button>
                </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loading ? (
                    <>
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="card" />
                    </>
                ) : (
                    <>
                        <StatCard
                            label="Total Items"
                            value={data?.stats?.total ?? 0}
                            icon={FaList}
                        />
                        <StatCard
                            label="Completed"
                            value={data?.stats?.completed ?? 0}
                            icon={FaCheckCircle}
                            subtext={`${Math.round((data?.stats?.completed || 0) / (data?.stats?.total || 1) * 100)}%`}
                        />
                        <StatCard
                            label="Pending"
                            value={data?.stats?.pending ?? 0}
                            icon={FaClock}
                        />
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
                                <div key={item.id} className="flex items-center gap-4 p-4 bg-zinc-950/50 border border-white/5 rounded-lg hover:border-cyan-500/30 transition-colors">
                                    <div className="text-xs font-mono text-gray-500 w-24 shrink-0 text-right">
                                        {item.time}
                                    </div>
                                    <div className="grow">
                                        <h3 className={`text-sm font-medium ${item.status === 'COMPLETED' ? 'text-gray-500 line-through' : 'text-white'}`}>
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] uppercase font-bold text-cyan-500/70 border border-cyan-900/30 px-1.5 py-0.5 rounded">
                                                {item.type}
                                            </span>
                                            {item.status && (
                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${item.status === 'COMPLETED' ? 'text-green-500/70 border-green-900/30' :
                                                    item.status === 'MISSED' ? 'text-red-500/70 border-red-900/30' :
                                                        'text-yellow-500/70 border-yellow-900/30'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Action Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (item.type === 'SCHEDULED') {
                                                    handleToggleSchedule(item.id, item.status !== 'COMPLETED');
                                                } else {
                                                    handleToggleTask(item.id, item.status !== 'COMPLETED');
                                                }
                                            }}
                                            className={`transition-all ${item.status === 'COMPLETED' ? 'text-green-500 hover:text-red-400' : 'text-gray-500 hover:text-green-400'}`}
                                            title={item.status === 'COMPLETED' ? "Undo Completion" : "Complete"}
                                        >
                                            <FaCheckCircle className={`h-5 w-5 ${item.status === 'COMPLETED' ? 'opacity-100' : 'opacity-20 hover:opacity-100'}`} />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
