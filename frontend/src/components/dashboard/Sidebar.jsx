'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { dashboardNavigation } from '@/config/dashboard-navigation';



export default function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={toggleMobile}
                className="md:hidden fixed top-4 right-4 z-60 p-2 bg-black border border-white/10 rounded-md text-white"
            >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-white/10 flex flex-col
                transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo */}
                <div className="h-20 flex items-center px-8 border-b border-white/5">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-cyan-500 to-blue-600 animate-pulse" />
                        <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">
                            TASKTIME
                        </span>
                    </Link>
                </div>

                {/* Nav */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                    {dashboardNavigation.map((section) => (
                        <div key={section.section}>
                            <h3 className="px-4 text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                                {section.section}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={`
                                                relative group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                                ${isActive
                                                    ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/5'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }
                                            `}
                                        >
                                            <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-cyan-400'}`} />
                                            <span className="font-sans tracking-wide">{item.name}</span>

                                            {isActive && (
                                                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* User Info */}
                <div className="border-t border-white/5 p-4 m-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-xs font-mono text-white">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-white truncate">{user?.name}</span>
                            <span className="text-[10px] text-cyan-500 font-mono uppercase tracking-wider">
                                {user?.plan === 'PRO_PLUS' ? 'PRO_PLUS_ACCESS' : user?.plan === 'PRO' ? 'PRO_ACCESS' : 'FREE_TIER'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/20"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Disconnect
                    </button>
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
}
