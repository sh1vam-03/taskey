"use client";
import React, { useEffect, useState } from "react";
import dashboardService from "@/services/dashboard.service";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import { FaCalendarAlt } from "react-icons/fa";

export default function WeeklyDashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await dashboardService.getWeekly();
                setData(result);
            } catch (err) {
                console.error("Weekly fetch error:", err);
                setError("Failed to load weekly dashboard");
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

    // Backend likely returns: { weekData: [ { date, day, count, completed } ], stats: {...} }
    // Or similar structure based on controller.

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-white mb-6">Weekly Overview</h1>

            {loading ? (
                <SkeletonLoader type="card" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {/* Placeholder for weekly columns if data structure allows */}
                    {(data?.weekStats || []).map((day, idx) => (
                        <div key={idx} className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl flex flex-col items-center">
                            <span className="text-xs font-mono text-gray-500 uppercase">{day.date}</span>
                            <span className="text-xl font-bold text-white my-2">{day.count || 0}</span>
                            <span className="text-[10px] text-cyan-400">Tasks</span>
                        </div>
                    ))}
                    {(!data?.weekStats || data.weekStats.length === 0) && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            <FaCalendarAlt className="mx-auto text-4xl mb-4 opacity-20" />
                            No weekly data available yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
