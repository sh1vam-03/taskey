"use client";
import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaClock, FaCalendarAlt, FaRedo, FaList } from "react-icons/fa";
import scheduleService from "@/services/schedule.service";
import taskService from "@/services/task.service";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ScheduleModal({ isOpen, onClose, scheduleToEdit = null, onScheduleSaved }) {
    const [tasks, setTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState("");
    const [scheduleDate, setScheduleDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [notes, setNotes] = useState("");
    const [recurrence, setRecurrence] = useState("NONE");

    // New Task Creation within Schedule Modal (Optional but good UX)
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [isCreatingNewTask, setIsCreatingNewTask] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch tasks for dropdown
    useEffect(() => {
        if (isOpen) {
            taskService.getTasks().then(setTasks).catch(console.error);
        }
    }, [isOpen]);

    // Reset or populate form
    useEffect(() => {
        if (isOpen) {
            if (scheduleToEdit) {
                setSelectedTaskId(scheduleToEdit.taskId || "");
                setScheduleDate(scheduleToEdit.scheduleDate ? new Date(scheduleToEdit.scheduleDate).toISOString().split('T')[0] : "");
                setStartTime(scheduleToEdit.startTime || "");
                setEndTime(scheduleToEdit.endTime || "");
                setNotes(scheduleToEdit.notes || "");
                setRecurrence(scheduleToEdit.recurrence || "NONE");
                setIsCreatingNewTask(false);
            } else {
                // Default values
                setSelectedTaskId("");
                const d = new Date();
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                setScheduleDate(`${year}-${month}-${day}`);
                const now = new Date();
                const nextHour = new Date(now.setHours(now.getHours() + 1, 0, 0, 0));
                setStartTime(nextHour.toTimeString().slice(0, 5));
                setEndTime(new Date(nextHour.setHours(nextHour.getHours() + 1)).toTimeString().slice(0, 5));
                setNotes("");
                setRecurrence("NONE");
                setIsCreatingNewTask(false);
                setNewTaskTitle("");
            }
            setError(null);
        }
    }, [isOpen, scheduleToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let taskIdToUse = selectedTaskId;

            // If creating a new task on the fly
            if (isCreatingNewTask && newTaskTitle) {
                const newTask = await taskService.createTask({
                    title: newTaskTitle,
                    priority: "MEDIUM"
                });
                taskIdToUse = newTask.id;
            }

            if (!taskIdToUse) {
                throw new Error("Please select a task or create a new one.");
            }

            const scheduleData = {
                taskId: taskIdToUse,
                scheduleDate: new Date(scheduleDate).toISOString(),
                startTime,
                endTime,
                notes,
                recurrence
            };

            if (scheduleToEdit) {
                await scheduleService.updateSchedule(scheduleToEdit.id, scheduleData);
            } else {
                await scheduleService.createSchedule(scheduleData);
            }

            onScheduleSaved();
            onClose();
        } catch (err) {
            console.error("Schedule save error:", err);
            if (err.response?.status === 403) {
                setError("Free plan limit reached. Upgrade to Pro.");
            } else {
                setError(err.message || err.response?.data?.message || "Failed to save schedule");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-zinc-900 z-10">
                    <h2 className="text-xl font-bold text-white">
                        {scheduleToEdit ? "Edit Schedule" : "New Schedule"}
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

                    {/* Task Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <FaList size={10} /> Associated Task
                        </label>
                        {!isCreatingNewTask ? (
                            <div className="flex gap-2">
                                <select
                                    value={selectedTaskId}
                                    onChange={(e) => setSelectedTaskId(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer font-mono text-sm"
                                    required={!isCreatingNewTask}
                                >
                                    <option value="">Select a Task...</option>
                                    {tasks.map(t => (
                                        <option key={t.id} value={t.id}>{t.title}</option>
                                    ))}
                                </select>
                                <Button
                                    type="button"
                                    onClick={() => setIsCreatingNewTask(true)}
                                    variant="scanline"
                                    size="sm"
                                    className="px-3"
                                >
                                    + NEW
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Enter new task title..."
                                    required={isCreatingNewTask}
                                    autoFocus
                                />
                                <Button
                                    type="button"
                                    onClick={() => setIsCreatingNewTask(false)}
                                    variant="ghost"
                                    size="sm"
                                    className="px-3"
                                >
                                    CANCEL
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <FaCalendarAlt size={10} /> Schedule Date
                        </label>
                        <Input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            min={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })()}
                            required
                        />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                <FaClock size={10} /> Start Time
                            </label>
                            <Input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                <FaClock size={10} /> End Time
                            </label>
                            <Input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Recurrence */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <FaRedo size={10} /> Recurrence
                        </label>
                        <select
                            value={recurrence}
                            onChange={(e) => setRecurrence(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer font-mono text-sm"
                        >
                            <option value="NONE">Does not repeat</option>
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Specific details for this schedule..."
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-600 min-h-[80px] resize-none font-mono text-sm"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 mt-4 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-zinc-900 pb-2">
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
                            {loading ? "Saving..." : (scheduleToEdit ? "Save Changes" : "Add Schedule")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
