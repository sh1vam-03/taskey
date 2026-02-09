"use client";
import React, { useEffect, useState } from "react";
import scheduleService from "@/services/schedule.service";
import { PageHeader } from "@/components/dashboard/PageHeader";
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
            <PageHeader
                title="Temporal Architecture"
                subtitle="Design and optimize your daily time allocation."
                action={
                    <button
                        onClick={handleCreateSchedule}
                        className="group flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] transition-all text-sm whitespace-nowrap"
                    >
                        <FaPlus className="group-hover:rotate-90 transition-transform" /> ALLOCATE_BLOCK
                    </button>
                }
            />

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 bg-zinc-900/50 p-2 rounded-xl border border-white/10">
                <div className="flex items-center gap-3 px-2">
                    <FaCalendarDay className="text-gray-500" />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="bg-transparent border-none text-white text-sm focus:ring-0 font-mono tracking-wide"
                    />
                </div>
                <div className="text-xs font-mono text-gray-500 px-4 uppercase hidden md:block">
                    // SCALE: 24H_CYCLE
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <SkeletonLoader type="list" />
            ) : sortedSchedules.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/20 border border-white/5 rounded-xl border-dashed">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 text-gray-600">
                        <FaClock size={24} />
                    </div>
                    <p className="text-gray-500 font-mono text-sm mb-4">NO_TEMPORAL_BLOCKS_DETECTED</p>
                    <button onClick={handleCreateSchedule} className="text-cyan-500 hover:text-cyan-400 text-xs font-bold uppercase tracking-wider">
                        + Initialize Time Block
                    </button>
                </div>
            ) : (
                <div className="relative border-l-2 border-dashed border-white/10 ml-4 space-y-8 py-4">
                    {sortedSchedules.map((schedule, idx) => (
                        <div key={schedule.id} className="relative pl-8 group">
                            {/* Timeline Node */}
                            <div className="absolute -left-[9px] top-6 transition-all duration-300 group-hover:scale-125 z-10">
                                <div className="w-4 h-4 rounded-full bg-black border-2 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                            </div>

                            <div className="relative overflow-hidden bg-zinc-900/40 border border-white/10 hover:border-cyan-500/30 rounded-xl p-5 transition-all hover:bg-zinc-900/60 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                                {/* Scanning Line */}
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-full group-hover:animate-[scan-fast_1.5s_infinite] pointer-events-none" />

                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3 text-cyan-400 font-mono text-sm">
                                            <span className="bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/30">
                                                {schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)}
                                            </span>
                                            {schedule.recurrence !== 'NONE' && (
                                                <span className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-widest pl-2">
                                                    <FaRedo className="w-2.5 h-2.5" /> {schedule.recurrence}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-cyan-100 transition-colors">
                                            {schedule.task?.title || "Untitled Allocation"}
                                        </h3>
                                        {schedule.notes && (
                                            <p className="text-sm text-gray-500 font-light border-l-2 border-white/5 pl-3 mt-2">{schedule.notes}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-end md:self-start">
                                        <button
                                            onClick={() => handleEditSchedule(schedule)}
                                            className="p-2 text-gray-400 hover:text-cyan-400 bg-black/50 hover:bg-cyan-950/30 rounded-lg border border-white/10 transition-colors"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSchedule(schedule.id)}
                                            className="p-2 text-gray-400 hover:text-red-400 bg-black/50 hover:bg-red-950/30 rounded-lg border border-white/10 transition-colors"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
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
