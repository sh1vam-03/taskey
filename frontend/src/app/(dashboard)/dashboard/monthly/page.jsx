"use client";
import React, { useEffect, useState } from "react";
import dashboardService from "@/services/dashboard.service";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import { FaCalendar } from "react-icons/fa";

export default function MonthlyDashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await dashboardService.getMonthly();
                setData(result);
            } catch (err) {
                console.error("Monthly fetch error:", err);
                setError("Failed to load monthly dashboard");
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

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-white mb-6">Monthly Plan</h1>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-64 bg-zinc-900/50 rounded-xl"></div>
                </div>
            ) : (
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8 text-center">
                    <FaCalendar className="mx-auto text-4xl mb-4 text-cyan-500/50" />
                    <h2 className="text-lg font-bold text-white mb-2">Monthly Overview</h2>
                    <p className="text-gray-400 text-sm">
                        High-level monthly stats and planning tools will appear here.
                    </p>
                    {/* Render data if available */}
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                        <div className="p-4 bg-black/40 rounded-lg">
                            <h3 className="text-gray-500 text-xs uppercase">Total Tasks</h3>
                            <p className="text-2xl font-bold text-white">{data?.stats?.total ?? 0}</p>
                        </div>
                        <div className="p-4 bg-black/40 rounded-lg">
                            <h3 className="text-gray-500 text-xs uppercase">Completed</h3>
                            <p className="text-2xl font-bold text-cyan-400">{data?.stats?.completed ?? 0}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
