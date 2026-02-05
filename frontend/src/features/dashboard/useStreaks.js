import { useState, useEffect, useCallback } from "react"
import { fetchStreakOverview } from "./dashboard.actions"

export const useStreaks = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const result = await fetchStreakOverview()
            setData(result)
            setError(null)
        } catch (err) {
            setError(err.message || "Failed to load streak data")
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
