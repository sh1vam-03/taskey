"use client";
import { useEffect, useState } from "react"
import StatCard from "../_components/StatCard"
import dashboardService from "@/services/dashboard.services"

export default function DashboardToday() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const result = await dashboardService.getTodayDashboard()
                setData(result)
            } catch (err: any) {
                setError(err.message || 'Failed to load today data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>
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
                {timeline.map((item: any, i: number) => (
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
