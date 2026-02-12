"use client";
import React, { useEffect, useState } from "react";
import behaviorService from "@/services/behavior.service";
import BehaviorLogModal from "@/components/dashboard/BehaviorLogModal";
import { BrainCircuit, TrendingUp, Lightbulb, Activity, CheckCircle2, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, subDays, addDays, isSameDay, parseISO } from 'date-fns';
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PerformanceChart from "@/components/dashboard/charts/PerformanceChart";
import { useToast } from "@/context/ToastContext";

export default function BehaviorPage() {
    const { success } = useToast();
    const [summary, setSummary] = useState(null);
    const [todayLog, setTodayLog] = useState(null); // Keeps track of today specifically for logging
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dayDetails, setDayDetails] = useState(null); // Data for the selected date
    const [explanation, setExplanation] = useState("");
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chartPeriod, setChartPeriod] = useState(7);

    // Initial Load: Summary + Default Date (Today)
    const loadInitialData = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const [summaryData, logData, explainData] = await Promise.all([
                behaviorService.getSummary(chartPeriod),
                behaviorService.getBehaviorByDate(today).catch(() => null),
                behaviorService.explainScore(today).catch(() => ({ explanation: "Not enough data for explanation yet." }))
            ]);

            setSummary(summaryData);
            setTodayLog(logData); // Cache today's log for the "Log" button
            setDayDetails(logData); // Initially showing today
            setExplanation(explainData?.explanation || "No explanation available.");
        } catch (err) {
            console.error("Behavior fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Date Selection Load: Details + Explanation only
    const loadDayDetails = async (date) => {
        setDetailsLoading(true);
        try {
            const [logData, explainData] = await Promise.all([
                behaviorService.getBehaviorByDate(date).catch(() => null),
                behaviorService.explainScore(date).catch(() => ({ explanation: "No data available for this date." }))
            ]);
            setDayDetails(logData);
            setExplanation(explainData?.explanation || "No explanation available for this date.");
        } catch (err) {
            console.error("Day fetch error:", err);
            setDayDetails(null);
            setExplanation("Failed to load data.");
        } finally {
            setDetailsLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    // Re-fetch summary when chart period changes
    useEffect(() => {
        if (!summary) return; // Don't run on first mount (handled by loadInitialData)
        const updateSummary = async () => {
            try {
                const data = await behaviorService.getSummary(chartPeriod);
                setSummary(data);
            } catch (e) { console.error(e); }
        };
        updateSummary();
    }, [chartPeriod]);

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        loadDayDetails(date);
    };

    const handleNextDay = () => {
        const next = addDays(parseISO(selectedDate), 1);
        if (next <= new Date()) handleDateSelect(format(next, 'yyyy-MM-dd'));
    };

    const handlePrevDay = () => {
        const prev = subDays(parseISO(selectedDate), 1);
        handleDateSelect(format(prev, 'yyyy-MM-dd'));
    };

    // Helper to get color based on score
    const getScoreColor = (score) => {
        if (score >= 80) return "text-green-500 border-green-500/50 shadow-green-900/50";
        if (score >= 60) return "text-cyan-500 border-cyan-500/50 shadow-cyan-900/50";
        if (score >= 40) return "text-yellow-500 border-yellow-500/50 shadow-yellow-900/50";
        return "text-red-500 border-red-500/50 shadow-red-900/50";
    };

    const currentScore = dayDetails?.score || 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
                        <BrainCircuit className="h-8 w-8 text-cyan-500" />
                        Neural Analysis
                    </h1>
                    <p className="text-gray-400 font-mono text-sm max-w-xl">
                        Monitor behavioral patterns and productivity metrics.
                    </p>
                </div>

                <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="scanline"
                    className="shrink-0"
                >
                    <Activity className="h-4 w-4" /> Log Current State
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Score Gauge */}
                <Card className="flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <BrainCircuit className="w-64 h-64" />
                    </div>

                    <h2 className="text-gray-400 text-sm font-mono font-bold uppercase tracking-widest mb-8">
                        Productivity Index
                    </h2>

                    {loading ? (
                        <div className="w-48 h-48 rounded-full border-4 border-white/5 animate-spin border-t-cyan-500 flex items-center justify-center">
                            <span className="text-cyan-500 font-mono text-xs animate-pulse">CALCULATING...</span>
                        </div>
                    ) : (
                        <div className="relative group">
                            <div className={`
                                w-56 h-56 rounded-full border-8 flex items-center justify-center transition-all duration-1000
                                ${getScoreColor(currentScore).replace('text-', 'border-')} 
                                shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black/50 backdrop-blur-sm
                            `}>
                                <div className="text-center z-10">
                                    <span className={`text-7xl font-black tracking-tighter shimmer-text ${getScoreColor(currentScore).split(' ')[0]}`}>
                                        {detailsLoading ? (
                                            <span className="text-4xl animate-pulse">...</span>
                                        ) : (
                                            currentScore || 0
                                        )}
                                    </span>
                                    <div className="text-xs text-gray-500 font-mono mt-2 bg-black/50 px-2 py-1 rounded inline-block border border-white/5">
                                        {selectedDate === new Date().toISOString().split('T')[0] ? 'CURRENT STATUS' : `SCORE FOR ${format(parseISO(selectedDate), 'MMM d')}`}
                                    </div>
                                </div>
                            </div>

                            {/* Decorative rings */}
                            <div className="absolute inset-0 rounded-full border border-white/5 scale-110 animate-pulse-slow" />
                            <div className="absolute inset-0 rounded-full border border-white/5 scale-125 opacity-30" />
                        </div>
                    )}

                    <div className="mt-10 text-center max-w-md bg-white/5 p-4 rounded-lg border border-white/5 backdrop-blur-sm">
                        <div className="flex items-start justify-center gap-3 text-gray-300 text-sm">
                            <Lightbulb className="text-yellow-500 shrink-0 mt-0.5 h-4 w-4" />
                            <p className="font-mono text-xs leading-relaxed">
                                {loading || detailsLoading ? "ANALYZING NEURAL PATTERNS..." : explanation}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Trends & Stats */}
                <div className="space-y-6">
                    {/* Trend Chart */}
                    <Card
                        title={`${chartPeriod}-Day Trend Analysis`}
                        icon={TrendingUp}
                        className="relative"
                    >
                        <div className="absolute top-4 right-4 flex bg-white/5 rounded-lg p-1 border border-white/5">
                            <button
                                onClick={() => setChartPeriod(7)}
                                className={`px-3 py-1 text-xs rounded-md transition-all ${chartPeriod === 7 ? 'bg-cyan-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                7D
                            </button>
                            <button
                                onClick={() => setChartPeriod(30)}
                                className={`px-3 py-1 text-xs rounded-md transition-all ${chartPeriod === 30 ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                30D
                            </button>
                        </div>

                        <div className="h-64 mt-4">
                            {loading ? (
                                <div className="h-full flex items-end justify-between gap-2 px-2 opacity-50 animate-pulse">
                                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                        <div key={i} className="w-full bg-white/5 rounded-t" style={{ height: `${Math.random() * 80 + 20}%` }} />
                                    ))}
                                </div>
                            ) : (
                                <PerformanceChart
                                    data={summary?.history || []}
                                    type="area"
                                    dataKey="score"
                                    xAxisKey="date"
                                    height={250}
                                    color={chartPeriod === 7 ? "#06b6d4" : "#a855f7"}
                                />
                            )}
                        </div>
                    </Card>

                    {/* Day Explorer / Date Picker */}
                    <Card className="border-t-4 border-t-blue-500/50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-blue-400" />
                                Day Explorer
                            </h2>
                            <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 border border-white/5">
                                <button onClick={handlePrevDay} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-sm font-mono px-2 min-w-[100px] text-center">
                                    {format(parseISO(selectedDate), 'MMM d, yyyy')}
                                </span>
                                <button
                                    onClick={handleNextDay}
                                    disabled={selectedDate >= new Date().toISOString().split('T')[0]}
                                    className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                            {Array.from({ length: 5 }).map((_, i) => {
                                const date = subDays(new Date(), 4 - i);
                                const dateStr = format(date, 'yyyy-MM-dd');
                                const isSelected = selectedDate === dateStr;
                                const isToday = isSameDay(date, new Date());

                                return (
                                    <button
                                        key={dateStr}
                                        onClick={() => handleDateSelect(dateStr)}
                                        className={`
                                            flex flex-col items-center p-2 rounded-lg border transition-all min-w-[60px]
                                            ${isSelected
                                                ? 'bg-blue-500/20 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'}
                                        `}
                                    >
                                        <span className="text-[10px] uppercase font-bold">{isToday ? 'TDY' : format(date, 'EEE')}</span>
                                        <span className={`text-lg font-mono ${isSelected ? 'text-blue-400' : ''}`}>{format(date, 'd')}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <Card className="border-t-4 border-t-purple-500/50">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Focus Duration</div>
                                <Clock className="h-4 w-4 text-purple-500" />
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight">
                                {detailsLoading ? <span className="text-lg animate-pulse">...</span> : (dayDetails?.focusHours || 0)}
                                <span className="text-sm font-normal text-gray-500 ml-1">hrs</span>
                            </div>
                        </Card>

                        <Card className="border-t-4 border-t-cyan-500/50">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Tasks Executed</div>
                                <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight">
                                {detailsLoading ? <span className="text-lg animate-pulse">...</span> : (dayDetails?.tasksCompleted || 0)}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <BehaviorLogModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onLogSaved={() => {
                    fetchData();
                    success("Behavioral log committed");
                }}
                currentLog={todayLog}
            />
        </div>
    );
}
