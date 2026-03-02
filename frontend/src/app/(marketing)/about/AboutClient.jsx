"use client";
import React from "react";
import { motion } from "framer-motion";
import { FaFingerprint, FaBolt, FaBrain, FaCodeBranch } from "react-icons/fa";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function AboutClient() {
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
                    className="mb-8 md:mb-12 lg:mb-24 text-center"
                >
                    <h1 className="text-3xl sm:text-5xl md:text-8xl font-bold tracking-tighter mb-4 sm:mb-6 lg:mb-8 leading-[0.9]">
                        Work Smarter. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Live Lighter.</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
                        TASKTIME is your AI task and schedule partner — helping you plan, prioritize, and execute without the overwhelm.
                    </p>
                </motion.div>

                {/* THE STORY / MANIFESTO */}
                <section className="mb-16 md:mb-32 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start border-l border-white/10 pl-4 md:pl-12">
                    <div className="md:col-span-8 space-y-8">
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            Why We Built TASKTIME
                        </h2>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            Modern life is noisy. Notifications, meetings, messages, deadlines —
                            everything competes for your attention.
                        </p>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            <span className="text-white font-semibold">TASKTIME</span> was built to bring clarity back.
                            It helps you decide what matters, schedule your time intelligently,
                            and focus on meaningful work — <span className="text-cyan-400">without mental overload.</span>
                        </p>
                    </div>
                    <div className="md:col-span-4 font-mono text-xs text-gray-600 space-y-2 uppercase tracking-widest">
                        <div><span className="text-cyan-500">●</span> Built for students, creators & founders</div>
                        <div><span className="text-cyan-500">●</span> AI-powered task management & scheduling</div>
                        <div><span className="text-cyan-500">●</span> Designed for focus</div>
                    </div>
                </section>

                {/* CORE AXIOMS (Grid) */}
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-bold tracking-tighter mb-2 text-white">
                            What We Believe
                        </h2>
                        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                            Our Principles
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 rounded-sm overflow-hidden mb-16 md:mb-32">
                    {[
                        {
                            title: "Clarity Over Complexity",
                            desc: "Productivity should feel simple. We remove friction so you can focus on what matters.",
                            icon: <FaBolt />
                        },
                        {
                            title: "Privacy Matters",
                            desc: "Your data belongs to you. We design with security and respect at the core.",
                            icon: <FaFingerprint />
                        },
                        {
                            title: "Built Around You",
                            desc: "TASKTIME adapts to your working style instead of forcing rigid workflows.",
                            icon: <FaBrain />
                        }
                    ].map((item, i) => (
                        <div key={i} className="bg-black p-5 md:p-8 group hover:bg-neutral-900/30 transition-colors relative flex flex-col justify-between h-full">
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
                    <h3 className="text-2xl font-bold text-white mb-6">Build the Future With Us</h3>
                    <p className="text-gray-400 max-w-xl mx-auto mb-8">
                        We’re building tools that help people think clearly and work intentionally.
                        If that excites you, we’d love to connect.

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
