"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { FaRocket, FaBolt, FaLightbulb } from "react-icons/fa";

export default function CareersClient() {
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
            {/* GLOBAL BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />

                {/* RESPONSIVE AiEnergySphere */}
            </div>

            <div className="w-full max-w-[var(--container-width)] mx-auto relative z-10">
                {/* HERO */}
                <div className="text-center mb-12 lg:mb-24">
                    <div className="inline-block border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 rounded-full mb-6 lg:mb-8">
                        <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest">
                            // SYSTEM_EXPANSION: ACTIVE
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-white leading-[0.9]">
                        Join the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Neural Collective.</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
                        We are building the operating system for human intent. <br className="hidden md:block" />
                        Help us architect the future of cognitive augmentation.
                    </p>
                </div>

                {/* CULTURE GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 rounded-sm overflow-hidden mb-32">
                    {[
                        { title: "Radical Autonomy", desc: "We don't manage. We agree on the 'Why' and let you execute the 'How'. Ownership is absolute.", icon: <FaRocket /> },
                        { title: "Speed as a Habit", desc: "Perfect is the enemy of shipped. We iterate in real-time and deploy to production daily.", icon: <FaBolt /> },
                        { title: "First Principles", desc: "We ignore 'industry standards'. We solve problems from the physics of the user experience.", icon: <FaLightbulb /> }
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
                                <div className="h-px w-8 bg-white/20 my-3 group-hover:w-full group-hover:bg-cyan-500/50 transition-all duration-500" />
                                <p className="text-gray-500 leading-relaxed text-sm font-mono">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* OPEN ROLES */}
                <div className="mb-12 flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-8">
                    <div>
                        <h2 className="text-4xl font-bold tracking-tighter mb-2 text-white">
                            Open Nodes
                        </h2>
                        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                            // Current Requisition
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {[
                        { role: "Senior Neural Architect", dept: "Engineering", type: "Remote / SF", id: "ENG-001" },
                        { role: "Interface Designer", dept: "Design", type: "Remote", id: "DES-042" },
                        { role: "AI Systems Engineer", dept: "Machine Learning", type: "London / Remote", id: "ML-101" },
                        { role: "Product Growth API", dept: "Growth", type: "Remote", id: "MKT-202" }
                    ].map((job, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-black border border-white/10 p-6 flex flex-col md:flex-row items-center justify-between hover:bg-neutral-900/30 group cursor-pointer"
                        >
                            <div className="flex-1 mb-4 md:mb-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{job.role}</h3>
                                    <span className="border border-white/10 text-[10px] px-2 py-0.5 rounded text-gray-500 font-mono">
                                        {job.id}
                                    </span>
                                </div>
                                <div className="text-gray-500 text-sm font-mono flex gap-4">
                                    <span>{job.dept}</span>
                                    <span className="text-cyan-900">•</span>
                                    <span>{job.type}</span>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-500">
                                // INITIALIZE_APPLICATION
                            </Button>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <p className="text-gray-500 mb-6">Don't see your node?</p>
                    <a href="mailto:careers@taskey.ai">
                        <Button variant="scanline" size="lg" className="uppercase tracking-wider">
                            Transcode your resume to careers@taskey.ai
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
}
