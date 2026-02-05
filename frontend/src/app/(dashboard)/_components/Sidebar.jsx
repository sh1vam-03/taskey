"use client";
import Link from "next/link"
import { usePathname } from "next/navigation"

const Sidebar = () => {
    const pathname = usePathname()

    const linkClass = (path, end = false) => {
        const isActive = end
            ? pathname === path
            : pathname.startsWith(path)

        return `block px-4 py-3 rounded-md transition ${isActive ? "font-semibold bg-gray-100 dark:bg-gray-800" : "opacity-70 hover:opacity-100 hover:bg-gray-50 dark:hover:bg-gray-900"
            }`
    }

    return (
        <aside
            className="w-64 border-r hidden md:block h-screen sticky top-0"
            style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
            }}
        >
            <div className="px-6 py-6">
                <h2 className="text-xl font-bold mb-8" style={{ color: "var(--heading)" }}>
                    Taskey
                </h2>

                <nav className="space-y-2">
                    <Link href="/dashboard" className={linkClass("/dashboard", true)}>
                        Overview
                    </Link>
                    <Link href="/dashboard/today" className={linkClass("/dashboard/today")}>
                        Today
                    </Link>
                    <Link href="/dashboard/weekly" className={linkClass("/dashboard/weekly")}>
                        Weekly
                    </Link>
                    <Link href="/dashboard/monthly" className={linkClass("/dashboard/monthly")}>
                        Monthly
                    </Link>
                    <Link href="/dashboard/streaks" className={linkClass("/dashboard/streaks")}>
                        Streaks
                    </Link>
                </nav>
            </div>
        </aside>
    )
}

export default Sidebar
