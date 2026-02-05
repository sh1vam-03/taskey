"use client";
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "./_components/Sidebar"
import DashboardHeader from "./_components/DashboardHeader"
import { useAuth } from "@/features/auth/context/AuthContext"
import Spinner from "@/components/ui/Spinner"

export default function DashboardLayout({ children }) {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login")
        }
    }, [loading, isAuthenticated, router])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Spinner size="lg" />
            </div>
        )
    }

    if (!isAuthenticated) return null // Will redirect

    return (
        <div className="flex min-h-screen bg-[var(--secondary)]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <DashboardHeader />
                <main
                    className="flex-1 px-8 py-8 overflow-y-auto"
                    style={{ backgroundColor: "var(--bg)", borderRadius: "var(--radius-lg) 0 0 0" }}
                >
                    <div className="max-w-6xl mx-auto animate-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
