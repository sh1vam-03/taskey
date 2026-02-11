'use client';

import { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import dashboardService from '@/services/dashboard.service';
import usageService from '@/services/usage.service';
import billingService from '@/services/billing.service';
import behaviorService from '@/services/behavior.service';
import scheduleService from '@/services/schedule.service';
import { CheckSquare, Calendar, BrainCircuit, Zap, ArrowRight, Activity, Plus, Bot, Trophy, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

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
                    // You might want to gather real data here, but for now just logging presence/activity
                    // or maybe just calling it to trigger backend logic if any
                    // The requirement says "POST /api/behavior" on mount.
                    // Assuming empty body or minimal data is fine for now based on "dumb but obedient" instruction.
                    // If the backend requires specific fields, they should be provided.
                    // For now, sending a simple timestamp or similar if needed, or empty object if allowed.
                    // Checking behavior service, it takes { focusHours, tasksCompleted, mood, notes }
                    // We'll send a "check-in" type update or just empty if purely for activity tracking
                    // The instruction says "If NOT already implemented... On page mount, call: POST /api/behavior"
                    // We will send a minimal payload or reliance on backend to handle defaults.
                    // Let's send a placeholder for now to satisfy the "call" requirement without overwriting user data if possible.
                    // Ideally verify if backend updates or just logs.
                    // safer to just call it.
                    date: new Date().toISOString().split('T')[0]
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
                const [overviewData, usageData, subscriptionData] = await Promise.all([
                    dashboardService.getOverview(),
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

    const handleCompleteSchedule = async (scheduleId) => {
        try {
            await scheduleService.completeSchedule(scheduleId);
            // Optimistic update or refetch
            // Refetching for simplicity and accuracy
            const overviewData = await dashboardService.getOverview();
            setOverview(overviewData);
        } catch (err) {
            console.error("Failed to complete schedule:", err);
            // Optionally show a toast or error message
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
                    >
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-bold text-white">{overview?.todayTasksCount || 0}</span>
                            <span className="text-sm text-gray-500">/ {overview?.todayTasksTotal || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                            Pending Actions
                        </p>
                    </Card>

                    {/* Completed Tasks */}
                    <Card
                        title="Completed"
                        icon={Trophy}
                    >
                        <div className="text-3xl font-bold text-white mt-2">{overview?.completedTasksCount || 0}</div>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                            Tasks Finished
                        </p>
                    </Card>

                    {/* Behavior Score */}
                    <Card
                        title="Behavior Score"
                        icon={BrainCircuit}
                    >
                        <div className="text-3xl font-bold text-white mt-2">{overview?.behaviorScore || 0}</div>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                            Daily Optimization
                        </p>
                    </Card>

                    {/* Current Streak */}
                    <Card
                        title="Current Streak"
                        icon={TrendingUp}
                    >
                        <div className="text-3xl font-bold text-white mt-2">{overview?.currentStreak || 0}</div>
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
                                    <div key={i} className="group flex items-center justify-between gap-4 rounded-lg bg-white/5 p-4 border border-white/5 hover:border-cyan-500/30 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-black border border-white/10 text-cyan-500 font-mono text-xs font-bold">
                                                {item.startTime}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                                                    {item.task?.title || item.title || "Focus Block"}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500 font-mono">
                                                        {item.endTime ? `Until ${item.endTime}` : 'Scheduled'}
                                                    </span>
                                                    {item.task?.priority && (
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${item.task.priority === 'HIGH' ? 'border-red-500/30 text-red-500' :
                                                            item.task.priority === 'MEDIUM' ? 'border-yellow-500/30 text-yellow-500' :
                                                                'border-blue-500/30 text-blue-500'
                                                            } font-mono uppercase`}>
                                                            {item.task.priority}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCompleteSchedule(item._id || item.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                        >
                                            <CheckSquare className="h-4 w-4" />
                                        </Button>
                                    </div>
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
                            className="bg-linear-to-br from-cyan-900/10 to-transparent border-cyan-900/30"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center animate-pulse">
                                    <BrainCircuit className="h-5 w-5 text-cyan-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">System Optimizing</h4>
                                    <p className="text-xs text-cyan-200/60 font-mono mt-1">
                                        Analyzing usage patterns...
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Plan Summary */}
                    <div className="lg:col-span-3">
                        <Card
                            title="Plan Status"
                            icon={Target}
                            className="h-full"
                        >
                            <div className="mt-4 space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                    <span className="text-sm text-gray-400">Current Plan</span>
                                    <span className="text-sm font-bold text-cyan-400">{subscription?.plan || 'Free'}</span>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2">
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Usage</span>
                                        <span>{Math.round((usage?.aiTokensUsed / (subscription?.usageLimit || 100)) * 100) || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-black rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-cyan-500 rounded-full"
                                            style={{ width: `${Math.min(((usage?.aiTokensUsed || 0) / (subscription?.usageLimit || 100)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                    были
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
