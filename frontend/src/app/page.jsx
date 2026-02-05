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
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-white">
            <Navbar />

            {/* HERO SECTION */}
            <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden">
                {/* Orb Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 scale-125 md:scale-100 z-0 pointer-events-none">
                    <AiEnergySphere size={700} speed={1.2} />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-medium text-cyan-400 pointer-events-none"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        SYSTEM ONLINE • V1.0
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-7xl md:text-[8rem] font-bold tracking-tighter leading-none mb-6 text-white text-center pointer-events-none"
                    >
                        THINKING <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-b from-white to-gray-500">PARTNER</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light tracking-wide pointer-events-none"
                    >
                        Taskey is an autonomous agent that plans your day, negotiates deadlines, and protects your energy.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex gap-4"
                    >
                        <Link href="/signup">
                            <button className="px-8 py-4 bg-white text-black font-bold rounded-full text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-300">
                                Get Started
                            </button>
                        </Link>
                        <Link href="/about">
                            <button className="px-8 py-4 bg-transparent border border-white/20 text-white font-medium rounded-full text-lg hover:bg-white/10 transition-all duration-300">
                                How it Works
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* POWERFUL FEATURES (GRID) */}
            <DetailedFeatures />

            {/* HOW IT WORKS */}
            <HowItWorks />

            {/* NEURAL ARCHITECTURE (BENTO) */}
            <section className="py-32 px-6 bg-black border-t border-white/5">
                <div className="max-w-7xl mx-auto mb-16 px-4">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">Neural Architecture</h2>
                    <p className="text-gray-500 text-xl">Powered by large language models, grounded in reality.</p>
                </div>

                <BentoGrid>
                    <BentoGridItem
                        title="Deep Reasoning"
                        description="Analyzes task complexity and breaks it down into actionable steps automatically."
                        header={
                            <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-linear-to-br from-neutral-900 to-neutral-800 border border-white/5 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center opacity-30 text-9xl text-white">
                                    <FaBrain />
                                </div>
                            </div>
                        }
                        icon={<MdPsychology />}
                        span="md:col-span-2"
                        className="border-white/10"
                    />
                    <BentoGridItem
                        title="Energy Protection"
                        description="Detects burnout patterns and forces recovery periods into your schedule."
                        header={
                            <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-[#09090b] border border-white/5 flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full border-2 border-cyan-500/30 flex items-center justify-center animate-pulse">
                                    <FaShieldAlt className="text-4xl text-cyan-400" />
                                </div>
                            </div>
                        }
                        icon={<FaShieldAlt />}
                        className="border-white/10"
                    />
                    <BentoGridItem
                        title="Smart Rescheduling"
                        description="Missed a task? No guilt. The system instantly recalculates the optimal path forward."
                        header={
                            <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-neutral-900 border border-white/5 overflow-hidden">
                                {/* Abstract calendar UI */}
                                <div className="space-y-2 p-4 opacity-50">
                                    <div className="h-2 w-3/4 bg-gray-700 rounded" />
                                    <div className="h-2 w-1/2 bg-gray-700 rounded" />
                                    <div className="h-2 w-full bg-cyan-900/40 rounded" />
                                </div>
                            </div>
                        }
                        icon={<FaCalendarAlt />}
                        className="border-white/10"
                    />
                    <BentoGridItem
                        title="Voice Interface"
                        description="Just talk. Whisper v3 transcribes your thoughts into structured plans."
                        header={
                            <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-neutral-900 border border-white/5 flex items-center justify-center">
                                <div className="flex gap-1 items-end h-12">
                                    {[1, 2, 3, 4, 5, 4, 3, 2].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [10, h * 8, 10] }}
                                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                            className="w-2 bg-cyan-500 rounded-full"
                                        />
                                    ))}
                                </div>
                            </div>
                        }
                        icon={<MdSmartToy />}
                        span="md:col-span-2"
                        className="border-white/10"
                    />
                </BentoGrid>
            </section>

            {/* PRICING */}
            <InteractivePricing />

            {/* DATA STREAM FOOTER */}
            <section className="py-24 border-t border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-900/5" />
                <div className="relative z-10 text-center space-y-8">
                    <h2 className="text-5xl md:text-[7rem] font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-black">
                        UPGRADE <br /> REALITY
                    </h2>
                    <Link href="/signup">
                        <button className="px-12 py-5 bg-white text-black font-bold rounded-full text-xl hover:scale-105 transition-all">
                            Get Started
                        </button>
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
