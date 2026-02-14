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
    const endTime = item.endTime;
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
        const d = new Date(t);
        return d.toString() !== 'Invalid Date'
            ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : String(t).slice(0, 5);
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
        <div className={`group/card relative flex overflow-hidden rounded-lg border transition-all duration-300 ${isCompleted
                ? 'border-white/[0.05] bg-white/[0.015] opacity-60 hover:opacity-80'
                : isMissed
                    ? 'border-red-500/20 bg-red-950/[0.15] hover:border-red-500/30'
                    : 'border-white/[0.07] bg-white/[0.025] hover:border-cyan-500/30 hover:bg-white/[0.045] hover:shadow-[0_0_20px_rgba(6,182,212,0.04)]'
            }`}>

            {/* Left Priority Accent Bar — always visible */}
            <div className={`w-[3px] shrink-0 transition-all duration-300 ${isCompleted ? 'bg-green-500/40' : isMissed ? 'bg-red-500/60' : p.bar
                } ${!isCompleted && !isMissed ? p.barGlow : ''}`} />

            {/* Main Content Area */}
            <div className="flex items-stretch flex-1 min-w-0 p-3 pl-3.5 gap-3">

                {/* Time / Type Block */}
                <div className="flex items-center shrink-0">
                    {fmtStart ? (
                        <div className={`flex flex-col items-center justify-center w-[64px] py-2 rounded-md border font-mono transition-all duration-200 ${isCompleted
                                ? 'bg-zinc-900/50 border-white/[0.05] text-gray-600'
                                : isMissed
                                    ? 'bg-red-950/40 border-red-500/20 text-red-400/80'
                                    : 'bg-black/70 border-white/[0.08] text-cyan-400 group-hover/card:border-cyan-500/30 group-hover/card:shadow-[0_0_10px_rgba(6,182,212,0.08)]'
                            }`}>
                            <Clock className="h-3 w-3 opacity-40 mb-0.5" />
                            <span className="text-[11px] font-bold leading-none">{fmtStart}</span>
                            {fmtEnd && (
                                <span className="text-[9px] opacity-40 mt-0.5 leading-none">{fmtEnd}</span>
                            )}
                        </div>
                    ) : (
                        <div className={`flex items-center justify-center w-10 h-10 rounded-md border transition-all duration-200 ${isCompleted
                                ? 'bg-zinc-900/50 border-white/[0.05]'
                                : 'bg-black/70 border-white/[0.08] group-hover/card:border-cyan-500/20'
                            }`}>
                            <CheckSquare className={`h-4 w-4 ${isCompleted ? 'text-gray-600' : 'text-cyan-500/60 group-hover/card:text-cyan-400'
                                }`} />
                        </div>
                    )}
                </div>

                {/* Center Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    {/* Title */}
                    <h4 className={`text-sm font-medium truncate transition-colors duration-200 leading-snug ${isCompleted
                            ? 'text-gray-500 line-through decoration-gray-700'
                            : isMissed
                                ? 'text-red-300'
                                : 'text-gray-100 group-hover/card:text-white'
                        }`}>
                        {title}
                    </h4>

                    {/* Meta Badges Row */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {/* Priority */}
                        <span className={`inline-flex items-center gap-0.5 h-[18px] px-1.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${p.badge} ${isCompleted ? 'opacity-40' : ''}`}>
                            <PIcon className="h-2.5 w-2.5" />
                            {p.label}
                        </span>

                        {/* Type Badge */}
                        <span className={`inline-flex items-center gap-1 h-[18px] px-1.5 rounded text-[9px] font-mono uppercase tracking-wide border ${isCompleted
                                ? 'bg-white/[0.02] border-white/[0.05] text-gray-600'
                                : isScheduleType
                                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-400/80'
                                    : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400/80'
                            }`}>
                            {isScheduleType ? (
                                <><Timer className="h-2.5 w-2.5" /> Schedule</>
                            ) : (
                                <><CheckSquare className="h-2.5 w-2.5" /> Task</>
                            )}
                        </span>

                        {/* Recurrence */}
                        {recText && (
                            <span className={`inline-flex items-center gap-1 h-[18px] px-1.5 rounded text-[9px] font-mono border ${isCompleted
                                    ? 'bg-white/[0.02] border-white/[0.05] text-gray-600'
                                    : 'bg-cyan-500/[0.06] border-cyan-500/15 text-cyan-400/60'
                                }`}>
                                <Repeat className="h-2.5 w-2.5" />
                                {recText}
                            </span>
                        )}

                        {/* Date */}
                        {!recText && scheduleDate && (
                            <span className={`inline-flex items-center gap-1 h-[18px] px-1.5 rounded text-[9px] font-mono border ${isCompleted
                                    ? 'bg-white/[0.02] border-white/[0.05] text-gray-600'
                                    : 'bg-white/[0.03] border-white/[0.06] text-gray-400'
                                }`}>
                                <Calendar className="h-2.5 w-2.5" />
                                {new Date(scheduleDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        )}

                        {/* Until */}
                        {repeatUntil && (
                            <span className={`inline-flex items-center gap-1 h-[18px] px-1.5 rounded text-[9px] font-mono border ${isCompleted
                                    ? 'bg-white/[0.02] border-white/[0.05] text-gray-600'
                                    : 'bg-white/[0.03] border-white/[0.06] text-gray-500'
                                }`}>
                                <span className="opacity-40">→</span>
                                {new Date(repeatUntil).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        )}

                        {/* Category */}
                        {category && (
                            <span className={`inline-flex items-center gap-1 h-[18px] px-1.5 rounded text-[9px] font-mono uppercase tracking-wide border ${isCompleted
                                    ? 'bg-white/[0.02] border-white/[0.05] text-gray-600'
                                    : 'bg-white/[0.03] border-white/[0.06] text-gray-400'
                                }`}>
                                {category.color && (
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
                                )}
                                {category.name}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {description && (
                        <p className={`text-[11px] mt-1.5 line-clamp-1 leading-relaxed ${isCompleted ? 'text-gray-700' : 'text-gray-500'
                            }`}>
                            {description}
                        </p>
                    )}
                </div>

                {/* Right: Actions */}
                {!hideActions && (
                    <div className="flex items-center gap-0.5 shrink-0 self-center">
                        {/* Hover Actions */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100 transition-all duration-200 translate-x-1 group-hover/card:translate-x-0">
                            {onEdit && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                    className="p-1.5 rounded-md text-gray-600 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-150"
                                    title="Edit"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                                    className="p-1.5 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                                    title="Delete"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Complete Toggle */}
                        {onComplete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onComplete(item); }}
                                className={`p-1.5 rounded-md transition-all duration-200 ${isCompleted
                                        ? 'text-green-500/60 hover:text-gray-400 hover:bg-white/5'
                                        : 'text-gray-600 hover:text-green-400 hover:bg-green-500/10'
                                    }`}
                                title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                            >
                                {isCompleted
                                    ? <CheckCircle2 className="h-5 w-5" />
                                    : <Circle className="h-5 w-5" />
                                }
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
