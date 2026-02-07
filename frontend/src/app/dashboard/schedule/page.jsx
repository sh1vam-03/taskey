"use client";
import React from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function SchedulePage() {
    // Placeholder for now, later we integrate the real schedule timeline component
    const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white font-mono">SCHEDULE</h1>
                    <p className="text-gray-500 text-sm">Time-blocked plan for today.</p>
                </div>
                <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-lg p-1">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded"><FaChevronLeft /></button>
                    <span className="text-sm font-mono px-2 text-gray-200">TODAY</span>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded"><FaChevronRight /></button>
                </div>
            </div>

            <div className="flex-1 bg-zinc-900/30 border border-white/5 rounded-xl overflow-y-auto relative backdrop-blur-sm">
                {/* Grid Lines */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-10"
                    style={{ backgroundImage: "linear-gradient(#444 1px, transparent 1px)", backgroundSize: "100% 60px" }}
                />

                <div className="p-4 space-y-[44px]"> {/* Approximate 60px height per hour minus padding adjustment */}
                    {hours.map(hour => (
                        <div key={hour} className="flex gap-4 group">
                            <span className="w-16 text-right text-xs text-gray-600 font-mono -mt-2 group-hover:text-cyan-500 transition-colors">
                                {hour}:00
                            </span>
                            <div className="flex-1 border-t border-white/5 relative">
                                {/* Example Event (Mock) */}
                                {hour === 9 && (
                                    <div className="absolute top-0 left-0 right-0 h-[110px] bg-cyan-900/20 border-l-2 border-cyan-500 p-2 rounded-r-md">
                                        <h4 className="text-xs font-bold text-cyan-100">Deep Work Session</h4>
                                        <p className="text-[10px] text-cyan-300/70">Project Alpha Planning</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
