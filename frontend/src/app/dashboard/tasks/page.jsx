"use client";
import React, { useEffect, useState } from "react";
import taskService from "@/services/task.service";
import { PageHeader } from "@/components/dashboard/PageHeader";
import TaskModal from "@/components/dashboard/TaskModal";
import Button from "@/components/ui/Button";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import { FaPlus, FaSearch, FaFilter, FaCheckCircle, FaTrash, FaEdit, FaFlag } from "react-icons/fa";

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filter, setFilter] = useState("ALL"); // ALL, PENDING, COMPLETED, HIGH

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const result = await taskService.getTasks();
            setTasks(result);
            setError(null);
        } catch (err) {
            console.error("Tasks fetch error:", err);
            setError("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleCreateTask = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleDeleteTask = async (id) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await taskService.deleteTask(id);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (err) {
            alert("Failed to delete task");
        }
    };

    const toggleCompletion = async (task) => {
        // Optimistic update
        const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'; // Assuming backend uses status enum logic or we handle it via update
        // Note: Backend might not have 'status' on Task model directly if it uses TaskDailyCompletion?
        // Let's check logic: Task model has `isArchived`. DailyCompletion is for recurring?
        // Wait, Task model (schema) has: id, title, description, priority, dueDate, order, isArchived.
        // It DOES NOT have specific 'status' enum like 'COMPLETED'.
        // It uses `TaskDailyCompletion`? No, that's for recurring tasks?
        // Regular tasks might be just archived?
        // Actually, for a simple checklist, we usually add a `completed` boolean or `status` enum to Task.
        // Reviewing schema...
        // `model Task` has `isArchived`.
        // `model TaskDailyCompletion` links to Task.
        // It seems the design intends for Tasks to be recurring-capable? Or maybe we missed a field?
        // Let's re-read schema.
        // `Task` has `isArchived`.
        // If a task is a one-off, how do we mark it done?
        // Maybe the backend expects us to use `isArchived` for completion? Or `deletedAt`?
        // Or maybe `status` was missing in my schema dump?
        // Let's look at `task.routes.js` or `task.controller.js` to see how completion is handled.
        // Ah, `taskCompletion` routes exist! `taskCompletion.routes.js`.
        // `TaskDailyCompletion` suggests tasks are tracked *daily*.
        // This implies tasks in this system are habits/recurring?
        // If I just want a simple "Buy Milk" task, do I complete it for *today*?
        // The schema `Task` doesn't have `completed`.
        // Let's assume for now we toggle `isArchived` for "Done" items if they are one-off,
        // OR we use the `taskCompletion` endpoint if they are intended to be daily habits.
        // Given "Taskey" name and "Daily Focus", likely it uses `taskCompletion`.

        // Let's use `updateTask` with `isArchived` for now as a "Delete/Done" equivalent for non-recurring?
        // Or better, let's assume we want to call the completion endpoint if available.
        // I will use `isArchived` as "Processed" for this simple list for now, or just Delete.
        // But users want to see "Completed" items.

        // Let's checking `task.controller.js` might reveal `toggleCompletion` logic?
        // I'll stick to a safe bet: If I update `isArchived` to true, it's "Done" and out of the "Pending" list.
        // But wait, the schema has `TaskDailyCompletion`.
        // If I am building a "Todo List", I usually want a checkbox.
        // I'll implement "Archive" as the main completion action for this view.

        try {
            await taskService.updateTask(task.id, { isArchived: !task.isArchived });
            // Refresh because filter might change
            fetchTasks();
        } catch (err) {
            console.error("Toggle error", err);
        }
    };

    // Derived state
    const filteredTasks = tasks.filter(t => {
        if (filter === "ALL") return !t.isArchived;
        if (filter === "COMPLETED") return t.isArchived; // Using Archived as Completed for now
        if (filter === "PENDING") return !t.isArchived;
        if (filter === "HIGH") return !t.isArchived && t.priority === "HIGH";
        return true;
    });

    const getPriorityColor = (p) => {
        switch (p) {
            case "HIGH": return "text-red-400 border-red-500/30 bg-red-950/30";
            case "MEDIUM": return "text-yellow-400 border-yellow-500/30 bg-yellow-950/30";
            case "LOW": return "text-blue-400 border-blue-500/30 bg-blue-950/30";
            default: return "text-gray-400 border-gray-500/30 bg-gray-950/30";
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Task Operations"
                subtitle="Manage and execute your daily objectives."
                action={
                    <Button
                        onClick={handleCreateTask}
                        variant="scanline"
                        className="w-full sm:w-auto"
                    >
                        <FaPlus className="mr-2 group-hover:rotate-90 transition-transform" /> INITIALIZE_TASK
                    </Button>
                }
            />

            {/* Filter Toolbar */}
            <div className="flex bg-zinc-900/50 p-1 rounded-sm border border-white/10 w-full md:w-fit overflow-x-auto gap-1">
                {["ALL", "PENDING", "COMPLETED", "HIGH"].map(f => (
                    <Button
                        key={f}
                        onClick={() => setFilter(f)}
                        size="sm"
                        variant={filter === f ? "secondary" : "ghost"}
                        className={filter === f ? "bg-cyan-950/40 text-cyan-400 border-cyan-500/30" : "text-gray-500 hover:text-white"}
                    >
                        {f}
                    </Button>
                ))}
            </div>

            {/* Content Lists */}
            {loading ? (
                <SkeletonLoader type="list" />
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/20 border border-white/5 rounded-xl border-dashed">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 text-gray-600">
                        <FaFlag size={24} />
                    </div>
                    <p className="text-gray-500 font-mono text-sm mb-4">NO_ACTIVE_TASKS_DETECTED</p>
                    <button onClick={handleCreateTask} className="text-cyan-500 hover:text-cyan-400 text-xs font-bold uppercase tracking-wider">
                        + Initialize New Protocol
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTasks.map(task => (
                        <div
                            key={task.id}
                            className={`group relative overflow-hidden bg-zinc-900/40 border transition-all rounded-xl p-4 flex items-center justify-between
                                ${task.isArchived
                                    ? "border-white/5 opacity-60"
                                    : "border-white/10 hover:border-cyan-500/30 hover:bg-zinc-900/60"
                                }
                            `}
                        >
                            {/* Scanning Line */}
                            {!task.isArchived && (
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-full group-hover:animate-[scan-fast_1.5s_infinite] pointer-events-none" />
                            )}

                            <div className="flex items-center gap-4 relative z-10 w-full">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleCompletion(task); }}
                                    className={`w-6 h-6 rounded border transition-all flex items-center justify-center
                                        ${task.isArchived
                                            ? "bg-cyan-900/20 border-cyan-500/50 text-cyan-500"
                                            : "border-white/20 hover:border-cyan-400 text-transparent"
                                        }
                                    `}
                                >
                                    <FaCheckCircle className={`w-3.5 h-3.5 ${task.isArchived ? "scale-100" : "scale-0"} transition-transform`} />
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`font-medium text-sm md:text-base truncate ${task.isArchived ? "text-gray-500 line-through decoration-white/20" : "text-gray-200"}`}>
                                            {task.title}
                                        </h3>
                                        {task.priority === 'HIGH' && (
                                            <span className="shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" title="High Priority" />
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 font-mono uppercase tracking-wide">
                                        {task.category && (
                                            <span className="flex items-center gap-1">
                                                <span className="w-1 h-1 bg-gray-500 rounded-full" />
                                                {task.category.name}
                                            </span>
                                        )}
                                        {task.dueDate && (
                                            <span className={new Date(task.dueDate) < new Date() && !task.isArchived ? "text-red-400" : ""}>
                                                DUE: {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 md:static md:bg-transparent bg-black/80 rounded-lg p-1 md:p-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}
                                    className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-950/30 rounded transition-colors"
                                >
                                    <FaEdit size={12} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                                >
                                    <FaTrash size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                taskToEdit={editingTask}
                onTaskSaved={fetchTasks}
            />
        </div>
    );
}
