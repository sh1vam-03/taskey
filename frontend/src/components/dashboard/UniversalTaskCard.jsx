'use client';

import React from 'react';
import { CheckSquare, Clock, Calendar, Edit2, Trash2, CheckCircle2, Circle, Repeat, Timer } from 'lucide-react';
import Button from '@/components/ui/Button';

// Days Map
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Types: 'TASK' | 'SCHEDULE' | 'SCHEDULED' (legacy)
export default function UniversalTaskCard({
    item,
    type = 'TASK', // 'TASK' or 'SCHEDULE'
    onComplete,
    onEdit,
    onDelete,
    hideActions = false
}) {
    // Normalize Data
    const isCompleted = item.status === 'COMPLETED' || item.isCompleted;

    // Extract Schedule Data
    const schedule = item.schedule || {};
    const hasSchedule = !!item.schedule || type === 'SCHEDULE' || item.type === 'SCHEDULED';
    const startTime = schedule.time || item.startTime;
    const recurrence = schedule.type || item.recurrence;
    const repeatDays = schedule.days || item.repeatOnDays;
    const repeatUntil = schedule.until || item.repeatUntil;
    const scheduleDate = schedule.date || item.scheduleDate;

    // Helper: Priority Colors
    const getPriorityColor = (p) => {
        switch (p) {
            case 'HIGH': return 'border-red-500/30 text-red-500';
            case 'MEDIUM': return 'border-yellow-500/30 text-yellow-500';
            case 'LOW': return 'border-blue-500/30 text-blue-500';
            default: return 'border-gray-500/30 text-gray-500';
        }
    };

    // Helper: Recurrence Text
    const getRecurrenceDetails = () => {
        if (!recurrence || recurrence === 'NONE') return null;
        if (recurrence === 'DAILY') return 'Daily';
        if (recurrence === 'WEEKLY') {
            if (!repeatDays || repeatDays.length === 0) return 'Weekly';
            // Sort days 0-6
            const sortedDays = [...repeatDays].sort((a, b) => a - b);
            return `Weekly: ${sortedDays.map(d => DAY_NAMES[d]).join(', ')}`;
        }
        if (recurrence === 'MONTHLY') return 'Monthly';
        return recurrence;
    };

    const recurrenceText = getRecurrenceDetails();

    // Time/Icon Block Logic
    const renderLeftBlock = () => {
        if (startTime) {
            // Schedule: Show Time
            // Parse time string (HH:mm:ss or ISO)
            const timeStr = new Date(startTime).toString() !== 'Invalid Date'
                ? new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : String(startTime).slice(0, 5);

            return (
                <div className={`flex flex-col items-center justify-center h-12 w-16 shrink-0 rounded-lg border border-white/10 font-mono text-xs ${isCompleted ? 'bg-zinc-900/50 text-gray-500' : 'bg-black text-cyan-500'}`}>
                    <span className="font-bold">{timeStr}</span>
                    <Clock className="h-3 w-3 opacity-50 mt-0.5" />
                </div>
            );
        } else {
            // Task: Show Priority/Icon
            const priorityLower = (item.priority || 'MEDIUM').toUpperCase();

            return (
                <div className={`flex items-center justify-center h-12 w-12 shrink-0 rounded-lg border border-white/10 ${isCompleted ? 'bg-zinc-900/50 text-gray-500' : 'bg-black text-white'}`}>
                    <CheckSquare className={`h-5 w-5 ${isCompleted ? 'text-gray-600' : 'text-cyan-500'}`} />
                </div>
            );
        }
    };

    return (
        <div className={`group/card flex items-center justify-between gap-4 rounded-lg border transition-all duration-200 p-3 
            ${isCompleted ? 'bg-zinc-900/30 border-white/5 opacity-70' : 'bg-white/5 border-white/5 hover:border-cyan-500/30 hover:bg-white/10'}`}>

            <div className="flex items-start gap-4 grow min-w-0">
                {/* Left Block (Time or Icon) */}
                {renderLeftBlock()}

                {/* Content */}
                <div className="min-w-0 grow">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-medium truncate transition-colors ${isCompleted ? 'text-gray-500 line-through' : 'text-white group-hover/card:text-cyan-400'}`}>
                            {item.title || item.task?.title || "Untitled"}
                        </h4>
                    </div>

                    {/* Recurrence & Schedule Info */}
                    {(recurrenceText || scheduleDate) && (
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            {recurrenceText && (
                                <div className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-cyan-400/80 font-mono flex items-center gap-1 shrink-0">
                                    <Repeat className="h-3 w-3" />
                                    {recurrenceText}
                                </div>
                            )}

                            {/* If One-time scheduled date exists and no recurrence */}
                            {(!recurrenceText && scheduleDate) && (
                                <div className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-400 font-mono flex items-center gap-1 shrink-0">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(scheduleDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </div>
                            )}

                            {/* Until Date */}
                            {repeatUntil && (
                                <div className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-500 font-mono flex items-center gap-1 shrink-0">
                                    <span className="opacity-50">Until:</span>
                                    {new Date(repeatUntil).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    {(item.description || item.notes || item.task?.description) && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {item.notes || item.description || item.task?.description}
                        </p>
                    )}
                </div>

                {/* Meta: Priority & Category */}
                <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 self-center">
                    {/* Priority Badge */}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono uppercase ${getPriorityColor(item.priority || 'MEDIUM')}`}>
                        {item.priority || 'MEDIUM'}
                    </span>

                    {/* Category */}
                    {(item.category || item.task?.category) && (
                        <span className="text-[10px] uppercase font-mono text-gray-500 px-1.5 py-0.5 flex items-center gap-1">
                            {(item.category?.color || item.task?.category?.color) && (
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.category?.color || item.task?.category?.color }}></span>
                            )}
                            {item.category?.name || item.task?.category?.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            {!hideActions && (
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    {/* Hover Actions (Edit/Delete) */}
                    <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity translate-x-2 group-hover/card:translate-x-0 duration-200">
                        {onEdit && (
                            <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-1.5 text-gray-500 hover:text-cyan-400 hover:bg-white/10 rounded transition-colors">
                                <Edit2 className="h-4 w-4" />
                            </button>
                        )}
                        {onDelete && (
                            <button onClick={(e) => { e.stopPropagation(); onDelete(item); }} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Completion Toggle */}
                    {onComplete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onComplete(item); }}
                            className={`ml-1 transition-colors ${isCompleted ? 'text-green-500 hover:text-gray-400' : 'text-gray-600 hover:text-green-500 hover:bg-green-500/10'}`}
                        >
                            {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
