'use client';

import React from 'react';
import {
    CheckSquare, Clock, Calendar, Edit2, Trash2,
    CheckCircle2, Circle, Repeat, ArrowDown, ArrowUp,
    Minus, Timer
} from 'lucide-react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Priority styling config
const PRIORITY = {
    HIGH: {
        bar: 'bg-red-500',
        barGlow: 'shadow-[0_0_8px_rgba(239,68,68,0.3)]',
        badge: 'bg-red-500/15 border-red-500/30 text-red-400',
        icon: ArrowUp,
        label: 'HIGH',
    },
    MEDIUM: {
        bar: 'bg-amber-500',
        barGlow: 'shadow-[0_0_8px_rgba(245,158,11,0.3)]',
        badge: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        icon: Minus,
        label: 'MED',
    },
    LOW: {
        bar: 'bg-blue-500',
        barGlow: 'shadow-[0_0_8px_rgba(59,130,246,0.3)]',
        badge: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
        icon: ArrowDown,
        label: 'LOW',
    },
};

export default function UniversalTaskCard({
    item,
    type = 'TASK',
    onComplete,
    onEdit,
    onDelete,
    hideActions = false
}) {
    const isCompleted = item.status === 'COMPLETED' || item.isCompleted;
    const isMissed = item.status === 'MISSED';

    // Extract data
    const schedule = item.schedule || {};
    const startTime = schedule.time || item.startTime;
    const endTime = schedule.endTime || item.endTime;
    const recurrence = schedule.type || item.recurrence;
    const repeatDays = schedule.days || item.repeatOnDays;
    const repeatUntil = schedule.until || item.repeatUntil;
    const scheduleDate = schedule.date || item.scheduleDate;
    const title = item.title || item.task?.title || 'Untitled';
    const description = item.notes || item.description || item.task?.description;
    const category = item.category || item.task?.category;
    const priority = (item.priority || 'MEDIUM').toUpperCase();
    const p = PRIORITY[priority] || PRIORITY.MEDIUM;
    const PIcon = p.icon;

    const isScheduleType = type === 'SCHEDULE' || item.type === 'SCHEDULED' || !!item.schedule?.type || !!item.recurrence;

    // Format time → returns { time: '9:00', period: 'am' } or null
    const fmt = (t) => {
        if (!t) return null;

        let hours, minutes;

        // "HH:mm" string from backend
        if (typeof t === 'string' && /^\d{2}:\d{2}$/.test(t)) {
            [hours, minutes] = t.split(':').map(Number);
        } else {
            const d = new Date(t);
            if (isNaN(d.getTime())) return null;
            hours = d.getHours();
            minutes = d.getMinutes();
        }

        const period = hours >= 12 ? 'pm' : 'am';
        const h12 = hours % 12 || 12;
        return { time: `${h12}:${String(minutes).padStart(2, '0')}`, period };
    };

    const fmtStart = fmt(startTime);
    const fmtEnd = fmt(endTime);

    // Helper to render time with inline period
    const TimeDisplay = ({ data, size = 'lg' }) => {
        if (!data) return null;
        const isLg = size === 'lg';
        return (
            <span className="inline-flex items-baseline gap-[2px] whitespace-nowrap">
                <span className={isLg ? 'text-[20px] font-bold' : 'text-[15px] font-medium'}>
                    {data.time}
                </span>
                <span className={`${isLg ? 'text-[11px]' : 'text-[10px]'} font-medium uppercase opacity-60`}>
                    {data.period}
                </span>
            </span>
        );
    };

    // Recurrence
    const recText = (() => {
        if (!isScheduleType) return null;
        if (!recurrence || recurrence === 'NONE') return 'ONETIME';
        if (recurrence === 'DAILY') return 'DAILY';
        if (recurrence === 'WEEKLY') {
            if (!repeatDays?.length) return 'WEEKLY';
            return `WEEKLY - ${[...repeatDays].sort((a, b) => a - b).map(d => DAY_NAMES[d]).join(', ')}`;
        }
        if (recurrence === 'MONTHLY') {
            // Extract day from scheduleDate or use today
            const d = scheduleDate ? new Date(scheduleDate).getDate() : new Date().getDate();
            return `MONTHLY at ${d}`;
        }
        return recurrence;
    })();

    // Smart due date label
    // Rules:
    // - Scheduled items → NEVER show due date label (they show recurrence label)
    // - Unscheduled with dueDate → show smart label (TODAY, END at X)
    // - Unscheduled without dueDate → show TODAY
    const dueDateLabel = (() => {
        // Scheduled items don't get due date labels
        if (isScheduleType) return null;

        const raw = item.dueDate;

        // No due date on unscheduled task → default to TODAY
        if (!raw) return 'TODAY';

        const due = new Date(raw);
        if (isNaN(due.getTime())) return 'TODAY';

        const now = new Date();
        const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dueLocal = new Date(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());

        if (dueLocal.getTime() === todayLocal.getTime()) return 'TODAY';

        const dueDay = dueLocal.getDate();
        const dueMonth = MONTH_NAMES[dueLocal.getMonth()];
        const dueYear = String(dueLocal.getFullYear()).slice(-2);

        if (dueLocal.getFullYear() === now.getFullYear() && dueLocal.getMonth() === now.getMonth()) {
            return `END at ${dueDay}`;
        }
        if (dueLocal.getFullYear() === now.getFullYear()) {
            return `END at ${dueDay} ${dueMonth}`;
        }
        return `END at ${dueDay} ${dueMonth} ${dueYear}`;
    })();



    return (
        <div
            className={`
      relative group
      bg-black
      rounded-xl overflow-hidden
      border border-white/10
      hover:border-cyan-500/40
      transition-all duration-200
      px-4 py-3
      ${isCompleted ? "opacity-60" : ""}
      ${isMissed ? "border-red-500/40 bg-red-950/10" : ""}
    `}
        >



            {/* Main Row */}
            <div className="grid grid-cols-[100px_1fr_auto] items-start gap-3">

                {/* Time */}
                <div className="flex flex-col font-mono leading-none">
                    {fmtStart ? (
                        <span className="text-cyan-400 tracking-tight">
                            <TimeDisplay data={fmtStart} size="lg" />
                        </span>
                    ) : (
                        <span className="text-white/30 text-[13px] font-bold tracking-widest uppercase">
                            ANYTIME
                        </span>
                    )}
                    {fmtEnd && (
                        <span className="text-gray-500 mt-1">
                            <TimeDisplay data={fmtEnd} size="sm" />
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="min-w-0">
                    <h3
                        className={`text-sm font-semibold text-white leading-tight truncate
            ${isCompleted ? "line-through opacity-50" : ""}
          `}
                    >
                        {title}
                    </h3>

                    {description && (
                        <p
                            className={`text-[11px] text-gray-500 font-mono mt-1 truncate
              ${isCompleted ? "line-through opacity-40" : ""}
            `}
                        >
                            {description}
                        </p>
                    )}
                </div>

                {/* Edit/Delete */}
                {!hideActions && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                className="text-gray-500 hover:text-cyan-400"
                            >
                                <Edit2 size={14} />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                                className="text-gray-500 hover:text-red-500"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Meta Row (tight) */}
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 text-[9px] font-mono uppercase tracking-wider">

                {/* Left */}
                <div className="flex items-center gap-2">

                    {recText && (
                        <span className="text-purple-400 border border-purple-500/20 px-1.5 py-[2px]">
                            {recText}
                        </span>
                    )}

                    {dueDateLabel && (
                        <span className={`border px-1.5 py-[2px] ${dueDateLabel === 'TODAY'
                            ? 'text-green-400 border-green-500/20'
                            : 'text-orange-400 border-orange-500/20'
                            }`}>
                            {dueDateLabel}
                        </span>
                    )}

                    {isMissed && (
                        <span className="text-red-400 border border-red-500/30 px-1.5 py-[2px]">
                            MISSED
                        </span>
                    )}

                </div>

                {/* Right */}
                <div className="flex items-center gap-2">

                    <span
                        className={`px-1.5 py-[2px] border
            ${priority === "HIGH"
                                ? "text-red-400 border-red-500/30"
                                : priority === "LOW"
                                    ? "text-blue-400 border-blue-500/30"
                                    : "text-amber-400 border-amber-500/30"
                            }
          `}
                    >
                        {priority}
                    </span>

                    <span className="text-gray-400 border border-white/10 px-1.5 py-[2px]">
                        {isScheduleType ? "SCHEDULED" : "TASK"}
                    </span>

                    {category && (
                        <span className="text-cyan-500 border border-cyan-900/30 px-1.5 py-[2px]">
                            {category.name || category}
                        </span>
                    )}

                    {onComplete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onComplete(item); }}
                            className={`
              ml-1
              ${isCompleted
                                    ? "text-green-500"
                                    : "text-gray-500 hover:text-green-400"
                                }
            `}
                        >
                            {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        </button>
                    )}

                </div>
            </div>

        </div>
    );
}
