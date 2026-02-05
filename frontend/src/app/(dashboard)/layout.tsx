"use client";
import Sidebar from "./_components/Sidebar"
import ProtectedRoute from "@/features/auth/components/ProtectedRoute"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="flex min-h-screen">
                <Sidebar />
                <main
                    className="flex-1 px-6 py-6"
                    style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
                >
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    )
}
