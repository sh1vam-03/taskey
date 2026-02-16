'use client';

import React from 'react';
import {
    CheckSquare, Clock, Calendar, Edit2, Trash2,
    CheckCircle2, Circle, Repeat, ArrowDown, ArrowUp,
    Minus, Timer
} from 'lucide-react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

    // Format time
    const fmt = (t) => {
        if (!t) return null;

        // If already HH:mm string
        if (typeof t === 'string' && t.length === 5) {
            return t;
        }

        const d = new Date(t);
        if (!isNaN(d.getTime())) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        return null;
    };

    const fmtStart = fmt(startTime);
    const fmtEnd = fmt(endTime);

    // Recurrence
    const recText = (() => {
        if (!recurrence || recurrence === 'NONE') return null;
        if (recurrence === 'DAILY') return 'Daily';
        if (recurrence === 'WEEKLY') {
            if (!repeatDays?.length) return 'Weekly';
            return [...repeatDays].sort((a, b) => a - b).map(d => DAY_NAMES[d]).join(' · ');
        }
        if (recurrence === 'MONTHLY') return 'Monthly';
        return recurrence;
    })();

    const isScheduleType = type === 'SCHEDULE' || item.type === 'SCHEDULED';

    return (
        <div
            className={`
      relative group
      bg-black
      border border-white/10
      hover:border-cyan-500/40
      transition-all duration-200
      px-4 py-3
      ${isCompleted ? "opacity-60" : ""}
      ${isMissed ? "border-red-500/40 bg-red-950/10" : ""}
    `}
        >

            {/* Corner Brackets (smaller) */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-cyan-500" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-cyan-500" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-cyan-500" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-cyan-500" />

            {/* Main Row */}
            <div className="grid grid-cols-[80px_1fr_auto] items-start gap-3">

                {/* Time */}
                <div className="flex flex-col font-mono leading-none">
                    <span className="text-cyan-400 text-[20px] font-bold tracking-tight">
                        {fmtStart || "--:--"}
                    </span>
                    {fmtEnd && (
                        <span className="text-gray-500 text-[15px] font-medium mt-1">
                            {fmtEnd}
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
                            {"> " + description}
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
