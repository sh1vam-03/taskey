"use client";

import { useState, useEffect, useCallback } from 'react';
import scheduleService from '@/services/schedule.service';
import {
    Plus,
    Calendar as CalendarIcon,
    Clock,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    CheckCircle2,
    Circle,
    CalendarDays,
    Trash2
} from 'lucide-react';
import ScheduleModal from './ScheduleModal';
import { format, isToday, parseISO, addDays, subDays } from 'date-fns';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import { useToast } from '@/context/ToastContext';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import UniversalTaskCard from '@/components/dashboard/UniversalTaskCard';
import usageService from '@/services/usage.service';

const RECURRENCE_LABELS = {
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly'
};

export default function SchedulePage() {
    const { success, error } = useToast();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scheduleToEdit, setScheduleToEdit] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, schedule: null });
    const [usage, setUsage] = useState(null);

    // Day View State
    const [selectedDate, setSelectedDate] = useState(new Date());

    const formatDateParam = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchSchedules = useCallback(async (isInitial = false) => {
        setLoading(true);
        try {
            const dateStr = formatDateParam(selectedDate);

            const [data, usageData] = await Promise.all([
                scheduleService.getSchedules({ from: dateStr, to: dateStr }),
                isInitial ? usageService.getMyUsage() : Promise.resolve(null)
            ]);

            setSchedules(Array.isArray(data) ? data : []);
            if (usageData) setUsage(usageData);
        } catch (err) {
            console.error("Failed to fetch schedules", err);
            error("Failed to load schedules");
        } finally {
            setLoading(false);
        }
    }, [selectedDate, error]);

    useEffect(() => {
        fetchSchedules(true);
    }, []);

    // Refetch when date changes
    useEffect(() => {
        fetchSchedules(false);
    }, [selectedDate]);

    // Date Navigation
    const goToPrevDay = () => setSelectedDate(prev => subDays(prev, 1));
    const goToNextDay = () => setSelectedDate(prev => addDays(prev, 1));
    const goToToday = () => setSelectedDate(new Date());

    const handleCreate = () => {
        setScheduleToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (schedule) => {
        setScheduleToEdit(schedule);
        setIsModalOpen(true);
    };

    const confirmDelete = (schedule) => {
        setDeleteModal({ isOpen: true, schedule });
    };

    const handleDelete = async () => {
        try {
            await scheduleService.deleteSchedule(deleteModal.schedule.id);
            setDeleteModal({ isOpen: false, schedule: null });
            fetchSchedules(false);
            success("Schedule deleted successfully");
        } catch (err) {
            console.error("Delete failed", err);
            error("Failed to delete schedule");
        }
    };

    const handleToggleComplete = async (schedule) => {
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
        } catch (err) {
            console.error("Completion toggle error", err);
            setSchedules(previousSchedules);
            error("Failed to update status");
        }
    };

    const canCreate = !usage || usage.scheduleCount < (usage.limits?.schedule || Infinity);

    // Sort by time
    const sortedSchedules = [...schedules].sort((a, b) => {
        const timeA = a.startTime || '00:00';
        const timeB = b.startTime || '00:00';
        return timeA.localeCompare(timeB);
    });

    // Group by Status
    const pendingSchedules = sortedSchedules.filter(s => s.status === 'PENDING');
    const completedSchedules = sortedSchedules.filter(s => s.status === 'COMPLETED');
    const missedSchedules = sortedSchedules.filter(s => s.status === 'MISSED');

    const isTodaySelected = isToday(selectedDate);

    const getDateLabel = () => {
        if (isTodaySelected) return 'Today';
        return format(selectedDate, 'EEEE, MMM d, yyyy');
    };

    // Build delete warning message
    const getDeleteWarningMessage = () => {
        const schedule = deleteModal.schedule;
        if (!schedule) return "Are you sure you want to delete this schedule?";

        const isRecurring = schedule.recurrence && schedule.recurrence !== 'NONE';
        const recurrenceLabel = RECURRENCE_LABELS[schedule.recurrence] || schedule.recurrence;

        // Day name mapping for weekly schedules
        const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Build schedule details text
        const getScheduleDetailsText = () => {
            if (schedule.recurrence === 'WEEKLY' && schedule.repeatOnDays?.length > 0) {
                const dayNames = schedule.repeatOnDays.map(d => DAY_NAMES[d]).join(', ');
                return (<>This is a <span className="text-white font-medium">Weekly</span> schedule that repeats every <span className="text-cyan-400 font-medium">{dayNames}</span>{schedule.repeatUntil ? <> until <span className="text-white font-medium">{format(parseISO(schedule.repeatUntil), 'MMM d, yyyy')}</span></> : ''}.</>);
            }
            if (schedule.recurrence === 'DAILY') {
                return (<>This is a <span className="text-white font-medium">Daily</span> schedule that repeats <span className="text-cyan-400 font-medium">every day</span>{schedule.repeatUntil ? <> until <span className="text-white font-medium">{format(parseISO(schedule.repeatUntil), 'MMM d, yyyy')}</span></> : ''}.</>);
            }
            if (schedule.recurrence === 'MONTHLY') {
                return (<>This is a <span className="text-white font-medium">Monthly</span> schedule that repeats <span className="text-cyan-400 font-medium">every month</span>{schedule.repeatUntil ? <> until <span className="text-white font-medium">{format(parseISO(schedule.repeatUntil), 'MMM d, yyyy')}</span></> : ''}.</>);
            }
            return null;
        };

        if (isRecurring) {
            return (
                <div className="space-y-3">
                    <p>
                        You are about to delete <span className="text-white font-semibold">"{schedule.title}"</span>.
                    </p>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-gray-300">
                        {getScheduleDetailsText()}
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg space-y-2">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-red-400 font-medium text-xs uppercase tracking-wider">Entire Schedule Will Be Deleted</p>
                                <p className="text-gray-300">
                                    This will permanently delete the <span className="text-white font-medium">entire schedule</span>, removing it from <span className="text-red-400 font-medium">every day</span> it appears on — not just {format(selectedDate, 'MMM d')}.
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-500 text-xs">
                        If you only want to skip it for {format(selectedDate, 'MMM d')}, consider editing the schedule instead of deleting it.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 pt-1 border-t border-white/5">
                        <Trash2 className="h-3 w-3" />
                        This action cannot be undone.
                    </div>
                </div>
            );
        }

        // Single (non-recurring) schedule
        return (
            <div className="space-y-3">
                <p>
                    Are you sure you want to delete <span className="text-white font-semibold">"{schedule.title}"</span>?
                </p>
                <p className="text-gray-500">
                    This is a one-time schedule on <span className="text-white font-medium">{format(parseISO(schedule.scheduleDate), 'EEEE, MMM d, yyyy')}</span> ({schedule.startTime} – {schedule.endTime}).
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600 pt-1 border-t border-white/5">
                    <Trash2 className="h-3 w-3" />
                    This action cannot be undone.
                </div>
            </div>
        );
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
                        Daily execution control — manage your time-bound commitments.
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

            {/* Date Navigation Bar */}
            <Card className="border-white/10 bg-black/50">
                <div className="flex items-center justify-between">
                    <button
                        onClick={goToPrevDay}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <CalendarDays className="h-5 w-5 text-cyan-500" />
                        <div className="text-center">
                            <h2 className="text-lg font-bold text-white">{getDateLabel()}</h2>
                            {isTodaySelected ? (
                                <p className="text-xs font-mono text-cyan-500">{format(selectedDate, 'EEEE, MMM d, yyyy')}</p>
                            ) : (
                                <button
                                    onClick={goToToday}
                                    className="text-xs font-mono text-cyan-500 hover:text-cyan-400 transition-colors underline underline-offset-2"
                                >
                                    Go to Today
                                </button>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={goToNextDay}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </Card>

            {/* Schedule Content */}
            <div className="space-y-6">
                {loading ? (
                    <Card className="min-h-[300px] border-white/10 bg-black/50">
                        <SkeletonLoader type="list" />
                    </Card>
                ) : schedules.length === 0 ? (
                    <Card className="border-white/10 bg-black/50">
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Clock className="h-8 w-8 text-gray-700" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1">No Schedules</h3>
                            <p className="text-gray-500 text-sm max-w-sm mb-6">
                                Nothing scheduled for {getDateLabel().toLowerCase()}. Create a new schedule or navigate to another day.
                            </p>
                            <Button onClick={handleCreate} variant="secondary" size="sm">
                                Add Schedule
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* Section 1: Pending / Upcoming */}
                        {pendingSchedules.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                                <h3 className="flex items-center gap-2 text-xs font-mono text-cyan-500 mb-3 uppercase tracking-wider opacity-80 pl-1">
                                    <Circle className="h-3 w-3" />
                                    Upcoming
                                    <Badge variant="info" className="ml-1">{pendingSchedules.length}</Badge>
                                </h3>
                                <div className="space-y-1">
                                    {pendingSchedules.map(schedule => (
                                        <UniversalTaskCard
                                            key={`${schedule.id}-${schedule.scheduleDate}`}
                                            item={schedule}
                                            type="SCHEDULE"
                                            onComplete={() => handleToggleComplete(schedule)}
                                            onEdit={() => handleEdit(schedule)}
                                            onDelete={() => confirmDelete(schedule)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section 2: Missed */}
                        {missedSchedules.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                                <h3 className="flex items-center gap-2 text-xs font-mono text-red-400 mb-3 uppercase tracking-wider opacity-80 pl-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Missed
                                    <Badge variant="danger" className="ml-1">{missedSchedules.length}</Badge>
                                </h3>
                                <div className="space-y-1">
                                    {missedSchedules.map(schedule => (
                                        <UniversalTaskCard
                                            key={`${schedule.id}-${schedule.scheduleDate}`}
                                            item={schedule}
                                            type="SCHEDULE"
                                            onComplete={() => handleToggleComplete(schedule)}
                                            onEdit={() => handleEdit(schedule)}
                                            onDelete={() => confirmDelete(schedule)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section 3: Completed */}
                        {completedSchedules.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200 opacity-60 hover:opacity-100 transition-opacity">
                                <h3 className="flex items-center gap-2 text-xs font-mono text-green-500 mb-3 uppercase tracking-wider opacity-80 pl-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Completed
                                    <Badge variant="success" className="ml-1">{completedSchedules.length}</Badge>
                                </h3>
                                <div className="space-y-1">
                                    {completedSchedules.map(schedule => (
                                        <UniversalTaskCard
                                            key={`${schedule.id}-${schedule.scheduleDate}`}
                                            item={schedule}
                                            type="SCHEDULE"
                                            onComplete={() => handleToggleComplete(schedule)}
                                            onDelete={() => confirmDelete(schedule)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Summary Bar */}
            {!loading && schedules.length > 0 && (
                <Card className="border-white/10 bg-black/30">
                    <div className="flex items-center justify-around text-center">
                        <div>
                            <p className="text-2xl font-bold text-white">{schedules.length}</p>
                            <p className="text-xs font-mono text-gray-500 uppercase">Total</p>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div>
                            <p className="text-2xl font-bold text-cyan-400">{pendingSchedules.length}</p>
                            <p className="text-xs font-mono text-gray-500 uppercase">Pending</p>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div>
                            <p className="text-2xl font-bold text-green-400">{completedSchedules.length}</p>
                            <p className="text-xs font-mono text-gray-500 uppercase">Done</p>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div>
                            <p className="text-2xl font-bold text-red-400">{missedSchedules.length}</p>
                            <p className="text-xs font-mono text-gray-500 uppercase">Missed</p>
                        </div>
                    </div>
                </Card>
            )}

            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                scheduleToEdit={scheduleToEdit}
                onScheduleSaved={() => {
                    fetchSchedules(false);
                    success(scheduleToEdit ? "Schedule updated" : "Schedule created");
                }}
            />

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, schedule: null })}
                onConfirm={handleDelete}
                title="Delete Schedule"
                message={getDeleteWarningMessage()}
                confirmText="Delete Permanently"
                variant="danger"
            />
        </div>
    );
}
