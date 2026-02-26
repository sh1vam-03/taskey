import { useState, useEffect, useCallback } from "react"
import { fetchMonthlyDashboard } from "./dashboard.actions"

export const useMonthlyDashboard = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const result = await fetchMonthlyDashboard()
            setData(result)
            setError(null)
        } catch (err) {
            setError(err.message || "Failed to load monthly data")
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
