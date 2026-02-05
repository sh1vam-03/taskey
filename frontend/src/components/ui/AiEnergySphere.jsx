"use client";
import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AiEnergySphere({
    size = 500,
    speed = 1,
    particleCount = 180 // Increased from 120
}) {
    const [isMounted, setIsMounted] = useState(false);

    // Prevent hydration mismatch by only rendering random elements after mount
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Generate particles in a spherical distribution
    const particles = useMemo(() => {
        if (!isMounted) return [];

        return [...Array(particleCount)].map((_, i) => {
            // Spherical coordinates for even distribution
            const r = 140 + Math.random() * 100; // Radius spread
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            // Convert to Cartesian
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            return {
                id: i,
                x, y, z,
                scale: 0.5 + Math.random() * 1.5, // Varied sizes
                opacity: 0.3 + Math.random() * 0.7,
                duration: 10 + Math.random() * 20
            };
        });
    }, [particleCount, isMounted]);

    if (!isMounted) {
        // Render a static placeholder or nothing during SSR/initial render to avoid mismatch
        return (
            <div
                className="relative flex items-center justify-center select-none pointer-events-none"
                style={{ width: size, height: size }}
            >
                {/* Static Core Placeholder */}
                <div className="absolute w-20 h-20 bg-cyan-500/20 blur-2xl rounded-full" />
            </div>
        );
    }

    return (
        <div
            className="relative flex items-center justify-center select-none pointer-events-none"
            style={{ width: size, height: size, perspective: "1000px" }}
        >
            <div className="relative w-full h-full transform-3d flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>

                {/* 0. GLOBAL ROTATION CONTAINER (Slow Spin) */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: 360, rotateZ: 45 }}
                    transition={{ duration: 60 / speed, repeat: Infinity, ease: "linear" }}
                >
                    {/* 1. NANO-BOT SWARM */}
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            className="absolute bg-cyan-400 rounded-full"
                            style={{
                                width: p.scale * 2,
                                height: p.scale * 2,
                                left: "50%",
                                top: "50%",
                                x: p.x,
                                y: p.y,
                                z: p.z,
                                opacity: p.opacity,
                                boxShadow: "0 0 4px rgba(34,211,238,0.8)"
                            }}
                            animate={{
                                opacity: [p.opacity, 0.2, p.opacity],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: Math.random() * 2
                            }}
                        />
                    ))}
                </motion.div>

                {/* 2. CORE SINGULARITY */}
                <div className="absolute w-20 h-20 bg-cyan-500/20 blur-2xl rounded-full animate-pulse" />
                <div className="absolute w-10 h-10 bg-white/50 blur-xl rounded-full" />
                <div className="absolute w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_50px_rgba(6,182,212,1)]" />

                {/* 3. GYROSCOPIC RINGS (Expanded Collection) */}
                {/* Ring 1 - Dashed Data Ring */}
                <motion.div
                    className="absolute w-[60%] h-[60%] border border-dashed border-cyan-500/30 rounded-full box-border"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateX: 360, rotateY: 360 }}
                    transition={{ duration: 20 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring 2 - Solid Orbital */}
                <motion.div
                    className="absolute w-[80%] h-[80%] border-2 border-transparent border-t-cyan-500/50 border-b-cyan-500/50 rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateZ: 360, rotateX: 45 }}
                    transition={{ duration: 15 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring 3 - Large Outer */}
                <motion.div
                    className="absolute w-full h-full border border-white/5 rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: -360, rotateZ: 15 }}
                    transition={{ duration: 30 / speed, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute top-1/2 -right-1 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_cyan]" />
                </motion.div>

                {/* Ring 4 - Vertical Scanning */}
                <motion.div
                    className="absolute w-[70%] h-[70%] border border-cyan-900/40 rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 10 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring 5 - Inner Fast Gyro (NEW) */}
                <motion.div
                    className="absolute w-[40%] h-[40%] border-[0.5px] border-cyan-400/30 rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateX: 360, rotateZ: 360 }}
                    transition={{ duration: 5 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring 6 - Diagonal Offset (NEW) */}
                <motion.div
                    className="absolute w-[90%] h-[90%] border border-white/5 border-l-cyan-500/20 rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateX: -360, rotateY: 45 }}
                    transition={{ duration: 25 / speed, repeat: Infinity, ease: "linear" }}
                />

            </div>
        </div>
    );
}
