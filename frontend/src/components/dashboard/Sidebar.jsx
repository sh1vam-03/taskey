"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTerminal, FaTasks, FaCalendarAlt, FaRobot, FaSignOutAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const navItems = [
    { name: "Overview", icon: FaTerminal, path: "/dashboard" },
    { name: "My Tasks", icon: FaTasks, path: "/dashboard/tasks" },
    { name: "Schedule", icon: FaCalendarAlt, path: "/dashboard/schedule" },
    { name: "AI Console", icon: FaRobot, path: "/dashboard/ai" },
];

import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-white/10 hidden md:flex flex-col z-50">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <div className="flex items-center gap-2 text-cyan-400">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-mono font-bold tracking-wider text-lg">TASKEY_OS</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${isActive
                                ? "text-cyan-400 bg-cyan-950/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-gray-500 group-hover:text-white"}`} />
                            {item.name}

                            {/* Active Indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute left-0 w-1 h-6 bg-cyan-400 rounded-r-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User / Footer */}
            <div className="mt-auto p-4 border-t border-white/5">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/20 transition-all duration-200 group cursor-pointer"
                >
                    <FaSignOutAlt className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium font-mono">TERMINATE_SESSION</span>
                </button>
                <div className="mt-4 px-4 text-[10px] text-gray-600 font-mono text-center opacity-50">
                    Output: v0.9.2-beta
                </div>
            </div>
        </aside>
    );
}
