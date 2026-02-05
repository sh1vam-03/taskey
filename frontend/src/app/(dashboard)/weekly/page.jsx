"use client";
import { useEffect, useState } from "react"
import dashboardService from "@/services/dashboard.services"

export default function DashboardWeekly() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const result = await dashboardService.getWeeklyDashboard()
                setData(result)
            } catch (err) {
                setError(err.message || 'Failed to load weekly data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <>
            <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--heading)" }}>
                Weekly Dashboard
            </h1>
            <div className="border p-4 rounded-md">
                <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
            </div>
        </>
    )
}
