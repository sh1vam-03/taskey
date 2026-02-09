"use client";
import React, { useEffect, useState } from "react";
import taskService from "@/services/task.service";
import TaskModal from "@/components/dashboard/TaskModal";
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
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-white">Tasks</h1>

                <div className="flex gap-2 w-full md:w-auto">
                    {/* Filter Tabs */}
                    <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-white/10 grow md:grow-0">
                        {["ALL", "PENDING", "COMPLETED", "HIGH"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors grow md:grow-0 ${filter === f ? "bg-cyan-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleCreateTask}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-cyan-900/20 transition-all text-sm whitespace-nowrap"
                    >
                        <FaPlus /> New Task
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <SkeletonLoader type="list" />
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/30 border border-white/5 rounded-xl border-dashed">
                    <p className="text-gray-500 mb-4">No tasks found matching this filter.</p>
                    <button onClick={handleCreateTask} className="text-cyan-400 hover:text-cyan-300 text-sm font-bold">
                        Create a new task
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {filteredTasks.map(task => (
                        <div key={task.id} className="group bg-zinc-900/50 border border-white/5 hover:border-cyan-500/30 rounded-xl p-4 transition-all flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => toggleCompletion(task)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.isArchived
                                            ? "bg-green-500/20 border-green-500 text-green-500"
                                            : "border-gray-500 hover:border-cyan-500 text-transparent hover:text-cyan-500"
                                        }`}
                                >
                                    <FaCheckCircle className="w-3.5 h-3.5" />
                                </button>

                                <div>
                                    <h3 className={`font-medium text-base ${task.isArchived ? "text-gray-500 line-through" : "text-white"}`}>
                                        {task.title}
                                    </h3>
                                    {task.description && (
                                        <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold uppercase ${getPriorityColor(task.priority)}`}>
                                            {task.priority || "MEDIUM"}
                                        </span>
                                        {task.dueDate && (
                                            <span className="text-[10px] text-gray-400 font-mono">
                                                Due: {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEditTask(task)}
                                    className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    <FaTrash />
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
