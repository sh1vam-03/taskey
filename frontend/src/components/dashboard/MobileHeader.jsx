"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes, FaTerminal, FaTasks, FaCalendarAlt, FaRobot } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { name: "Overview", icon: FaTerminal, path: "/dashboard" },
    { name: "My Tasks", icon: FaTasks, path: "/dashboard/tasks" },
    { name: "Schedule", icon: FaCalendarAlt, path: "/dashboard/schedule" },
    { name: "AI Console", icon: FaRobot, path: "/dashboard/ai" },
];

export default function MobileHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="md:hidden">
            {/* Top Bar */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-white/10 z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-2 text-cyan-400">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-mono font-bold tracking-wider">TASKEY</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-gray-400 hover:text-white"
                >
                    {isOpen ? <FaTimes /> : <FaBars />}
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 top-16 bg-black z-40 p-4"
                    >
                        <nav className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-4 rounded-lg text-sm font-medium border border-transparent ${isActive
                                                ? "text-cyan-400 bg-cyan-950/20 border-cyan-900/50"
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <item.icon className={isActive ? "text-cyan-400" : "text-gray-500"} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="mt-8 pt-8 border-t border-white/10 text-center text-xs text-gray-600 font-mono">
                            SYSTEM ONLINE
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spacer for fixed header */}
            <div className="h-16" />
        </div>
    );
}
