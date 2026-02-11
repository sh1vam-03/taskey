'use client';

import { useState, useEffect } from 'react';
import calendarService from '@/services/calendar.service';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import ScheduleModal from './ScheduleModal';
import { startOfWeek, endOfWeek, addDays, format, subWeeks, addWeeks, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function SchedulePage() {
    const [view, setView] = useState('WEEK');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            let start, end;
            if (view === 'WEEK') {
                start = startOfWeek(currentDate, { weekStartsOn: 1 });
                end = endOfWeek(currentDate, { weekStartsOn: 1 });
            } else {
                start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
                end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
            }

            const data = await calendarService.getEvents(
                format(start, 'yyyy-MM-dd'),
                format(end, 'yyyy-MM-dd')
            );
            setEvents(data);
        } catch (err) {
            console.error("Failed to fetch calendar", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [currentDate, view]);

    const handlePrev = () => {
        setCurrentDate(d => view === 'WEEK' ? subWeeks(d, 1) : addWeeks(d, -4));
    };

    const handleNext = () => {
        setCurrentDate(d => view === 'WEEK' ? addWeeks(d, 1) : addWeeks(d, 4));
    };

    const handleDateClick = (dateStr) => {
        setSelectedDate(dateStr);
        setIsModalOpen(true);
    };

    // Render Week Grid
    const renderWeekView = () => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

        return (
            <Card className="p-0 overflow-hidden bg-black/50 border-white/10">
                <div className="grid grid-cols-7 border-b border-white/10">
                    {days.map(day => (
                        <div key={day.toString()} className="py-3 text-center border-r border-white/10 last:border-r-0 bg-white/5">
                            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest block mb-1">
                                {format(day, 'EEE')}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 min-h-[600px]">
                    {days.map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isToday = isSameDay(day, new Date());
                        const dayEvents = events.filter(e => e.date === dateStr);

                        return (
                            <div
                                key={dateStr}
                                className={`
                                    relative border-r border-white/10 last:border-r-0 p-2 flex flex-col gap-2 group transition-colors
                                    ${isToday ? 'bg-cyan-900/10' : 'hover:bg-white/5'}
                                `}
                            >
                                <div className="text-center mb-2">
                                    <div className={`
                                        text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full mx-auto font-mono transition-all
                                        ${isToday
                                            ? 'bg-cyan-500 text-black shadow-[0_0_10px_#06b6d4]'
                                            : 'text-gray-400 group-hover:text-white group-hover:bg-white/10'
                                        }
                                    `}>
                                        {format(day, 'd')}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-2">
                                    {dayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            className={`
                                                p-2 rounded border text-xs transition-all cursor-pointer hover:scale-[1.02]
                                                ${event.type === 'TASK'
                                                    ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:border-red-500/40'
                                                    : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:border-cyan-500/40'
                                                }
                                            `}
                                        >
                                            {event.startTime && (
                                                <div className="flex items-center gap-1 mb-1 opacity-70 font-mono text-[10px]">
                                                    <Clock className="w-3 h-3" />
                                                    {event.startTime}
                                                </div>
                                            )}
                                            <div className="font-medium truncate">{event.title}</div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => handleDateClick(dateStr)}
                                        className="w-full py-1.5 mt-auto text-[10px] font-mono uppercase text-gray-500 border border-dashed border-gray-700 rounded hover:border-cyan-500/50 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        + Allocate Block
                                    </button>
                                </div>

                                {isToday && <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />}
                            </div>
                        );
                    })}
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
                        <CalendarIcon className="h-8 w-8 text-cyan-500" />
                        Temporal Grid
                    </h1>
                    <p className="text-gray-400 font-mono text-sm max-w-xl">
                        Allocate operational time blocks and schedule events.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-black/50 p-1.5 rounded-lg border border-white/10">
                    <button
                        onClick={handlePrev}
                        className="p-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-mono font-bold text-white min-w-[140px] text-center uppercase tracking-widest text-sm">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button
                        onClick={handleNext}
                        className="p-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <Button
                        onClick={() => { setSelectedDate(null); setIsModalOpen(true); }}
                        variant="scanline"
                        size="sm"
                    >
                        <Plus className="h-4 w-4" /> Add Event
                    </Button>
                </div>
            </div>

            {loading && events.length === 0 ? (
                <div className="h-[600px] flex items-center justify-center rounded-xl border border-white/10 bg-black/50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                        <p className="text-gray-500 font-mono text-sm animate-pulse">SYNCING TEMPORAL DATA...</p>
                    </div>
                </div>
            ) : renderWeekView()}

            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedDate={selectedDate}
                onScheduleSaved={fetchEvents}
            />
        </div>
    );
}
