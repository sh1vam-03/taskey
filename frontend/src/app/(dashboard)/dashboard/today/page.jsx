"use client";
import React, { useEffect, useState } from "react";
import dashboardService from "@/services/dashboard.service";
import StatCard from "@/components/dashboard/StatCard";
import TaskList from "@/components/dashboard/TaskList";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import { FaCheckCircle, FaClock, FaList } from "react-icons/fa";

export default function TodayDashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await dashboardService.getToday();
                setData(result);
            } catch (err) {
                console.error("Today fetch error:", err);
                setError("Failed to load daily dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (error) {
        return (
            <div className="p-8 text-center text-red-400 bg-red-950/20 rounded-xl border border-red-900/50">
                <p>System Error: {error}</p>
            </div>
        );
    }

    // Process Timeline
    // Backend returns: { timeline: [...], stats: {...} }
    const timelineItems = (data?.timeline || []).map(item => ({
        id: item.id || item.taskId || item.scheduleId,
        title: item.title,
        priority: item.priority || 'MEDIUM',
        status: item.status, // COMPLETED, MISSED, PENDING
        type: item.type, // TASK or SCHEDULED
        time: item.startTime ? `${item.startTime.slice(0, 5)} - ${item.endTime?.slice(0, 5)}` : 'All Day',
        category: item.type === 'SCHEDULED' ? 'SCHEDULED' : 'TASK'
    }));

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-white mb-6">Today's Focus</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loading ? (
                    <>
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="card" />
                    </>
                ) : (
                    <>
                        <StatCard
                            label="Total Items"
                            value={data?.stats?.total ?? 0}
                            icon={FaList}
                        />
                        <StatCard
                            label="Completed"
                            value={data?.stats?.completed ?? 0}
                            icon={FaCheckCircle}
                            subtext={`${Math.round((data?.stats?.completed || 0) / (data?.stats?.total || 1) * 100)}%`}
                        />
                        <StatCard
                            label="Pending"
                            value={data?.stats?.pending ?? 0}
                            icon={FaClock}
                        />
                    </>
                )}
            </div>

            {/* Timeline */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6">
                <h2 className="text-lg font-mono font-bold text-cyan-400 mb-4 uppercase tracking-wider">Timeline</h2>
                {loading ? (
                    <SkeletonLoader type="list" />
                ) : (
                    <div className="space-y-4">
                        {timelineItems.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">No items scheduled for today.</p>
                        ) : (
                            timelineItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 bg-zinc-950/50 border border-white/5 rounded-lg hover:border-cyan-500/30 transition-colors">
                                    <div className="text-xs font-mono text-gray-500 w-24 shrink-0 text-right">
                                        {item.time}
                                    </div>
                                    <div className="grow">
                                        <h3 className={`text-sm font-medium ${item.status === 'COMPLETED' ? 'text-gray-500 line-through' : 'text-white'}`}>
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] uppercase font-bold text-cyan-500/70 border border-cyan-900/30 px-1.5 py-0.5 rounded">
                                                {item.type}
                                            </span>
                                            {item.status && (
                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${item.status === 'COMPLETED' ? 'text-green-500/70 border-green-900/30' :
                                                        item.status === 'MISSED' ? 'text-red-500/70 border-red-900/30' :
                                                            'text-yellow-500/70 border-yellow-900/30'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Action Buttons could go here */}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
