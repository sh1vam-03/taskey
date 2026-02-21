"use client";
import { useState, useEffect, useRef, useCallback } from "react";
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

// ─── Compute orb size outside React ─────────────────────────────────────────
function computeOrbSize() {
    if (typeof window === "undefined") return 900;
    const w = window.innerWidth;
    const h = window.innerHeight;
    let s = Math.min(1200, Math.max(600, w * 0.6));
    if (h < 800) s = Math.min(s, 700);
    return s;
}

const CONTAINER_CLASS =
    "w-full max-w-[var(--container-width)] mx-auto px-[var(--container-padding)]";

export default function Home() {
    const [orbSize, setOrbSize] = useState(900);
    const rafId = useRef(null);

    const handleResize = useCallback(() => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => setOrbSize(computeOrbSize()));
    }, []);

    useEffect(() => {
        setOrbSize(computeOrbSize());
        window.addEventListener("resize", handleResize, { passive: true });
        return () => {
            window.removeEventListener("resize", handleResize);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [handleResize]);

    return (
        <main className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-500">
            {/* Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6">
                <Navbar />
            </div>

            {/* ── HERO ─────────────────────────────────────────────────────────── */}
            <section className="relative min-h-[100dvh] max-h-[900px] flex flex-col items-center justify-center py-[var(--section-spacing)] border-b border-white/5 overflow-hidden">

                {/* HUD decorators */}
                <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
                    <div className="absolute top-0 bottom-0 left-[10%] w-px bg-gradient-to-b from-black via-cyan-500 to-black" />
                    <div className="absolute top-0 bottom-0 right-[10%] w-px bg-gradient-to-b from-black via-cyan-500 to-black" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
                </div>

                {/* Orb */}
                <div
                    className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-60 md:opacity-100"
                    style={{ willChange: "transform" }}
                    aria-hidden="true"
                >
                    <AiEnergySphere
                        size={orbSize}
                        particleCount={1200}
                        baseRadius={orbSize * 0.25}
                        hoverRadius={100}
                    />
                </div>

                {/* Hero copy */}
                <div className={`relative z-20 text-center space-y-6 lg:space-y-8 mt-12 lg:mt-0 ${CONTAINER_CLASS}`}>
                    <h1 className="text-[clamp(2.5rem,5vw,5rem)] font-bold tracking-tighter leading-[0.95] text-transparent bg-clip-text bg-[linear-gradient(to_bottom,white_40%,rgba(255,255,255,0.5)_100%)]">
                        Plan Smarter. Work Faster.
                        <br />
                        Powered by AI.
                    </h1>

                    <p className="text-[clamp(1rem,2vw,1.25rem)] text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
                        TASKTIME helps you{" "}
                        <span className="text-white font-medium">organize tasks, automate schedules,</span>{" "}
                        and stay focused every day with intelligent planning.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 lg:pt-8 w-full max-w-xs sm:max-w-none mx-auto">

                        {/*
                         * PRIMARY CTA
                         * variant="primary" → solid cyan fill, shimmer sweep, glow on hover.
                         * This is the highest-priority action — should always stand out most.
                         */}
                        <Link href="/signup" className="w-full sm:w-auto">
                            <Button variant="primary" size="lg" className="w-full sm:w-auto">
                                Get Started Free
                            </Button>
                        </Link>

                        {/*
                         * SECONDARY CTA
                         * variant="ghost" → no background, no border at rest.
                         * Appears lighter so it doesn't compete with the primary button.
                         * Do NOT override colors here — the component handles it correctly.
                         */}
                        <Link href="#how-it-works" className="w-full sm:w-auto">
                            <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                                See How It Works
                            </Button>
                        </Link>

                    </div>
                </div>
            </section>

            {/* ── SECTIONS ──────────────────────────────────────────────────────── */}
            <BentoGridSection />
            <DetailedFeatures />
            <InteractivePricing />
            <HowItWorks />
            <CallToAction />

            <Footer />
        </main>
    );
}