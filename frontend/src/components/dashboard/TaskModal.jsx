"use client";
import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaTrash, FaTag, FaFlag, FaCalendar } from "react-icons/fa";
import taskService from "@/services/task.service";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function TaskModal({ isOpen, onClose, taskToEdit = null, onTaskSaved }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reset or populate form when modal opens/changes
    useEffect(() => {
        if (isOpen) {
            if (taskToEdit) {
                setTitle(taskToEdit.title);
                setDescription(taskToEdit.description || "");
                setPriority(taskToEdit.priority || "MEDIUM");
                // Format date for input type="date"
                const dateStr = taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : "";
                setDueDate(dateStr);
            } else {
                // Reset for new task
                setTitle("");
                setDescription("");
                setPriority("MEDIUM");
                setDueDate("");
            }
            setError(null);
        }
    }, [isOpen, taskToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const taskData = {
                title,
                description,
                priority,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            };

            if (taskToEdit) {
                await taskService.updateTask(taskToEdit.id, taskData);
            } else {
                await taskService.createTask(taskData);
            }

            onTaskSaved();
            onClose();
        } catch (err) {
            console.error("Task save error:", err);
            // Handle usage limit error specifically if possible
            if (err.response?.status === 403) {
                setError("Free plan limit reached. Upgrade to Pro to add more tasks.");
            } else {
                setError(err.response?.data?.message || "Failed to save task");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white">
                        {taskToEdit ? "Edit Task" : "New Task"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-200 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                        <Input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details..."
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-600 min-h-[100px] resize-none font-mono text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Priority */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                <FaFlag size={10} /> Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer font-mono text-sm"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                <FaCalendar size={10} /> Due Date
                            </label>
                            <Input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 mt-4 border-t border-white/5 flex justify-end gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="ghost"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            variant="primary"
                        >
                            {loading ? "Saving..." : (taskToEdit ? "Save Changes" : "Create Task")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
