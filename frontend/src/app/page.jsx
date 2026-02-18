"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AiEnergySphere from "@/components/ui/AiEnergySphere";
import Button from "@/components/ui/Button";
import BentoGridSection from "@/components/landing/BentoGridSection";
import InteractivePricing from "@/components/landing/InteractivePricing";
import HowItWorks from "@/components/landing/HowItWorks";
import DetailedFeatures from "@/components/landing/DetailedFeatures";
import CallToAction from "@/components/landing/CallToAction";
import { motion } from "framer-motion";

export default function Home() {
    // 🔹 RESPONSIVE ORB SIZING
    const [orbSize, setOrbSize] = useState(1400); // Default desktop

    useEffect(() => {
        const updateSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            // Base size on width, but cap it for smaller screens
            let newSize = Math.min(1200, Math.max(600, width * 0.6));

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

    const CONTAINER_CLASS = "w-full max-w-[var(--container-width)] mx-auto px-[var(--container-padding)]";

    return (
        <main className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-500">
            {/* Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6">
                <Navbar />
            </div>

            {/* HERO SECTION with Neural Interface HUD */}
            {/* Height: Fits 1366x768 without scrolling. vertical rhythm: var(--section-spacing) */}
            <section className="relative min-h-[100dvh] max-h-[900px] flex flex-col items-center justify-center py-[var(--section-spacing)] border-b border-white/5 overflow-hidden transition-all duration-300">

                {/* HUD Decorators */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none overflow-hidden">
                    {/* Vertical Lines */}
                    <div className="absolute top-0 bottom-0 left-[10%] w-px bg-gradient-to-b from-black via-cyan-500 to-black" />
                    <div className="absolute top-0 bottom-0 right-[10%] w-px bg-gradient-to-b from-black via-cyan-500 to-black" />

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
                </div>

                {/* Orb Container - BACKGROUND */}
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-60 md:opacity-100 transition-opacity duration-500">
                    <AiEnergySphere size={orbSize} particleCount={1200} baseRadius={orbSize * 0.25} hoverRadius={100} />
                </div>

                <div className={`relative z-20 text-center space-y-6 lg:space-y-8 mt-12 lg:mt-0 ${CONTAINER_CLASS}`}>

                    <h1 className="text-[clamp(2.5rem,5vw,5rem)] font-bold tracking-tighter leading-[0.95] text-transparent bg-clip-text bg-[linear-gradient(to_bottom,white_40%,rgba(255,255,255,0.5)_100%)]">
                        Plan Smarter. Work Faster.
                        <br />
                        Powered by AI.
                    </h1>

                    <p className="text-[clamp(1rem,2vw,1.25rem)] text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
                        TASKTIME helps you <span className="text-white font-medium">organize tasks, automate schedules,</span>.
                        and stay focused every day with intelligent planning.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 lg:pt-8 w-full max-w-xs sm:max-w-none mx-auto">
                        <Link href="/signup" className="w-full sm:w-auto">
                            <Button variant="scanline" size="lg" className="w-full sm:w-auto">
                                Get Started Free
                            </Button>
                        </Link>
                        <Link href="#how-it-works" className="w-full sm:w-auto">
                            <Button variant="ghost" size="lg" className="text-gray-500 hover:text-white w-full sm:w-auto">
                                See How It Works
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* SECTIONS */}

            {/* SECTIONS */}

            <BentoGridSection />
            <DetailedFeatures />
            <InteractivePricing />
            <HowItWorks />
            <CallToAction />

            <Footer />
        </main>
    );
}
