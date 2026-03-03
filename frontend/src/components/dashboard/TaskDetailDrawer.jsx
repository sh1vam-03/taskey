"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, Edit2, CheckCircle2, Circle, Clock, Tag, Flag, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TaskDetailDrawer({ isOpen, onClose, item, onComplete, onEdit, onDelete }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    if (!mounted) return null;

    const isCompleted = item?.status === 'COMPLETED' || item?.isCompleted;
    const isMissed = item?.status === 'MISSED';

    const schedule = item?.schedule || {};
    const startTime = schedule.time || item?.startTime;
    const endTime = schedule.endTime || item?.endTime;
    const recurrence = schedule.type || item?.recurrence;
    const repeatDays = schedule.days || item?.repeatOnDays;
    const scheduleDate = schedule.date || item?.scheduleDate;
    const title = item?.title || item?.task?.title || 'Untitled';
    const description = item?.notes || item?.description || item?.task?.description;
    const category = item?.category || item?.task?.category;
    const priority = (item?.priority || 'MEDIUM').toUpperCase();

    const isScheduleType = item?.type === 'SCHEDULED' || !!item?.schedule?.type || !!item?.recurrence;

    // Formatting helpers
    const fmt = (t) => {
        if (!t) return null;
        let hours, minutes;
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
        return `${h12}:${String(minutes).padStart(2, '0')} ${period}`;
    };

    const recText = (() => {
        if (!isScheduleType) return null;
        if (!recurrence || recurrence === 'NONE') return 'ONETIME';
        if (recurrence === 'DAILY') return 'DAILY';
        if (recurrence === 'WEEKLY') {
            if (!repeatDays?.length) return 'WEEKLY';
            return `WEEKLY - ${[...repeatDays].sort((a, b) => a - b).map(d => DAY_NAMES[d]).join(', ')}`;
        }
        if (recurrence === 'MONTHLY') {
            const d = scheduleDate ? new Date(scheduleDate).getDate() : new Date().getDate();
            return `MONTHLY at ${d}`;
        }
        return recurrence;
    })();

    const dueDateLabel = (() => {
        if (isScheduleType) return null;
        const raw = item?.dueDate;
        if (!raw) return 'TODAY';
        const due = new Date(raw);
        if (isNaN(due.getTime())) return 'TODAY';
        return `${due.getDate()} ${MONTH_NAMES[due.getMonth()]} ${due.getFullYear()}`;
    })();

    const drawerContent = (
        <div className={`fixed inset-0 z-[100] transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className={`
                absolute bg-zinc-950 border-white/10 shadow-2xl flex flex-col
                transition-all duration-300 ease-out
                
                /* Mobile: Bottom Sheet */
                bottom-0 left-0 right-0 h-[70vh] rounded-t-2xl border-t
                ${isOpen ? 'translate-y-0' : 'translate-y-full'}

                /* Desktop: Right Panel */
                md:top-0 md:bottom-0 md:left-auto md:right-0 md:w-[450px] md:h-full md:rounded-none md:border-l md:border-t-0
                ${isOpen ? 'md:translate-x-0' : 'md:translate-x-full'}
            `}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            {isMissed && <span className="bg-red-500/20 text-red-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-red-500/30">Missed</span>}
                            {isCompleted && <span className="bg-green-500/20 text-green-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-green-500/30">Completed</span>}
                            {!isMissed && !isCompleted && <span className="bg-cyan-500/20 text-cyan-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-cyan-500/30">Pending</span>}

                            <span className="text-gray-500 text-[10px] font-mono">{isScheduleType ? 'SCHEDULE' : 'TASK'}</span>
                        </div>
                        <h2 className={`text-xl font-bold text-white mt-2 leading-tight ${isCompleted ? 'line-through opacity-50' : ''}`}>{title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors self-start shrink-0">
                        <X size={20} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Time block */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-1 text-center">
                            <span className="text-gray-500 text-xs font-mono uppercase">Start</span>
                            <span className="text-white font-bold text-lg">{fmt(startTime) || 'Anytime'}</span>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-1 text-center">
                            <span className="text-gray-500 text-xs font-mono uppercase">End</span>
                            <span className="text-white font-bold text-lg">{fmt(endTime) || '—'}</span>
                        </div>
                    </div>

                    {/* Metadata block */}
                    <div className="space-y-4">
                        {recText && (
                            <div className="flex items-center justify-between py-3 border-b border-white/5">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Clock size={16} /> <span className="text-sm font-medium uppercase font-mono tracking-wider">Recurrence</span>
                                </div>
                                <span className="text-white font-mono text-sm">{recText}</span>
                            </div>
                        )}

                        {dueDateLabel && (
                            <div className="flex items-center justify-between py-3 border-b border-white/5">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Calendar size={16} /> <span className="text-sm font-medium uppercase font-mono tracking-wider">Due</span>
                                </div>
                                <span className={`text-sm font-bold ${dueDateLabel === 'TODAY' ? 'text-green-400' : 'text-orange-400'}`}>{dueDateLabel}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between py-3 border-b border-white/5">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Tag size={16} /> <span className="text-sm font-medium uppercase font-mono tracking-wider">Category</span>
                            </div>
                            <span className="text-cyan-400 font-mono text-sm">{category?.name || category || 'None'}</span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-white/5">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Flag size={16} /> <span className="text-sm font-medium uppercase font-mono tracking-wider">Priority</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${priority === 'HIGH' ? 'text-red-400 border-red-500/40 bg-red-500/10' :
                                priority === 'LOW' ? 'text-blue-400 border-blue-500/40 bg-blue-500/10' :
                                    'text-amber-400 border-amber-500/40 bg-amber-500/10'
                                }`}>{priority}</span>
                        </div>
                    </div>

                    {/* Description */}
                    {description && (
                        <div>
                            <h3 className="text-sm font-medium uppercase font-mono tracking-wider text-gray-500 mb-3">Notes & Details</h3>
                            <div className="bg-black/50 border border-white/5 rounded-xl p-5 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                                {description}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/10 shrink-0 flex items-center gap-3">
                    {onDelete && (
                        <Button variant="danger" onClick={(e) => { e.stopPropagation(); onDelete(item); onClose(); }} className="flex-1">
                            <Trash2 size={16} /> Delete
                        </Button>
                    )}
                    {onEdit && (
                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); onEdit(item); onClose(); }} className="flex-1">
                            <Edit2 size={16} /> Edit
                        </Button>
                    )}
                    {onComplete && !isMissed && (
                        <Button
                            variant={isCompleted ? "outline" : "scanline"}
                            onClick={(e) => { e.stopPropagation(); onComplete(item); onClose(); }}
                            className="flex-auto"
                        >
                            {isCompleted ? <><CheckCircle2 size={16} /> Uncomplete</> : <><Circle size={16} /> Mark Complete</>}
                        </Button>
                    )}
                </div>
            </div>

        </div>
    );

    return createPortal(drawerContent, document.body);
}
