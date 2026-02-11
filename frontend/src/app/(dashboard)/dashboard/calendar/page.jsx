"use client";
import React, { useEffect, useState } from "react";
import calendarService from "@/services/calendar.service";
import ScheduleModal from "@/components/dashboard/ScheduleModal";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";

export default function CalendarPage() {
    const { success } = useToast();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]); // [{ date: '2023-10-01', title: '...', type: '...' }]
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDateForModal, setSelectedDateForModal] = useState("");

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    // Helper to get days in month
    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    // Helper to get first day of month (0 = Sun, 1 = Mon...)
    const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

    const fetchEvents = async () => {
        setLoading(true);
        try {
            // Fetch for entire month
            // Calculate 'from' and 'to'
            const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
            const to = `${year}-${String(month + 1).padStart(2, '0')}-${getDaysInMonth(year, month)}`;

            const result = await calendarService.getEvents(from, to);
            setEvents(result);
        } catch (err) {
            console.error("Calendar load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [year, month]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDayClick = (day) => {
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const dateStr = `${year}-${mm}-${dd}`;
        setSelectedDateForModal(dateStr);
        setIsModalOpen(true);
    };

    // Calendar Grid Generation
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    {currentDate.toLocaleString('default', { month: 'long' })} <span className="text-gray-500">{year}</span>
                </h1>
                <div className="flex bg-zinc-900 border border-white/10 rounded-lg p-1">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors">
                        <FaChevronLeft />
                    </button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors">
                        <FaChevronRight />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 bg-black/40 border-b border-white/5">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Days */}
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
                                className={`border-r border-b border-white/5 p-2 relative group hover:bg-white/5 transition-colors cursor-pointer ${isToday ? 'bg-cyan-900/10' : ''
                                    }`}
                            >
                                <span className={`text-sm font-bold ${isToday ? 'text-cyan-400' : 'text-gray-400 group-hover:text-white'}`}>
                                    {day}
                                </span>

                                <div className="mt-1 space-y-1 overflow-y-auto max-h-[70px] no-scrollbar">
                                    {loading ? (
                                        <SkeletonLoader className="h-2 w-12" />
                                    ) : (
                                        dayEvents.map(event => (
                                            <div
                                                key={event.id}
                                                className={`text-[10px] px-1.5 py-0.5 rounded truncate border ${event.type === 'SCHEDULE'
                                                    ? 'bg-cyan-900/30 text-cyan-200 border-cyan-500/20'
                                                    : 'bg-red-900/30 text-red-200 border-red-500/20'
                                                    }`}
                                                title={event.title}
                                            >
                                                {event.type === 'SCHEDULE' && <span className="opacity-50 mr-1">●</span>}
                                                {event.title}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Add Button on Hover */}
                                <button className="absolute bottom-1 right-1 p-1.5 bg-cyan-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                    <FaPlus size={8} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal - reuse Create Schedule Modal, pre-filled with date */}
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
