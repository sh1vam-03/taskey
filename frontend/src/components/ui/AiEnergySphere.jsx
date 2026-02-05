"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";

export default function AiEnergySphere({
    size = 400,
    speed = 1,
    particleCount = 60
}) {
    // Generate random particles for the "nano-bot" swarm
    const particles = useMemo(() => {
        return [...Array(particleCount)].map((_, i) => ({
            id: i,
            x: Math.random() * 100 - 50, // -50% to 50% relative to center
            y: Math.random() * 100 - 50,
            angle: Math.random() * 360,
            duration: 3 + Math.random() * 5,
            delay: Math.random() * 2,
            scale: 0.5 + Math.random() * 0.5,
            orbitScale: 0.8 + Math.random() * 0.4
        }));
    }, [particleCount]);

    return (
        <div
            className="relative flex items-center justify-center select-none pointer-events-none"
            style={{ width: size, height: size, perspective: "1000px" }}
        >
            <div className="relative w-full h-full transform-3d" style={{ transformStyle: "preserve-3d" }}>

                {/* 1. CORE SINGULARITY (Stable, Non-blinking) */}
                <div className="absolute inset-[40%] rounded-full bg-cyan-500/10 blur-xl" />
                <div className="absolute inset-[45%] rounded-full bg-white/20 blur-md" />
                <div className="absolute inset-[48%] rounded-full bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)]" />

                {/* 2. NANO-BOT SWARM */}
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                        style={{
                            left: "50%",
                            top: "50%",
                            boxShadow: "0 0 5px rgba(34,211,238,0.8)"
                        }}
                        animate={{
                            rotate: [p.angle, p.angle + 360],
                            translateX: [
                                `${p.orbitScale * 100}px`,
                                `${p.orbitScale * 120}px`,
                                `${p.orbitScale * 100}px`
                            ],
                            translateY: [
                                `${p.orbitScale * 20}px`,
                                `${p.orbitScale * -20}px`,
                                `${p.orbitScale * 20}px`
                            ],
                            scale: [p.scale, p.scale * 1.2, p.scale],
                            opacity: [0.4, 0.8, 0.4]
                        }}
                        transition={{
                            duration: p.duration / speed,
                            repeat: Infinity,
                            ease: "linear",
                            delay: p.delay
                        }}
                    />
                ))}

                {/* 3. ADDITIONAL GYROSCOPIC RINGS (Increased Count) */}
                {/* Ring 1 - Fast Inner */}
                <motion.div
                    className="absolute inset-[25%] rounded-full border-[1px] border-cyan-500/30 border-t-white/80"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateX: 360, rotateY: 15 }}
                    transition={{ duration: 8 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring 2 - Vertical */}
                <motion.div
                    className="absolute inset-[20%] rounded-full border-[1px] border-cyan-400/20 border-r-white/60"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: 360, rotateX: 340 }}
                    transition={{ duration: 12 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring 3 - Diagonal */}
                <motion.div
                    className="absolute inset-[15%] rounded-full border-[1px] border-blue-500/20 border-b-cyan-300/50"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateZ: 360, rotateX: 60 }}
                    transition={{ duration: 15 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring 4 - Outer Large */}
                <motion.div
                    className="absolute inset-[5%] rounded-full border-[0.5px] border-white/10 border-l-cyan-500/50"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateZ: -360, rotateX: -45 }}
                    transition={{ duration: 25 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring 5 - The "Data Field" (Dotted) */}
                <motion.div
                    className="absolute inset-0 rounded-full border-[1px] border-dashed border-cyan-900/40"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: -360 }}
                    transition={{ duration: 40 / speed, repeat: Infinity, ease: "linear" }}
                />
            </div>
        </div>
    );
}
