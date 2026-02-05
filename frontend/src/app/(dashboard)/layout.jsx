"use client";
import Sidebar from "./_components/Sidebar"
import DashboardHeader from "./_components/DashboardHeader"

// Phase 2: Layout Ownership (Structure Only, No Auth yet)
export default function DashboardLayout({ children }) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <DashboardHeader />
                <main
                    className="flex-1 px-6 py-6"
                    style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
                >
                    {children}
                </main>
            </div>
        </div>
    )
}
