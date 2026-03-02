"use client";
import React, { useEffect } from "react";
import AiEnergySphere from "@/components/ui/AiEnergySphere";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthLayout({
    children,
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect if already logged in
        if (!loading && user) {
            router.replace('/dashboard');
        }
    }, [user, loading, router]);



    // Gate: Show loading spinner while auth state is being determined
    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
        );
    }

    // If user is already logged in, don't render auth pages at all
    if (user) {
        return null;
    }

    return (
        <div className="min-h-screen w-full flex bg-black font-mono text-white overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-500">

            {/* COMMON ATMOSPHERE LAYER (Visual Cortex) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Global Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-70" />

                {/* ONE CENTRAL SPHERE (Scaling larger to cover both sides) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60">
                    <AiEnergySphere size={800} speed={0.2} particleCount={600} baseRadius={280} waveStrength={150} />
                </div>
            </div>

            {/* LEFT PANEL: CONTENT (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center bg-black/20 z-10">
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

            {/* HUD DIVIDER (Desktop Only) */}
            <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none" aria-hidden="true">
                <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-black via-cyan-500 to-black" />
            </div>

            {/* RIGHT PANEL: AUTH FORM */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 py-16 md:p-[var(--container-padding)] relative z-10 bg-black/60 backdrop-blur-sm min-h-screen">

                {/* Back Link */}
                <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
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
