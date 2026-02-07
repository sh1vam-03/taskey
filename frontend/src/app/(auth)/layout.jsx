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
                    <div className="inline-flex items-center gap-3 border border-white/10 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full mb-4">
                        <div className="w-2 h-2 bg-cyan-500 rounded-sm animate-pulse" />
                        <span className="text-sm tracking-widest text-cyan-500">TASKEY_INTELLIGENCE</span>
                    </div>

                    <h1 className="text-5xl xl:text-7xl font-bold tracking-tighter text-white drop-shadow-2xl">
                        THINKING<br />PARTNER
                    </h1>

                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto border-l-2 border-cyan-500/50 pl-4 py-1 text-left">
                        Advanced cognitive protocols for automated agency.<br />
                        Status: <span className="text-cyan-400 font-bold">OPTIMAL</span>
                    </p>

                    {/* Decorative Data Grid */}
                    <div className="grid grid-cols-2 gap-8 text-[10px] text-gray-500 uppercase tracking-widest mt-12 pt-8 border-t border-white/10">
                        <div className="text-center">
                            <div className="mb-1">System_Load</div>
                            <div className="text-white text-2xl font-bold font-mono">12%</div>
                        </div>
                        <div className="text-center">
                            <div className="mb-1">Active_Nodes</div>
                            <div className="text-white text-2xl font-bold font-mono flex items-center justify-center gap-2">
                                4,096
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tech Decorator Bottom */}
                <div className="absolute bottom-8 left-8 text-[10px] text-gray-600 font-mono">
                    // NEURAL_INTERFACE_V2.0
                </div>
            </div>

            {/* RIGHT PANEL: TERMINAL (Auth Form) */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-[var(--container-padding)] relative z-10 bg-black/80 backdrop-blur-md">

                {/* Back Link */}
                <div className="absolute top-8 left-8 z-20">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-cyan-400 transition-colors uppercase tracking-widest group"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Return_Home
                    </Link>
                </div>

                {/* Form Container */}
                <div className="w-full max-w-md relative z-10">
                    {/* Header for Form */}
                    <div className="mb-12 text-center lg:text-left">
                        <div className="w-12 h-1 bg-cyan-500 mb-6 lg:ml-0 mx-auto" />
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Initialize Session</h2>
                        <p className="text-gray-500 text-sm">Enter credentials to access the grid.</p>
                    </div>

                    {/* The Form Itself (Children) */}
                    <div className="relative">
                        {children}
                    </div>

                    {/* Bottom Status */}
                    <div className="mt-12 flex items-center justify-between text-[10px] text-gray-700 uppercase tracking-widest border-t border-white/10 pt-6">
                        <span>Encrypted_Connection</span>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-900 rounded-full" />
                            <span>Secure_01</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
