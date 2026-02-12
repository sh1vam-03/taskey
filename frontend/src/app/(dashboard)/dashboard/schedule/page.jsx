"use client";

import { useState, useEffect, useCallback } from 'react';
import scheduleService from '@/services/schedule.service';
import { Plus, Calendar as CalendarIcon, Clock, CheckCircle2, Circle, Trash2, Edit2, Calendar } from 'lucide-react';
import ScheduleModal from './ScheduleModal';
import { format, isPast, isToday, isTomorrow, parseISO } from 'date-fns';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import { useToast } from '@/context/ToastContext';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import usageService from '@/services/usage.service';

export default function SchedulePage() {
    const { success, error } = useToast();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scheduleToEdit, setScheduleToEdit] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, scheduleId: null });
    const [usage, setUsage] = useState(null);

    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const [data, usageData] = await Promise.all([
                scheduleService.getSchedules(), // Fetch all (or reasonable range)
                usageService.getMyUsage()
            ]);
            // Ensure data is an array
            setSchedules(Array.isArray(data) ? data : []);
            setUsage(usageData);
        } catch (err) {
            console.error("Failed to fetch schedules", err);
            error("Failed to load schedules");
        } finally {
            setLoading(false);
        }
    }, [error]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const handleCreate = () => {
        setScheduleToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (schedule) => {
        setScheduleToEdit(schedule);
        setIsModalOpen(true);
    };

    const confirmDelete = (schedule) => {
        setDeleteModal({ isOpen: true, scheduleId: schedule.id });
    };

    const handleDelete = async () => {
        try {
            await scheduleService.deleteSchedule(deleteModal.scheduleId);
            setDeleteModal({ isOpen: false, scheduleId: null });
            fetchSchedules();
            success("Schedule deleted successfully");
        } catch (err) {
            console.error("Delete failed", err);
            error("Failed to delete schedule");
        }
    };

    const handleToggleComplete = async (schedule) => {
        // Optimistic Update
        const previousSchedules = [...schedules];
        const updatedSchedules = schedules.map(s =>
            s.id === schedule.id ? { ...s, status: s.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' } : s
        );
        setSchedules(updatedSchedules);

        try {
            if (schedule.status === 'COMPLETED') {
                await scheduleService.undoCompleteSchedule(schedule.id);
            } else {
                await scheduleService.completeSchedule(schedule.id);
            }
            // fetchSchedules(); // Optional sync
        } catch (err) {
            console.error("Completion toggle error", err);
            setSchedules(previousSchedules); // Revert
            error("Failed to update status");
        }
    };

    const canCreate = !usage || usage.scheduleCount < (usage.limits?.schedule || Infinity);

    // Grouping & Sorting
    const sortedSchedules = [...schedules].sort((a, b) => {
        const dateA = new Date(`${a.scheduleDate}T${a.startTime || '00:00'}`);
        const dateB = new Date(`${b.scheduleDate}T${b.startTime || '00:00'}`);
        return dateA - dateB;
    });

    const upcomingSchedules = sortedSchedules.filter(s => s.status !== 'COMPLETED');
    const completedSchedules = sortedSchedules.filter(s => s.status === 'COMPLETED');

    const formatScheduleDate = (dateStr) => {
        const date = parseISO(dateStr);
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        return format(date, 'EEE, MMM d');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
                        <CalendarIcon className="h-8 w-8 text-cyan-500" />
                        Schedule
                    </h1>
                    <p className="text-gray-400 font-mono text-sm max-w-xl">
                        Manage your time-bound commitments and events.
                    </p>
                </div>

                <Button
                    onClick={handleCreate}
                    disabled={!canCreate}
                    variant="scanline"
                    className="shrink-0"
                >
                    <Plus className="h-4 w-4" /> Add Schedule
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Upcoming Schedules */}
                <Card className="min-h-[400px] border-white/10 bg-black/50">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-cyan-400" />
                        Upcoming
                        <Badge variant="info" className="ml-2">{upcomingSchedules.length}</Badge>
                    </h2>

                    <div className="space-y-2">
                        {loading ? (
                            <SkeletonLoader type="list" />
                        ) : upcomingSchedules.length > 0 ? (
                            upcomingSchedules.map(schedule => (
                                <div
                                    key={schedule.id}
                                    className="group flex items-center justify-between p-4 rounded-lg border border-transparent hover:bg-white/5 hover:border-white/10 transition-all duration-200"
                                >
                                    <div className="flex items-start gap-4">
                                        <button
                                            onClick={() => handleToggleComplete(schedule)}
                                            className="mt-1 text-gray-600 hover:text-cyan-500 transition-colors"
                                        >
                                            <Circle className="h-5 w-5" />
                                        </button>

                                        <div>
                                            <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                                                {schedule.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1.5 text-sm">
                                                <div className="flex items-center gap-1.5 text-cyan-200 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20">
                                                    <Calendar className="w-3 h-3 opacity-70" />
                                                    <span className="font-mono text-xs">{formatScheduleDate(schedule.scheduleDate)}</span>
                                                </div>
                                                {schedule.startTime && (
                                                    <div className="flex items-center gap-1.5 text-gray-400 font-mono text-xs">
                                                        <Clock className="w-3 h-3 opacity-70" />
                                                        {schedule.startTime} - {schedule.endTime}
                                                    </div>
                                                )}
                                                {schedule.category && (
                                                    <Badge variant="outline" className="text-[10px] py-0">
                                                        {schedule.category.name}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                                        <button
                                            onClick={() => handleEdit(schedule)}
                                            className="p-2 hover:bg-white/10 rounded-md text-gray-500 hover:text-cyan-400 transition-colors"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(schedule)}
                                            className="p-2 hover:bg-red-500/10 rounded-md text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                No upcoming schedules.
                            </div>
                        )}
                    </div>
                </Card>

                {/* Completed Schedules */}
                {completedSchedules.length > 0 && (
                    <div className="opacity-60 hover:opacity-100 transition-opacity">
                        <h2 className="text-sm font-bold text-gray-500 mb-4 px-1 uppercase tracking-wider flex items-center gap-2">
                            Completed <div className="h-px bg-white/10 flex-1"></div>
                        </h2>
                        <div className="space-y-2">
                            {completedSchedules.map(schedule => (
                                <div
                                    key={schedule.id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-black/20"
                                >
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleToggleComplete(schedule)}
                                            className="text-green-500 hover:text-red-400 transition-colors"
                                        >
                                            <CheckCircle2 className="h-5 w-5" />
                                        </button>
                                        <div>
                                            <h3 className="font-medium text-gray-500 line-through">
                                                {schedule.title}
                                            </h3>
                                            <div className="text-xs text-gray-600 font-mono mt-0.5">
                                                {formatScheduleDate(schedule.scheduleDate)}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => confirmDelete(schedule)}
                                        className="p-2 hover:bg-red-500/10 rounded-md text-gray-600 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                scheduleToEdit={scheduleToEdit}
                onScheduleSaved={() => {
                    fetchSchedules();
                    success(scheduleToEdit ? "Schedule updated" : "Schedule created");
                }}
            />

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, scheduleId: null })}
                onConfirm={handleDelete}
                title="Delete Schedule"
                message="Are you sure you want to remove this schedule from your timeline? This action cannot be undone."
                confirmText="Delete Schedule"
                variant="danger"
            />
        </div>
    );
}

