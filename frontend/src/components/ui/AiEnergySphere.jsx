"use client";
import React from "react";
import { motion } from "framer-motion";

export default function AiEnergySphere({
    size = 400,
    speed = 1,
    interactive = false // Disabled as requested
}) {
    return (
        <div
            className="relative flex items-center justify-center select-none pointer-events-none"
            style={{ width: size, height: size, perspective: "1000px" }}
        >
            <div className="relative w-full h-full transform-3d" style={{ transformStyle: "preserve-3d" }}>

                {/* 1. CORE SINGULARITY */}
                <motion.div
                    className="absolute inset-[35%] rounded-full bg-cyan-500/20 blur-xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4 / speed, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute inset-[40%] rounded-full bg-white blur-md"
                    animate={{ scale: [1, 0.8, 1] }}
                    transition={{ duration: 2 / speed, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* 2. GYROSCOPIC RINGS (Perfect Circular Motion) */}
                {/* Ring 1: Horizontal-ish */}
                <motion.div
                    className="absolute inset-[10%] rounded-full border border-cyan-500/30 border-t-white/80"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateX: 360, rotateY: 10, rotateZ: 5 }}
                    transition={{ duration: 15 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring 2: Vertical-ish */}
                <motion.div
                    className="absolute inset-[15%] rounded-full border border-cyan-400/20 border-r-white/60"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: 360, rotateX: 340, rotateZ: -10 }}
                    transition={{ duration: 20 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring 3: Diagonal */}
                <motion.div
                    className="absolute inset-[5%] rounded-full border border-blue-500/20 border-b-cyan-300/50"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateZ: 360, rotateX: 60, rotateY: 30 }}
                    transition={{ duration: 25 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* Ring 4: Outer Orbit (Fast) */}
                <motion.div
                    className="absolute inset-0 rounded-full border-[0.5px] border-white/5 border-l-cyan-500"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateZ: -360, rotateX: -45 }}
                    transition={{ duration: 30 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* 3. GLOW HALO */}
                <div className="absolute inset-0 rounded-full bg-cyan-500/5 blur-[60px]" />
            </div>
        </div>
    );
}
