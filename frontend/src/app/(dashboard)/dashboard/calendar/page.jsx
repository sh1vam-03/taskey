"use client";
import React, { useEffect, useState } from "react";
import calendarService from "@/services/calendar.service";
import scheduleService from "@/services/schedule.service";
import taskService from "@/services/task.service";
import ScheduleModal from "@/components/dashboard/ScheduleModal";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import { FaChevronLeft, FaChevronRight, FaPlus, FaCheckCircle, FaClock, FaCalendarDay, FaCalendarWeek, FaCalendarAlt } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import UniversalTaskCard from '@/components/dashboard/UniversalTaskCard';

export default function CalendarPage() {
    const { success } = useToast();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState("month"); // 'day', 'week', 'month'
    const [events, setEvents] = useState([]); // [{ date: '2023-10-01', title: '...', type: '...' }]
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDateForModal, setSelectedDateForModal] = useState("");

    // Date Helpers
    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    };

    const formatDateISO = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    const fetchEvents = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            let result;
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            if (view === 'day') {
                result = await calendarService.getDayCalendar(formatDateISO(currentDate));
            } else if (view === 'week') {
                result = await calendarService.getWeekCalendar(formatDateISO(currentDate));
            } else { // month
                // API expects year and month (1-12)
                result = await calendarService.getMonthCalendar(year, month + 1);
            }


            setEvents(result);
        } catch (err) {
            console.error("Calendar load error:", err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [currentDate, view]);

    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (view === 'day') newDate.setDate(currentDate.getDate() - 1);
        else if (view === 'week') newDate.setDate(currentDate.getDate() - 7);
        else newDate.setMonth(currentDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (view === 'day') newDate.setDate(currentDate.getDate() + 1);
        else if (view === 'week') newDate.setDate(currentDate.getDate() + 7);
        else newDate.setMonth(currentDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    const handleDayClick = (day) => {
        // Switch to day view for that day
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const newDate = new Date(year, month, day);
        setCurrentDate(newDate);
        setView('day');
    };

    const handleToggleCompletion = async (item) => {
        try {
            // Optimistic update
            const updatedEvents = events.map(e => {
                if (e.id === item.id) {
                    return { ...e, status: e.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' };
                }
                return e;
            });
            setEvents(updatedEvents);

            // Determine service to call
            if (item.type === 'SCHEDULE') {
                if (item.status === 'COMPLETED') {
                    await scheduleService.undoCompleteSchedule(item.id);
                } else {
                    await scheduleService.completeSchedule(item.id);
                }
            } else {
                if (item.status === 'COMPLETED') {
                    await taskService.undoCompleteTask(item.id);
                } else {
                    await taskService.completeTask(item.id);
                }
            }
            fetchEvents(true); // Sync silently
        } catch (err) {
            console.error("Toggle error:", err);
            fetchEvents(true); // Revert silently
        }
    };

    // Render Helpers
    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const emptySlots = Array(firstDay).fill(null);
        const daySlots = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const getEventsForDay = (day) => {
            const mm = String(month + 1).padStart(2, '0');
            const dd = String(day).padStart(2, '0');
            const dateStr = `${year}-${mm}-${dd}`;
            return events.filter(e => e.date === dateStr);
        };

        return (
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden">
                <div className="grid grid-cols-7 bg-black/40 border-b border-white/5">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-[100px] md:auto-rows-[120px]">
                    {emptySlots.map((_, i) => (
                        <div key={`empty-${i}`} className="bg-black/20 border-r border-b border-white/5 last:border-r-0"></div>
                    ))}
                    {daySlots.map(day => {
                        const dayEvents = getEventsForDay(day);
                        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                        return (
                            <div
                                key={day}
                                onClick={() => handleDayClick(day)}
                                className={`border-r border-b border-white/5 p-2 relative group hover:bg-white/5 transition-colors cursor-pointer ${isToday ? 'bg-cyan-900/10' : ''}`}
                            >
                                <span className={`text-sm font-bold ${isToday ? 'text-cyan-400' : 'text-gray-400 group-hover:text-white'}`}>
                                    {day}
                                </span>
                                <div className="mt-1 space-y-1 overflow-y-auto max-h-[70px] no-scrollbar">
                                    {dayEvents.slice(0, 3).map(event => (
                                        <div
                                            key={event.id}
                                            className={`text-[10px] px-1.5 py-0.5 rounded truncate border ${event.type === 'SCHEDULE'
                                                ? 'bg-cyan-900/30 text-cyan-200 border-cyan-500/20'
                                                : 'bg-red-900/30 text-red-200 border-red-500/20'
                                                } ${event.status === 'COMPLETED' ? 'opacity-50 line-through' : ''}`}
                                            title={event.title}
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                    {dayEvents.length > 3 && (
                                        <div className="text-[10px] text-gray-500 pl-1">+{dayEvents.length - 3} more</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };



    // ... (in renderDayView)

    const renderDayView = () => {
        // ...
        return (
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 min-h-[400px]">
                {loading ? <SkeletonLoader type="list" /> : (
                    <div className="space-y-4">
                        {events.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">No events for this day.</div>
                        ) : (
                            events.map(event => (
                                <UniversalTaskCard
                                    key={event.id}
                                    item={event}
                                    type={event.type}
                                    onComplete={() => handleToggleCompletion(event)}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderWeekView = () => {
        const start = getStartOfWeek(currentDate);
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = addDays(start, i);
            return {
                date: d,
                dateStr: formatDateISO(d),
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNum: d.getDate()
            };
        });

        return (
            <div className="grid grid-cols-7 gap-2 h-full overflow-x-auto min-h-[500px]">
                {days.map(dayInfo => {
                    const dayEvents = events.filter(e => e.date === dayInfo.dateStr);
                    const isToday = dayInfo.dateStr === formatDateISO(new Date());

                    return (
                        <div key={dayInfo.dateStr} className="flex flex-col gap-2 rounded-xl bg-zinc-900/30 border border-white/5 overflow-hidden">
                            <div className={`p-3 text-center border-b border-white/5 ${isToday ? 'bg-cyan-900/20' : 'bg-black/20'}`}>
                                <div className="text-xs text-gray-500 uppercase font-bold">{dayInfo.dayName}</div>
                                <div className={`text-lg font-bold ${isToday ? 'text-cyan-400' : 'text-white'}`}>{dayInfo.dayNum}</div>
                            </div>
                            <div className="p-2 space-y-2 flex-1 relative">
                                {loading && dayEvents.length === 0 ? <SkeletonLoader className="h-full" /> : (
                                    dayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            className={`p-2 rounded text-xs border cursor-pointer hover:opacity-80 transition-opacity ${event.type === 'SCHEDULE'
                                                ? 'bg-cyan-900/20 text-cyan-200 border-cyan-500/20'
                                                : 'bg-red-900/20 text-red-200 border-red-500/20'
                                                } ${event.status === 'COMPLETED' ? 'opacity-50 line-through' : ''}`}
                                            onClick={() => handleToggleCompletion(event)}
                                        >
                                            <div className="font-bold truncate">{event.title}</div>
                                            <div className="opacity-70 text-[10px]">{event.startTime}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    {view === 'month' && currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    {view === 'day' && currentDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                    {view === 'week' && `Week of ${formatDateISO(getStartOfWeek(currentDate))}`}
                </h1>

                <div className="flex items-center gap-4">
                    {/* View Switcher */}
                    <div className="flex bg-zinc-900 border border-white/10 rounded-lg p-1">
                        <button onClick={() => setView('day')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'day' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>Day</button>
                        <button onClick={() => setView('week')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'week' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>Week</button>
                        <button onClick={() => setView('month')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'month' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>Month</button>
                    </div>

                    <div className="flex bg-zinc-900 border border-white/10 rounded-lg p-1">
                        <button onClick={handlePrev} className="p-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors">
                            <FaChevronLeft />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 text-sm hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors">
                            Today
                        </button>
                        <button onClick={handleNext} className="p-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors">
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid/List */}
            <div className="flex-1">
                {view === 'day' && renderDayView()}
                {view === 'week' && renderWeekView()}
                {view === 'month' && renderMonthView()}
            </div>

            {/* Modal - reuse Create Schedule Modal */}
            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                scheduleToEdit={{ scheduleDate: selectedDateForModal }} // Pre-fill date
                onScheduleSaved={() => {
                    fetchEvents(); // Refresh calendar
                    success("Event scheduled successfully");
                }}
            />
        </div>
    );
}

