'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import dashboardService from '@/services/dashboard.service';
import usageService from '@/services/usage.service';
import { CheckSquare, Calendar, BrainCircuit, Zap, ArrowRight, Activity, Plus, Bot } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function DashboardOverview() {
    const { user } = useAuth();
    const [overview, setOverview] = useState(null);
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [overviewData, usageData] = await Promise.all([
                    dashboardService.getOverview(),
                    usageService.getMyUsage()
                ]);
                setOverview(overviewData);
                setUsage(usageData);
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

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-40 rounded-xl bg-white/5 animate-pulse border border-white/10" />
                ))}
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
                {/* AI Credits */}
                <Card
                    title="Neural Tokens"
                    icon={Zap}
                >
                    <div className="text-3xl font-bold text-white mt-2">{user?.aiCreditBalance || 0}</div>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                        Available Capacity
                    </p>
                </Card>

                {/* Tasks */}
                <Card
                    title="Active Tasks"
                    icon={CheckSquare}
                >
                    <div className="text-3xl font-bold text-white mt-2">{usage?.taskCount || 0}</div>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                        Tasks in Queue
                    </p>
                </Card>

                {/* Schedules */}
                <Card
                    title="Schedules"
                    icon={Calendar}
                >
                    <div className="text-3xl font-bold text-white mt-2">{usage?.scheduleCount || 0}</div>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                        Planned Blocks
                    </p>
                </Card>

                {/* Behaviors */}
                <Card
                    title="Behavior Logs"
                    icon={BrainCircuit}
                >
                    <div className="text-3xl font-bold text-white mt-2">{usage?.behaviorCount || 0}</div>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                        Pattern Analysis
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
                                <div key={i} className="group flex items-start gap-4 rounded-lg bg-white/5 p-4 border border-white/5 hover:border-cyan-500/30 transition-colors">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-black border border-white/10 text-cyan-500 font-mono text-xs font-bold">
                                        {item.startTime}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                                            {item.task?.title || "Focus Block"}
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
            </div>
        </div>
    );
}
