"use client";
import { useEffect, useState } from "react"
import StatCard from "./_components/StatCard"
import dashboardService from "@/services/dashboard.services"

export default function DashboardOverview() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const result = await dashboardService.getOverview()
                setData(result)
            } catch (err: any) {
                setError(err.message || 'Failed to load dashboard data')
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
