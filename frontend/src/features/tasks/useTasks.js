import { useState, useEffect, useCallback } from "react"
import { fetchTasks } from "./tasks.actions"

export const useTasks = () => {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const loadTasks = useCallback(async () => {
        try {
            setLoading(true)
            const data = await fetchTasks()
            setTasks(data || [])
            setError(null)
        } catch (err) {
            setError(err.message || "Failed to load tasks")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadTasks()
    }, [loadTasks])

    return {
        tasks,
        loading,
        error,
        refresh: loadTasks
    }
}
