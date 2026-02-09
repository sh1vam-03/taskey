"use client";
import React, { useEffect, useState } from "react";
import scheduleService from "@/services/schedule.service";
import ScheduleModal from "@/components/dashboard/ScheduleModal";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import { FaPlus, FaClock, FaCalendarDay, FaTrash, FaEdit, FaRedo } from "react-icons/fa";

export default function SchedulePage() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // Default Today

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            // Need to pass date filter? Backend logic might just list all.
            // Let's list all for now, or use filter.
            // Service supports filters: { date }
            const result = await scheduleService.getSchedules({ date: filterDate });
            setSchedules(result);
            setError(null);
        } catch (err) {
            console.error("Schedules fetch error:", err);
            setError("Failed to load schedules");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [filterDate]);

    const handleCreateSchedule = () => {
        setEditingSchedule(null);
        setIsModalOpen(true);
    };

    const handleEditSchedule = (schedule) => {
        setEditingSchedule(schedule);
        setIsModalOpen(true);
    };

    const handleDeleteSchedule = async (id) => {
        if (!confirm("Are you sure you want to delete this schedule?")) return;
        try {
            await scheduleService.deleteSchedule(id);
            setSchedules(schedules.filter(s => s.id !== id));
        } catch (err) {
            alert("Failed to delete schedule");
        }
    };

    // Sort by start time
    const sortedSchedules = [...schedules].sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white">Schedule</h1>
                    {/* Date Picker */}
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="bg-black/50 border border-white/10 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                </div>

                <button
                    onClick={handleCreateSchedule}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-cyan-900/20 transition-all text-sm whitespace-nowrap"
                >
                    <FaPlus /> Time Block
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <SkeletonLoader type="list" />
            ) : sortedSchedules.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/30 border border-white/5 rounded-xl border-dashed">
                    <p className="text-gray-500 mb-4">No schedules for {filterDate}.</p>
                    <button onClick={handleCreateSchedule} className="text-cyan-400 hover:text-cyan-300 text-sm font-bold">
                        Add a time block
                    </button>
                </div>
            ) : (
                <div className="relative border-l border-white/10 ml-4 space-y-6 py-2">
                    {sortedSchedules.map((schedule, idx) => (
                        <div key={schedule.id} className="relative pl-8 group">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[5px] top-6 w-2.5 h-2.5 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] z-10"></div>

                            <div className="bg-zinc-900/50 border border-white/5 hover:border-cyan-500/30 rounded-xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 text-cyan-400 font-mono text-sm mb-1">
                                        <FaClock className="w-3.5 h-3.5" />
                                        {schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)}
                                        {schedule.recurrence !== 'NONE' && (
                                            <span className="flex items-center gap-1 text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 border border-white/10 ml-2">
                                                <FaRedo className="w-2.5 h-2.5" /> {schedule.recurrence}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-white text-lg">
                                        {schedule.task?.title || "Untitled Task"}
                                    </h3>
                                    {schedule.notes && (
                                        <p className="text-sm text-gray-500 mt-1">{schedule.notes}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-end md:self-auto">
                                    <button
                                        onClick={() => handleEditSchedule(schedule)}
                                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors bg-black/30 rounded-lg border border-white/5"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSchedule(schedule.id)}
                                        className="p-2 text-gray-400 hover:text-red-400 transition-colors bg-black/30 rounded-lg border border-white/5"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                scheduleToEdit={editingSchedule}
                onScheduleSaved={fetchSchedules}
            />
        </div>
    );
}
