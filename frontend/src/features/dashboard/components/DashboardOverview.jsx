"use client";
import StatCard from "@/app/(dashboard)/_components/StatCard"
import { useDashboard } from "../useDashboard"
import Skeleton from "@/components/ui/Skeleton"

export default function DashboardOverview() {
    const { data, loading, error, refresh } = useDashboard()

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <div className="grid md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-40 w-full" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
                <p><strong>Error:</strong> {error}</p>
                <button
                    onClick={refresh}
                    className="mt-2 text-sm underline hover:text-red-800"
                >
                    Try Again
                </button>
            </div>
        )
    }

    const today = data?.today || { totalTasks: 0, completedTasks: 0, pendingTasks: 0, missedTasks: 0 }
    const streaks = data?.streaks || { currentStreak: 0, longestStreak: 0 }

    return (
        <>
            <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--heading)" }}>
                Overview
            </h1>

            <div className="grid md:grid-cols-4 gap-4 mb-10">
                <StatCard label="Total Tasks" value={today.totalTasks} />
                <StatCard label="Completed" value={today.completedTasks} />
                <StatCard label="Pending" value={today.pendingTasks} />
                <StatCard label="Missed" value={today.missedTasks} />
            </div>

            <div
                className="border rounded-md p-6"
                style={{ borderColor: "var(--border)" }}
            >
                <p className="text-lg font-medium mb-2">🔥 Streaks</p>
                <p>Current Streak: <strong>{streaks.currentStreak} days</strong></p>
                <p>Longest Streak: <strong>{streaks.longestStreak} days</strong></p>
            </div>
        </>
    )
}
