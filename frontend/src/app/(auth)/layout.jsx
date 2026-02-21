"use client";
import React, { useState, useEffect } from "react";
import AiEnergySphere from "@/components/ui/AiEnergySphere";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function AuthLayout({
    children,
}) {
    // 🔹 RESPONSIVE ORB SIZING
    const [orbSize, setOrbSize] = useState(1000);

    useEffect(() => {
        const updateSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            // Base size on width, but cap it for smaller screens
            let newSize = Math.min(1000, Math.max(600, width * 0.6));

            // Height Constraint for Laptops (1366x768) and smaller
            if (height < 800) {
                newSize = Math.min(newSize, 700);
            }
            setOrbSize(newSize);
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    return (
        <div className="min-h-screen w-full flex bg-black font-mono text-white overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-500">

            {/* COMMON ATMOSPHERE LAYER (Visual Cortex) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Global Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-70" />

                {/* ONE CENTRAL SPHERE (Scaling larger to cover both sides) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60">
                    <AiEnergySphere size={orbSize} speed={0.2} particleCount={800} baseRadius={orbSize * 0.35} waveStrength={150} />
                </div>
            </div>

            {/* LEFT PANEL: CONTENT (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center border-r border-white/10 bg-black/40 backdrop-blur-sm z-10">
                {/* Content Overlay */}
                <div className="relative z-10 text-center space-y-8 max-w-lg px-8">
                    {/* Logo/Identity */}
                    <h1 className="text-5xl xl:text-7xl font-bold tracking-tighter text-white drop-shadow-2xl">
                        TASKTIME
                    </h1>

                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto border-l-2 border-cyan-500/50 pl-4 py-1 text-left">
                        Plan Smarter. Work Faster.<br />
                        Powered by <span className="text-cyan-400 font-bold">AI</span>.
                    </p>

                </div>
            </div>

            {/* RIGHT PANEL: AUTH FORM */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-[var(--container-padding)] relative z-10 bg-black/80 backdrop-blur-md">

                {/* Back Link */}
                <div className="absolute top-8 left-8 z-20">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-cyan-400 transition-colors uppercase tracking-widest group"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Return Home
                    </Link>
                </div>

                {/* Form Container */}
                <div className="w-full max-w-md relative z-10">
                    {/* The Form Itself (Children) */}
                    <div className="relative">
                        {children}
                    </div>

                </div>
            </div>

        </div>
    )
}
