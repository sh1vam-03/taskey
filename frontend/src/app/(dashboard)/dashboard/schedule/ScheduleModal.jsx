'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import scheduleService from '@/services/schedule.service';
import taskService from '@/services/task.service';
import Button from '@/components/ui/Button';
import { AlertCircle, Clock, Calendar, Repeat } from 'lucide-react';

export default function ScheduleModal({ isOpen, onClose, selectedDate, onScheduleSaved, scheduleToEdit }) {
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);

    const DAYS = [
        { id: 1, label: 'M' },
        { id: 2, label: 'T' },
        { id: 3, label: 'W' },
        { id: 4, label: 'T' },
        { id: 5, label: 'F' },
        { id: 6, label: 'S' },
        { id: 7, label: 'S' }
    ];

    useEffect(() => {
        if (isOpen) {
            taskService.getTasks().then(data => {
                // Only show tasks without dueDate (tasks with dueDate can't be scheduled)
                const schedulable = (data.tasks || []).filter(t => !t.dueDate);
                setTasks(schedulable);
            }).catch(console.error);

            if (scheduleToEdit) {
                // EDIT MODE
                reset({
                    taskId: scheduleToEdit.taskId,
                    scheduleDate: scheduleToEdit.startScheduleDate ? new Date(scheduleToEdit.startScheduleDate).toISOString().split('T')[0] : scheduleToEdit.scheduleDate,
                    startTime: scheduleToEdit.startTime,
                    endTime: scheduleToEdit.endTime,
                    recurrence: scheduleToEdit.recurrence || 'NONE',
                    repeatUntil: scheduleToEdit.repeatUntil ? new Date(scheduleToEdit.repeatUntil).toISOString().split('T')[0] : '',
                    repeatOnDays: scheduleToEdit.repeatOnDays || []
                });
            } else {
                // CREATE MODE
                reset({
                    taskId: '',
                    scheduleDate: selectedDate || new Date().toISOString().split('T')[0],
                    startTime: '09:00',
                    endTime: '10:00',
                    recurrence: 'NONE',
                    repeatUntil: ''
                });
            }
            setError(null);
        }
    }, [isOpen, selectedDate, reset, scheduleToEdit]);

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);

        // Sanitize Payload
        const payload = { ...data };

        if (payload.recurrence === 'NONE') {
            payload.repeatUntil = null;
            payload.repeatOnDays = [];
        } else if (payload.recurrence === 'DAILY') {
            payload.repeatOnDays = [];
        } else if (payload.recurrence === 'WEEKLY') {
            // Ensure repeatOnDays is array of numbers (handle string from hidden input edge case)
            const days = data.repeatOnDays || [];
            payload.repeatOnDays = (Array.isArray(days) ? days : String(days).split(',').filter(Boolean)).map(Number);
        } else if (payload.recurrence === 'MONTHLY') {
            payload.repeatOnDays = [];
        }

        if (!payload.repeatUntil) payload.repeatUntil = null;

        try {
            if (scheduleToEdit) {
                await scheduleService.updateSchedule(scheduleToEdit.id, payload);
            } else {
                await scheduleService.createSchedule(payload);
            }
            onScheduleSaved();
            onClose();
        } catch (err) {
            console.error("Schedule Save Error:", err);
            setError(err.response?.data?.message || "Failed to save schedule allocation.");
        } finally {
            setLoading(false);
        }
    };

    // Watchers
    const watchRecurrence = watch('recurrence', 'NONE');
    const watchRepeatOnDays = watch('repeatOnDays', []);

    const toggleDay = (dayId) => {
        const current = watchRepeatOnDays || [];
        const updated = current.includes(dayId)
            ? current.filter(d => d !== dayId)
            : [...current, dayId];
        setValue('repeatOnDays', updated);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={scheduleToEdit ? "UPDATE ASSIGNMENT" : "ALLOCATE TIME BLOCK"}
            className="border-white/10 bg-black/90 backdrop-blur-xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Select Objective</label>
                    <select
                        {...register('taskId', { required: "Objective selection is required" })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm appearance-none"
                    >
                        <option value="" className="bg-black text-gray-500">SELECT OBJECTIVE...</option>
                        {tasks.map(t => (
                            <option key={t.id} value={t.id} className="bg-black text-white">{t.title}</option>
                        ))}
                    </select>
                    {errors.taskId && <p className="text-red-400 text-xs">{errors.taskId.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="h-3 w-3" /> Date
                        </label>
                        <input
                            type="date"
                            {...register('scheduleDate', { required: true })}
                            min={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })()}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm scheme-dark"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Repeat className="h-3 w-3" /> Recurrence
                        </label>
                        <select
                            {...register('recurrence')}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm appearance-none"
                        >
                            <option value="NONE" className="bg-black text-white">SINGLE BLOCK</option>
                            <option value="DAILY" className="bg-black text-white">DAILY CYCLE</option>
                            <option value="WEEKLY" className="bg-black text-white">WEEKLY CYCLE</option>
                            <option value="MONTHLY" className="bg-black text-white">MONTHLY CYCLE</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3 w-3" /> Start Time
                        </label>
                        <input
                            type="time"
                            {...register('startTime', { required: true })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm scheme-dark"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3 w-3" /> End Time
                        </label>
                        <input
                            type="time"
                            {...register('endTime', { required: true })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm scheme-dark"
                        />
                    </div>
                </div>

                {/* Recurring Options */}
                {watchRecurrence !== 'NONE' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 border-t border-white/5 pt-4">

                        {watchRecurrence === 'WEEKLY' && (
                            <div className="space-y-2">
                                <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Repeat On Days</label>
                                <div className="flex gap-2">
                                    {DAYS.map(day => (
                                        <button
                                            key={day.id}
                                            type="button"
                                            onClick={() => toggleDay(day.id)}
                                            className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-all ${watchRepeatOnDays?.includes(day.id)
                                                ? 'bg-cyan-500 text-black'
                                                : 'bg-white/5 text-gray-500 hover:bg-white/10'
                                                }`}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                                {/* repeatOnDays managed by setValue(), no hidden input needed */}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Repeat Until</label>
                            <input
                                type="date"
                                {...register('repeatUntil', { required: "End date required for recurring events" })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm scheme-dark"
                            />
                            {errors.repeatUntil && <p className="text-red-400 text-xs">{errors.repeatUntil.message}</p>}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                    >
                        ABORT
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="min-w-[120px]"
                    >
                        {loading ? 'SAVING...' : (scheduleToEdit ? 'UPDATE BLOCK' : 'CONFIRM BLOCK')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
