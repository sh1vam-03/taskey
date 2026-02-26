import { useState, useEffect, useCallback } from "react"
import { fetchWeeklyDashboard } from "./dashboard.actions"

export const useWeeklyDashboard = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const result = await fetchWeeklyDashboard()
            setData(result)
            setError(null)
        } catch (err) {
            setError(err.message || "Failed to load weekly data")
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
