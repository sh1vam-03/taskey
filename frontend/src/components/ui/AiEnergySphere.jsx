"use client";
import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AiEnergySphere({
    size = 600,
    speed = 0.5,
    particleCount = 600 // Increased for Core + Shell
}) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { shellParticles, coreParticles } = useMemo(() => {
        if (!isMounted) return { shellParticles: [], coreParticles: [] };

        const shell = [];
        const core = [];
        const shellRadius = 180;

        // 1. OUTER SHELL (Surface Mesh)
        const latCount = 20;
        const longCount = 30;

        for (let lat = 0; lat < latCount; lat++) {
            const phi = Math.PI * (lat / (latCount - 1));
            const ringRadius = shellRadius * Math.sin(phi);
            const y = shellRadius * Math.cos(phi);

            for (let long = 0; long < longCount; long++) {
                const theta = Math.PI * 2 * (long / longCount);
                const x = ringRadius * Math.cos(theta);
                const z = ringRadius * Math.sin(theta);

                shell.push({
                    id: `shell-${lat}-${long}`,
                    x, y, z,
                    scale: 0.8 + Math.random() * 0.5,
                    opacity: 0.6 + Math.random() * 0.4,
                    color: Math.random() > 0.9 ? "white" : "rgb(34, 211, 238)", // Cyan + White Sparkles
                });
            }
        }

        // 2. INNER CORE (Dense Volume)
        for (let i = 0; i < 200; i++) {
            const r = Math.random() * 100; // Solid center radius
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            core.push({
                id: `core-${i}`,
                x, y, z,
                scale: 1 + Math.random(),
                opacity: 0.8,
                color: "rgb(6, 182, 212)" // Darker dense Cyan
            });
        }

        return { shellParticles: shell, coreParticles: core };
    }, [isMounted]);

    if (!isMounted) {
        return (
            <div
                className="relative flex items-center justify-center select-none pointer-events-none"
                style={{ width: size, height: size }}
            >
                <div className="absolute w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full" />
            </div>
        );
    }

    return (
        <div
            className="relative flex items-center justify-center select-none pointer-events-none"
            style={{ width: size, height: size, perspective: "1000px" }}
        >
            <div className="relative w-full h-full transform-3d flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>

                {/* 1. SHELL ROTATION CONTAINER */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 50 / speed, repeat: Infinity, ease: "linear" }}
                >
                    {shellParticles.map((p) => (
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
                                boxShadow: `0 0 4px ${p.color}`
                            }}
                        />
                    ))}
                </motion.div>

                {/* 2. CORE ROTATION (Counter-Spin for depth) */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: -360 }}
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
                            }}
                        />
                    ))}
                </motion.div>

                {/* 3. CENTER GLOW */}
                <div className="absolute w-40 h-40 bg-cyan-500/30 blur-3xl rounded-full" />
                <div className="absolute w-20 h-20 bg-white/40 blur-2xl rounded-full" />

                {/* 4. TRUE ORBITAL RINGS */}

                {/* Ring A: Equatorial (Fast Spin) */}
                <motion.div
                    className="absolute w-[60%] h-[60%] border border-cyan-400/40 rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateX: 80, rotateZ: 360 }}
                    transition={{ duration: 20 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring B: Polar (Vertical Flip) */}
                <motion.div
                    className="absolute w-[70%] h-[70%] border border-cyan-500/20 rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: 360, rotateZ: 0 }}
                    transition={{ duration: 30 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring C: Diagonal Gyro 1 */}
                <motion.div
                    className="absolute w-[80%] h-[80%] border-[0.5px] border-cyan-300/30 rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateX: 360, rotateY: 180 }}
                    transition={{ duration: 25 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring D: Diagonal Gyro 2 (Opposite) */}
                <motion.div
                    className="absolute w-[90%] h-[90%] border border-cyan-500/10 border-dashed rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: -360, rotateZ: 45 }}
                    transition={{ duration: 40 / speed, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]" />
                </motion.div>

            </div>
        </div>
    );
}
