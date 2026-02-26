"use client";
import { useMonthlyDashboard } from "../useMonthlyDashboard"
import Skeleton from "@/components/ui/Skeleton"

export default function MonthlyDashboard() {
    const { data, loading, error } = useMonthlyDashboard()

    if (loading) return <Skeleton className="h-64 w-full rounded-md" />
    if (error) return <div className="text-red-500">Error: {error}</div>

    return (
        <>
            <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--heading)" }}>
                Monthly Dashboard
            </h1>
            <div className="border p-4 rounded-md">
                <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
            </div>
        </>
    )
}
