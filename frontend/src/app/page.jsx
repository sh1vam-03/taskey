"use client";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AiEnergySphere from "@/components/ui/AiEnergySphere";
import { BentoGrid, BentoGridItem } from "@/components/ui/BentoGrid";
import Button from "@/components/ui/Button";
import InteractivePricing from "@/components/landing/InteractivePricing";
import HowItWorks from "@/components/landing/HowItWorks";
import DetailedFeatures from "@/components/landing/DetailedFeatures";
import { motion } from "framer-motion";
import { FaBrain, FaCalendarAlt, FaShieldAlt } from "react-icons/fa";
import { MdSmartToy, MdPsychology } from "react-icons/md";

export default function Home() {
    return (
        <main className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-500">
            {/* Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6">
                <Navbar />
            </div>

            {/* HERO SECTION with Neural Interface HUD */}
            <section className="relative min-h-screen flex flex-col items-center justify-center py-32 px-4 border-b border-white/5">

                {/* HUD Decorators */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none overflow-hidden">
                    {/* Vertical Lines */}
                    <div className="absolute top-0 bottom-0 left-[10%] w-px bg-white/5" />
                    <div className="absolute top-0 bottom-0 right-[10%] w-px bg-white/5" />

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

                    {/* Top Coordinates */}
                    <div className="absolute top-32 left-[12%] font-mono text-[10px] text-gray-500">
                        COORDS: 45.92, -12.04
                    </div>
                    <div className="absolute top-32 right-[12%] font-mono text-[10px] text-cyan-900/50 flex items-center gap-2">
                        <span className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                        SYSTEM_ONLINE
                    </div>
                </div>

                {/* Orb Container */}
                <div className="relative z-10 mb-12 scale-90 md:scale-110 mt-10">
                    <AiEnergySphere size={600} speed={0.5} particleCount={350} />

                    {/* Orb Surround Data */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 border-dashed animate-spin-slow pointer-events-none opacity-30" style={{ animationDuration: '60s' }} />
                </div>

                <div className="relative z-20 text-center max-w-4xl mx-auto space-y-8">
                    {/* Label */}
                    <div className="inline-block border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full mb-4">
                        <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest">
                            ● NEURAL_ARCHITECTURE_V1
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-[linear-gradient(to_bottom,white_40%,rgba(255,255,255,0.5)_100%)]">
                        Your AI Thinking Partner.
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
                        Taskey orchestrates your life with <span className="text-white font-medium">adaptive intelligence</span>.
                        No friction. Just flow.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
                        <Link href="/signup">
                            <Button variant="scanline" size="lg">
                                INITIALIZE_SYSTEM
                            </Button>
                        </Link>
                        <Link href="#how-it-works">
                            <Button variant="ghost" className="text-gray-500 hover:text-white">
                                // VIEW_SCHEMATICS
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* SECTIONS */}
            <DetailedFeatures />
            <HowItWorks />
            <InteractivePricing />

            <Footer />
        </main>
    );
}
