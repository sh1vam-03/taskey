"use client";
import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AiEnergySphere({
    size = 600, // Increased default size
    speed = 1,
    particleCount = 300 // Massive increase for "solid" look
}) {
    const [isMounted, setIsMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Generate complex dual-layer particle system
    const { coreParticles, outerParticles } = useMemo(() => {
        if (!isMounted) return { coreParticles: [], outerParticles: [] };

        const core = [...Array(Math.floor(particleCount * 0.7))].map((_, i) => {
            // DENSE CORE: Tightly packed, spherical
            const r = 40 + Math.random() * 80; // Small radius (40-120)
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            return {
                id: `core-${i}`,
                x, y, z,
                scale: 0.8 + Math.random() * 0.8,
                opacity: 0.5 + Math.random() * 0.5,
                color: Math.random() > 0.8 ? "rgb(255,255,255)" : "rgb(34,211,238)"
            };
        });

        const outer = [...Array(Math.floor(particleCount * 0.3))].map((_, i) => {
            // OUTER SHELL: Dispersed, energetic
            const r = 130 + Math.random() * 120; // Large radius (130-250)
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            return {
                id: `outer-${i}`,
                x, y, z,
                scale: 0.5 + Math.random() * 1.5,
                opacity: 0.2 + Math.random() * 0.6,
                color: "rgb(6,182,212)" // Darker cyan
            };
        });

        return { coreParticles: core, outerParticles: outer };
    }, [particleCount, isMounted]);

    if (!isMounted) {
        return (
            <div
                className="relative flex items-center justify-center select-none pointer-events-none"
                style={{ width: size, height: size }}
            >
                <div className="absolute w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full" />
            </div>
        );
    }

    return (
        <div
            className="relative flex items-center justify-center select-none pointer-events-none"
            style={{ width: size, height: size, perspective: "1000px" }}
        >
            <div className="relative w-full h-full transform-3d flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>

                {/* 1. CORE PARTICLE CLOUD (The "Atom") */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 40 / speed, repeat: Infinity, ease: "linear" }}
                >
                    {coreParticles.map((p) => (
                        <div
                            key={p.id}
                            className="absolute rounded-full"
                            style={{
                                width: p.scale * 3,
                                height: p.scale * 3,
                                backgroundColor: p.color,
                                left: "50%",
                                top: "50%",
                                transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px)`,
                                opacity: p.opacity,
                                boxShadow: "0 0 2px rgba(34,211,238,0.5)"
                            }}
                        />
                    ))}
                </motion.div>

                {/* 2. OUTER SATELLITE CLOUD */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: -360, rotateX: 45 }}
                    transition={{ duration: 60 / speed, repeat: Infinity, ease: "linear" }}
                >
                    {outerParticles.map((p) => (
                        <motion.div
                            key={p.id}
                            className="absolute rounded-full bg-cyan-400"
                            style={{
                                width: p.scale * 2,
                                height: p.scale * 2,
                                left: "50%",
                                top: "50%",
                                transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px)`,
                                opacity: p.opacity,
                                boxShadow: "0 0 4px rgba(34,211,238,0.8)"
                            }}
                            animate={{ opacity: [0.2, 0.8, 0.2] }}
                            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
                        />
                    ))}
                </motion.div>

                {/* 3. CENTRAL SINGULARITY (Glow) */}
                <div className="absolute w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />
                <div className="absolute w-16 h-16 bg-white/40 blur-2xl rounded-full animate-pulse" />

                {/* 4. TECHNICAL RINGS (The "Structure") */}

                {/* Ring A: Equatorial (Fast, Dashed) */}
                <motion.div
                    className="absolute w-[50%] h-[50%] border-2 border-dashed border-cyan-500/30 rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateX: 70, rotateZ: 360 }}
                    transition={{ duration: 20 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring B: Polar (Slow, Solid) */}
                <motion.div
                    className="absolute w-[65%] h-[65%] border border-cyan-400/20 rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: 360, rotateZ: 90 }}
                    transition={{ duration: 30 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring C: Diagonal Orbital (Bright) */}
                <motion.div
                    className="absolute w-[80%] h-[80%] border-[1px] border-white/10 border-t-cyan-400/80 rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateX: 360, rotateY: 360, rotateZ: 45 }}
                    transition={{ duration: 15 / speed, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
                </motion.div>

                {/* Ring D: Outer Boundary (Scanning) */}
                <motion.div
                    className="absolute w-[95%] h-[95%] border border-cyan-900/30 rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: -360 }}
                    transition={{ duration: 50 / speed, repeat: Infinity, ease: "linear" }}
                />

            </div>
        </div>
    );
}
