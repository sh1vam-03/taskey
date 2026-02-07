"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AiEnergySphere from "@/components/ui/AiEnergySphere";
import { BentoGrid, BentoGridItem } from "@/components/ui/BentoGrid";
import Button from "@/components/ui/Button";
import InteractivePricing from "@/components/landing/InteractivePricing";
import HowItWorks from "@/components/landing/HowItWorks";
import DetailedFeatures from "@/components/landing/DetailedFeatures";
import CallToAction from "@/components/landing/CallToAction";
import { motion } from "framer-motion";
import { FaBrain, FaCalendarAlt, FaShieldAlt, FaSync } from "react-icons/fa";
import { MdSmartToy, MdPsychology } from "react-icons/md";

export default function Home() {
    // 🔹 RESPONSIVE ORB SIZING
    const [orbSize, setOrbSize] = useState(1000); // Default desktop

    useEffect(() => {
        const updateSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            // Clamp Logic: 600px -> 1000px based on width
            // On standard laptop (1366), width*0.6 = ~820px.
            let newSize = Math.min(1000, Math.max(600, width * 0.6));

            // Height Constraint for Laptops (short screens)
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
        <main className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-500">
            {/* Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6">
                <Navbar />
            </div>

            {/* HERO SECTION with Neural Interface HUD */}
            {/* 🔹 RESPONSIVE HEIGHT: min-h-screen but capped at 1080px for large displays, flexible padding */}
            {/* Short screens (laptops): Reduced padding to fit content. */}
            <section className="relative min-h-dvh lg:min-h-screen max-h-[1080px] flex flex-col items-center justify-center pt-32 pb-20 lg:py-32 [@media(max-height:800px)]:pt-24 [@media(max-height:800px)]:pb-12 px-4 border-b border-white/5 overflow-hidden transition-all duration-300">

                {/* HUD Decorators */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none overflow-hidden">
                    {/* Vertical Lines */}
                    <div className="absolute top-0 bottom-0 left-[10%] w-px bg-white/5" />
                    <div className="absolute top-0 bottom-0 right-[10%] w-px bg-white/5" />

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

                    {/* Top Coordinates */}
                    <div className="absolute top-32 left-[12%] font-mono text-[10px] text-gray-500 hidden sm:block">
                        COORDS: 45.92, -12.04
                    </div>
                    <div className="absolute top-32 right-[12%] font-mono text-[10px] text-cyan-900/50 hidden sm:flex items-center gap-2">
                        <span className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                        SYSTEM_ONLINE
                    </div>
                </div>

                {/* Orb Container - BACKGROUND */}
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-60 md:opacity-100 transition-opacity duration-500">
                    <AiEnergySphere size={orbSize} particleCount={1200} baseRadius={orbSize * 0.25} hoverRadius={100} />
                </div>

                <div className="relative z-20 text-center max-w-4xl mx-auto space-y-6 lg:space-y-8 mt-12 lg:mt-0">
                    {/* Label commented out in original, kept commented */}

                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-[linear-gradient(to_bottom,white_40%,rgba(255,255,255,0.5)_100%)]">
                        Your AI Thinking Partner.
                    </h1>

                    <p className="text-lg sm:text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed px-4">
                        Taskey orchestrates your life with <span className="text-white font-medium">adaptive intelligence</span>.
                        No friction. Just flow.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 lg:pt-8 w-full max-w-xs sm:max-w-none mx-auto">
                        <Link href="/signup" className="w-full sm:w-auto">
                            <Button variant="scanline" size="lg" className="w-full sm:w-auto">
                                INITIALIZE_SYSTEM
                            </Button>
                        </Link>
                        <Link href="#how-it-works" className="w-full sm:w-auto">
                            <Button variant="ghost" size="lg" className="text-gray-500 hover:text-white w-full sm:w-auto">
                                // VIEW_SCHEMATICS
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* SECTIONS */}

            {/* 1. BENTO GRID (Restored) */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="mb-20 flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-8">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-white">
                            Neural Nodes
                        </h2>
                        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                            // System Intelligence v1.0
                        </p>
                    </div>
                </div>

                <BentoGrid>
                    <BentoGridItem
                        title="Neural Engine"
                        description="Advanced decision matrices that adapt to your working style in real-time."
                        header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800" />}
                        icon={<FaBrain />}
                        className="md:col-span-2"
                    />
                    <BentoGridItem
                        title="Quantum Sync"
                        description="Instant state synchronization across all connected neural nodes."
                        header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800" />}
                        icon={<FaSync />}
                        className="md:col-span-1"
                    />
                    <BentoGridItem
                        title="Privacy Core"
                        description="Local-first processing ensuring your data never leaves the secure enclave."
                        header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800" />}
                        icon={<FaShieldAlt />}
                        className="md:col-span-1"
                    />
                    <BentoGridItem
                        title="Decision Velocity"
                        description="Reduce cognitive load with automated micro-decisions and routing."
                        header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800" />}
                        icon={<MdSmartToy />}
                        className="md:col-span-2"
                    />
                </BentoGrid>
            </section>

            <DetailedFeatures />
            <InteractivePricing />
            <HowItWorks />
            <CallToAction />

            <Footer />
        </main>
    );
}
