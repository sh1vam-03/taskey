"use client";
import { useEffect, useState } from "react"
import dashboardService from "@/services/dashboard.services"

export default function DashboardStreaks() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await dashboardService.getStreakOverview()
                setData(result)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--heading)" }}>Streak Overview</h1>
            <div className="border p-4 rounded-md">
                <p>Current Streak: {data?.currentStreak} days</p>
                <p>Longest Streak: {data?.longestStreak} days</p>
            </div>
        </div>
    )
}
