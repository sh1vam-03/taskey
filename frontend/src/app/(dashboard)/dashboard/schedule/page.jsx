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
import UniversalTaskCard from '@/components/dashboard/UniversalTaskCard';
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
            const today = new Date();
            const from = today.toISOString().split('T')[0];
            const to = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0];

            const [data, usageData] = await Promise.all([
                scheduleService.getSchedules({ from, to }), // Fetch upcoming month
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
            (s.id === schedule.id && s.scheduleDate === schedule.scheduleDate)
                ? { ...s, status: s.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }
                : s
        );
        setSchedules(updatedSchedules);

        try {
            if (schedule.status === 'COMPLETED') {
                await scheduleService.undoCompleteSchedule(schedule.id, schedule.scheduleDate);
            } else {
                await scheduleService.completeSchedule(schedule.id, schedule.scheduleDate);
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
                                <UniversalTaskCard
                                    key={`${schedule.id}-${schedule.scheduleDate}`}
                                    item={schedule}
                                    type="SCHEDULE"
                                    onComplete={() => handleToggleComplete(schedule)}
                                    onEdit={() => handleEdit(schedule)}
                                    onDelete={() => confirmDelete(schedule)}
                                />
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
                                <UniversalTaskCard
                                    key={`${schedule.id}-${schedule.scheduleDate}`}
                                    item={schedule}
                                    type="SCHEDULE"
                                    onComplete={() => handleToggleComplete(schedule)}
                                    onDelete={() => confirmDelete(schedule)}
                                // No edit for completed typically, or keep it consistent
                                />
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

