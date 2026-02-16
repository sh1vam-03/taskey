'use client';

import { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import dashboardService from '@/services/dashboard.service';
import usageService from '@/services/usage.service';
import billingService from '@/services/billing.service';
import behaviorService from '@/services/behavior.service';
import scheduleService from '@/services/schedule.service';
import { Zap, CheckSquare, Trophy, BrainCircuit, TrendingUp, Activity, Calendar, ArrowRight, Bot, Target } from 'lucide-react';
import UniversalTaskCard from '@/components/dashboard/UniversalTaskCard';
import Link from 'next/link';
import taskService from '@/services/task.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

// ... (keep imports)

// Inside render:



export default function DashboardOverview() {
    const { user, refreshUser } = useAuth();
    const [overview, setOverview] = useState(null);
    const [usage, setUsage] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const behaviorLogged = useRef(false);

    // 1. Behavior Update (Once on Load)
    useEffect(() => {
        const logBehavior = async () => {
            if (behaviorLogged.current) return;
            behaviorLogged.current = true;
            try {
                // Call behavior update silently
                await behaviorService.upsertBehavior({
                    date: new Date().toISOString().split('T')[0],
                    mood: "NEUTRAL", // Default to NEUTRAL for auto-log
                    notes: "Daily Dashboard Check-in"
                });
            } catch (err) {
                // Silent fail for behavior log
                console.warn("Behavior log failed:", err);
            }
        };

        if (user) {
            logBehavior();
        }
    }, [user]);

    // 2. Fetch Overview Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Calculate local date string to ensure backend matches user's "Today"
                const localDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

                const [overviewData, usageData, subscriptionData] = await Promise.all([
                    dashboardService.getOverview(localDate),
                    usageService.getMyUsage(),
                    billingService.getCurrentSubscription()
                ]);
                setOverview(overviewData);
                setUsage(usageData);
                setSubscription(subscriptionData);
            } catch (err) {
                console.error("Dashboard Load Error:", err);
                setError("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    const handleToggleItem = async (item) => {
        try {
            // Optimistic Update: Immediately update UI
            const isNowCompleted = !(item.status === 'COMPLETED' || item.isCompleted);
            const status = isNowCompleted ? 'COMPLETED' : 'PENDING';

            setOverview(prev => ({
                ...prev,
                timeline: prev.timeline.map(t =>
                    t.id === item.id ? { ...t, status, isCompleted: isNowCompleted } : t
                ),
                todayTasksCount: isNowCompleted ? prev.todayTasksCount - 1 : prev.todayTasksCount + 1,
                completedTasksCount: isNowCompleted ? prev.completedTasksCount + 1 : prev.completedTasksCount - 1
            }));

            // Sync with backend
            if (item.type === 'SCHEDULED') {
                if (!isNowCompleted) {
                    await scheduleService.undoCompleteSchedule(item.id);
                } else {
                    await scheduleService.completeSchedule(item.id);
                }
            } else {
                // Task (UNSCHEDULED)
                if (!isNowCompleted) {
                    await taskService.undoCompleteTask(item.id);
                } else {
                    await taskService.completeTask(item.id);
                }
            }

            // Silent Refetch to ensure consistency (optional, can be debounced)
            const localDate = new Date().toLocaleDateString('en-CA');
            const overviewData = await dashboardService.getOverview(localDate);
            setOverview(overviewData);
        } catch (err) {
            console.error("Failed to toggle item:", err);
            // Revert state on error (optional implementation)
        }
    };


    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <SkeletonLoader type="card" />
                    <SkeletonLoader type="card" />
                    <SkeletonLoader type="card" />
                    <SkeletonLoader type="card" />
                </div>
                <SkeletonLoader type="list" className="h-96" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-red-500 font-mono">
                Error: {error}
            </div>
        );
    }

    const isLowCredits = user?.aiCreditBalance < 10;

    // Greeting Time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <ErrorBoundary>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                            {greeting}, <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">{user?.name?.split(' ')[0]}</span>.
                        </h1>
                        <p className="text-gray-400 font-mono text-sm max-w-xl">
                            Systems online. Ready to optimize your workflow.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/tasks">
                            <Button variant="scanline" size="sm">
                                New Task
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Credit Warning */}
                {isLowCredits && (
                    <div className="flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-500">
                        <Zap className="h-5 w-5" />
                        <div className="flex-1">
                            <p className="font-medium font-mono">LOW_ENERGY_WARNING</p>
                            <p className="text-xs opacity-70">
                                Neural capacity at {user?.aiCreditBalance} units. Recharge recommended.
                            </p>
                        </div>
                        <Link href="/dashboard/billing">
                            <Button variant="ghost" size="sm" className="text-yellow-500 hover:text-yellow-400">
                                RECHARGE
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Today Tasks */}
                    <Card
                        title="Today Tasks"
                        icon={CheckSquare}
                        className="min-h-[140px]"
                    >
                        <div className="flex-1 flex items-center">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">{overview?.todayTasksCount || 0}</span>
                                <span className="text-sm text-gray-500">/ {overview?.todayTasksTotal || 0}</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                            Pending Actions
                        </p>
                    </Card>

                    {/* Completed Tasks */}
                    <Card
                        title="Completed"
                        icon={Trophy}
                        className="min-h-[140px]"
                    >
                        <div className="flex-1 flex items-center">
                            <div className="text-3xl font-bold text-white">{overview?.completedTasksCount || 0}</div>
                        </div>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                            Tasks Finished
                        </p>
                    </Card>

                    {/* Productivity Score */}
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <span>Productivity Score</span>
                                <div className="group relative">
                                    <Activity className="h-4 w-4 text-gray-500 hover:text-cyan-400 cursor-help transition-colors" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs text-cyan-100 bg-cyan-950/90 border border-cyan-500/20 rounded shadow-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                        Tasks (70%) + Lifestyle (30%)
                                    </div>
                                </div>
                            </div>
                        }
                        icon={BrainCircuit}
                        className="min-h-[140px]"
                    >
                        <div className="flex-1 flex items-center">
                            <div className="text-3xl font-bold text-white">{overview?.productivityScore || 0}</div>
                        </div>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                            Daily Efficiency Index
                        </p>
                    </Card>

                    {/* Current Streak */}
                    <Card
                        title="Current Streak"
                        icon={TrendingUp}
                        className="min-h-[140px]"
                    >
                        <div className="flex-1 flex items-center">
                            <div className="text-3xl font-bold text-white">{overview?.currentStreak || 0}</div>
                        </div>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                            Day Streak
                        </p>
                    </Card>
                </div>

                {/* Overview Section */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* Today's Timeline */}
                    <Card
                        className="lg:col-span-4 min-h-[400px]"
                        title="Temporal Timeline"
                        icon={Activity}
                        description="Scheduled blocks for the current cycle."
                    >
                        <div className="space-y-4 mt-6">
                            {overview?.timeline?.length > 0 ? (
                                overview.timeline.map((item, i) => (
                                    <UniversalTaskCard
                                        key={i}
                                        item={item}
                                        type={item.type === 'SCHEDULED' ? 'SCHEDULE' : 'TASK'}
                                        onComplete={() => handleToggleItem(item)}
                                    />
                                ))

                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <Calendar className="h-8 w-8 text-gray-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-1">Timeline Clear</h3>
                                    <p className="text-gray-500 text-sm max-w-sm mb-6">
                                        No temporal blocks allocated for this cycle. Initialize a schedule to begin.
                                    </p>
                                    <Link href="/dashboard/schedule">
                                        <Button variant="secondary" size="sm">
                                            Initialize Schedule
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Quick Actions / Recent */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card
                            title="Quick Operations"
                            icon={Zap}
                        >
                            <div className="grid gap-3 mt-4">
                                <Link href="/dashboard/tasks" className="p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all group flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-black rounded border border-white/10 text-cyan-500">
                                            <CheckSquare className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">Create Task</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors" />
                                </Link>

                                <Link href="/dashboard/ai" className="p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all group flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-black rounded border border-white/10 text-purple-500">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">Consult AI</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors" />
                                </Link>

                                <Link href="/dashboard/schedule" className="p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-green-500/30 transition-all group flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-black rounded border border-white/10 text-green-500">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium text-white group-hover:text-green-400 transition-colors">View Schedule</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors" />
                                </Link>
                            </div>
                        </Card>

                        <Card
                            title="Plan Status"
                            icon={Target}
                        >
                            <div className="mt-4 space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                    <span className="text-sm text-gray-400">Current Plan</span>
                                    <span className="text-sm font-bold text-cyan-400">{subscription?.plan || 'Free'}</span>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2">
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Usage</span>
                                        <span>{(subscription?.usageLimit > 0) ? Math.round((usage?.aiTokensUsed / subscription.usageLimit) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-2 bg-black rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-cyan-500 rounded-full"
                                            style={{ width: `${(subscription?.usageLimit > 0) ? Math.min(((usage?.aiTokensUsed || 0) / subscription.usageLimit) * 100, 100) : 0}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                    <span className="text-sm text-gray-400">Renewal</span>
                                    <span className="text-sm font-mono text-white">{subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
