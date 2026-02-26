"use client";
import { useStreaks } from "../useStreaks"
import Skeleton from "@/components/ui/Skeleton"

export default function StreaksDashboard() {
    const { data, loading, error } = useStreaks()

    if (loading) return <Skeleton className="h-32 w-full rounded-md" />
    if (error) return <div className="text-red-500">Error: {error}</div>

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
