"use client";
import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AiEnergySphere({
    size = 600,
    speed = 0.5, // Slower for majesty
    particleCount = 500 // High density for mesh look
}) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const particles = useMemo(() => {
        if (!isMounted) return [];

        const points = [];
        const radius = 180; // Fixed radius for surface shell

        // Generate particles in "Latitude Bands" to create the mesh effect
        const latCount = 20; // Number of horizontal bands
        const longCount = 30; // Particles per band (approx)

        for (let lat = 0; lat < latCount; lat++) {
            // Phi: 0 to PI (Top to Bottom)
            const phi = Math.PI * (lat / (latCount - 1));
            const y = radius * Math.cos(phi);

            // Calculate band radius at this latitude
            const ringRadius = radius * Math.sin(phi);

            // Color Gradient: Top (Cyan/Blue) -> Bottom (Pink/Purple)
            // phi 0 = Top, phi PI = Bottom
            // Mix: 0 = Blue, 1 = Pink
            const mix = lat / latCount;
            let color = "rgb(34, 211, 238)"; // Default Cyan

            if (mix > 0.6) color = "rgb(236, 72, 153)"; // Pink-500
            else if (mix > 0.3) color = "rgb(168, 85, 247)"; // Purple-500

            for (let long = 0; long < longCount; long++) {
                // Theta: 0 to 2PI (Around the band)
                const theta = (Math.PI * 2 * (long / longCount)) + (Math.random() * 0.2); // Slight jitter

                const x = ringRadius * Math.cos(theta);
                const z = ringRadius * Math.sin(theta);

                points.push({
                    id: `${lat}-${long}`,
                    x, y, z,
                    scale: 0.8 + Math.random() * 0.5,
                    opacity: 0.6 + Math.random() * 0.4,
                    color,
                    delay: Math.random() * 2
                });
            }
        }
        return points;
    }, [isMounted]);

    if (!isMounted) {
        return (
            <div
                className="relative flex items-center justify-center select-none pointer-events-none"
                style={{ width: size, height: size }}
            >
                <div className="absolute w-40 h-40 bg-purple-500/20 blur-3xl rounded-full" />
            </div>
        );
    }

    return (
        <div
            className="relative flex items-center justify-center select-none pointer-events-none"
            style={{ width: size, height: size, perspective: "1000px" }}
        >
            <div className="relative w-full h-full transform-3d flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>

                {/* 1. MESH SURFACE SPHERE */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: 360, rotateX: 10 }} // Slight tilt
                    transition={{ duration: 50 / speed, repeat: Infinity, ease: "linear" }}
                >
                    {particles.map((p) => (
                        <div
                            key={p.id}
                            className="absolute rounded-full"
                            style={{
                                width: p.scale * 3, // Smaller dots for mesh look
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

                {/* 2. INNER GLOW CORE */}
                <div className="absolute w-32 h-32 bg-indigo-500/30 blur-2xl rounded-full mix-blend-screen" />
                <div className="absolute w-20 h-20 bg-cyan-400/20 blur-xl rounded-full" />

                {/* 3. MULTIPLE ORBITAL RINGS */}

                {/* Ring A: Horizontal Equator (Cyan) */}
                <motion.div
                    className="absolute w-[65%] h-[65%] border border-cyan-500/30 rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateX: 75, rotateZ: 360 }}
                    transition={{ duration: 25 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring B: Vertical Meridian (Pink) */}
                <motion.div
                    className="absolute w-[70%] h-[70%] border border-pink-500/20 rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: 360, rotateZ: 15 }}
                    transition={{ duration: 35 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring C: Tilted Orbit (Purple) */}
                <motion.div
                    className="absolute w-[80%] h-[80%] border border-purple-500/30 rounded-full border-dashed"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateX: 360, rotateY: 45 }}
                    transition={{ duration: 40 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring D: Outer Gyro (White) */}
                <motion.div
                    className="absolute w-[95%] h-[95%] border-[0.5px] border-white/10 rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: -360, rotateX: 20 }}
                    transition={{ duration: 60 / speed, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute top-1/2 -left-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
                </motion.div>

            </div>
        </div>
    );
}
