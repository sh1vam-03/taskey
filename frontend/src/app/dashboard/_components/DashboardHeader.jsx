"use client";
import React from 'react';

const DashboardHeader = () => {
    return (
        <header className="border-b h-16 flex items-center px-6 sticky top-0 bg-background z-10" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
            <div className="flex-1">
                <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
                {/* Placeholder for future header items like user profile or search */}
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            </div>
        </header>
    )
}

export default DashboardHeader
