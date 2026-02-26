"use client";
import StatCard from "@/app/(dashboard)/_components/StatCard"
import { useTodayDashboard } from "../useTodayDashboard"
import Skeleton from "@/components/ui/Skeleton"

export default function TodayDashboard() {
    const { data, loading, error, refresh } = useTodayDashboard()

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/4" />
                <div className="grid md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-md" />
                    ))}
                </div>
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

    const stats = data?.stats || { total: 0, completed: 0, pending: 0, missed: 0 }
    const timeline = data?.timeline || []

    return (
        <>
            <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--heading)" }}>
                Today
            </h1>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total" value={stats.total} />
                <StatCard label="Completed" value={stats.completed} />
                <StatCard label="Pending" value={stats.pending} />
                <StatCard label="Missed" value={stats.missed} />
            </div>

            <div className="space-y-4">
                {timeline.length === 0 && <p className="opacity-70">No tasks or schedules for today.</p>}
                {timeline.map((item, i) => (
                    <div
                        key={i}
                        className="border rounded-md p-4"
                        style={{ borderColor: "var(--border)" }}
                    >
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm opacity-70">
                            {item.type === "SCHEDULED"
                                ? `${item.startTime} - ${item.endTime}`
                                : "No scheduled time"}
                        </p>
                        <p>Status: <strong>{item.status}</strong></p>
                    </div>
                ))}
            </div>
        </>
    )
}
