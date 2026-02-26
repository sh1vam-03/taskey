import { useState, useEffect, useCallback } from "react"
import { fetchDashboardOverview } from "./dashboard.actions"

export const useDashboard = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const result = await fetchDashboardOverview()
            setData(result)
            setError(null)
        } catch (err) {
            setError(err.message || "Failed to load dashboard data")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    return {
        data,
        loading,
        error,
        refresh: loadData
    }
}
