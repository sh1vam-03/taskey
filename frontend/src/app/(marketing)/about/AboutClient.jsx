"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaFingerprint, FaBolt, FaBrain, FaCodeBranch } from "react-icons/fa";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function AboutClient() {
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
        <div className="min-h-[100dvh] bg-black text-white -mt-20 pt-[calc(var(--section-spacing)*1.5)] pb-[var(--section-spacing)] px-[var(--container-padding)] overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-500 flex flex-col justify-center">
            {/* GLOBAL BACKGROUND (Shared with Landing) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />

                {/* RESPONSIVE AiEnergySphere*/}
            </div>

            <div className="w-full max-w-[var(--container-width)] mx-auto relative z-10">
                {/* HERO HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 lg:mb-24 text-center"
                >
                    <div className="inline-block border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 rounded-full mb-6 lg:mb-8">
                        <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest">
                            // MISSION_LOG: AUGMENTATION
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 lg:mb-8 leading-[0.9]">
                        Architecting the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Second Cortex.</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
                        We aren't building a productivity tool. We are building the neural interface between your intent and execution.
                    </p>
                </motion.div>

                {/* THE STORY / MANIFESTO */}
                <section className="mb-32 grid grid-cols-1 md:grid-cols-12 gap-12 items-start border-l border-white/10 pl-8 md:pl-12">
                    <div className="md:col-span-8 space-y-8">
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            The Cognitive Bottleneck
                        </h2>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            The modern world demands parallel processing, but the human brain is linear.
                            We drown in context switching, notification interrupts, and administrative debris.
                        </p>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            <span className="text-white font-semibold">Taskey</span> was forged to solve this latency.
                            By offloading the sorting, scheduling, and remembering to an intelligent substrate,
                            we liberate your biological hardware for what it does best: <span className="text-cyan-400">Creation</span>.
                        </p>
                    </div>
                    <div className="md:col-span-4 font-mono text-xs text-gray-600 space-y-2 uppercase tracking-widest">
                        <div><span className="text-cyan-500">●</span> Origin: San Francisco</div>
                        <div><span className="text-cyan-500">●</span> Status: Scaling</div>
                        <div><span className="text-cyan-500">●</span> Version: 1.0.4</div>
                    </div>
                </section>

                {/* CORE AXIOMS (Grid) */}
                <div className="mb-12 flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-8">
                    <div>
                        <h2 className="text-4xl font-bold tracking-tighter mb-2 text-white">
                            System Axioms
                        </h2>
                        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                            // Guiding Principles
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 rounded-sm overflow-hidden mb-32">
                    {[
                        { title: "Velocity First", desc: "Every millisecond of latency is a thought lost. We prioritize speed above all.", icon: <FaBolt /> },
                        { title: "Data Enclave", desc: "Your thoughts are sovereign. Local-first encryption ensures absolute privacy.", icon: <FaFingerprint /> },
                        { title: "Neural Adaptivity", desc: "The system molds to you. Strict rigid workflows are a relic of the past.", icon: <FaBrain /> }
                    ].map((item, i) => (
                        <div key={i} className="bg-black p-8 group hover:bg-neutral-900/30 transition-colors relative flex flex-col justify-between h-full">
                            {/* Tech Decorators */}
                            <div className="absolute top-2 left-2 text-[8px] text-white/20 font-mono">+</div>
                            <div className="absolute top-2 right-2 text-[8px] text-white/20 font-mono">+</div>
                            <div className="absolute bottom-2 left-2 text-[8px] text-white/20 font-mono">+</div>
                            <div className="absolute bottom-2 right-2 text-[8px] text-white/20 font-mono">+</div>

                            <div className="text-2xl text-white group-hover:text-cyan-500 transition-colors mb-6">
                                {item.icon}
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                                {/* Expanding Line */}
                                <div className="h-px w-8 bg-white/20 my-3 group-hover:w-full group-hover:bg-cyan-500/50 transition-all duration-500" />
                                <p className="text-gray-500 text-sm leading-relaxed font-mono">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* TEAM / FOOTER HERO */}
                <div className="text-center py-20 border-t border-white/10">
                    <h3 className="text-2xl font-bold text-white mb-6">Join the Collective</h3>
                    <p className="text-gray-400 max-w-xl mx-auto mb-8">
                        We are a small team of engineers and designers obsessed with human performance.
                    </p>
                    <div className="inline-flex gap-4">
                        <Link href="/careers">
                            <Button variant="scanline" size="lg" className="uppercase tracking-wider">
                                View Careers
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
