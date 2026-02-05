"use client";
import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function AiEnergySphere({
    size = 400,
    speed = 1,
    interactive = true
}) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothX = useSpring(mouseX, { stiffness: 40, damping: 20 });
    const smoothY = useSpring(mouseY, { stiffness: 40, damping: 20 });

    const rotateX = useTransform(smoothY, [-1, 1], [20, -20]);
    const rotateY = useTransform(smoothX, [-1, 1], [-20, 20]);

    useEffect(() => {
        if (!interactive) return;
        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth) * 2 - 1;
            const y = (e.clientY / innerHeight) * 2 - 1;
            mouseX.set(x);
            mouseY.set(y);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [interactive, mouseX, mouseY]);

    return (
        <div
            className="relative flex items-center justify-center select-none pointer-events-none"
            style={{ width: size, height: size, perspective: "1200px" }}
        >
            <motion.div
                className="relative w-full h-full transform-3d"
                style={{
                    rotateX: rotateX,
                    rotateY: rotateY,
                    transformStyle: "preserve-3d"
                }}
            >
                {/* 1. DATA CORE - Precise geometric sphere */}
                <motion.div
                    className="absolute inset-[25%] rounded-full border-[0.5px] border-cyan-400/80 bg-cyan-900/10 backdrop-blur-[2px]"
                    style={{
                        boxShadow: "0 0 40px rgba(6,182,212,0.6), inset 0 0 20px rgba(6,182,212,0.4)"
                    }}
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* 2. LATITUDE LINES (Wireframe) */}
                {[0, 45, 90, 135].map((deg, i) => (
                    <motion.div
                        key={`lat-${i}`}
                        className="absolute inset-0 rounded-full border border-white/10"
                        style={{ borderLeftColor: "transparent", borderRightColor: "transparent" }}
                        animate={{ rotateX: 360, rotateY: deg }}
                        transition={{ duration: 20 / speed, repeat: Infinity, ease: "linear" }}
                    />
                ))}

                {/* 3. ORBITAL DATA RINGS (The "Mirai" Rings) */}
                <motion.div
                    className="absolute inset-[-10%] rounded-full border-[1px] border-cyan-500/30 border-t-white/80 border-b-transparent border-l-transparent border-r-transparent"
                    animate={{ rotateZ: 360, rotateX: 30 }}
                    transition={{ duration: 10 / speed, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute inset-[-20%] rounded-full border-[1px] border-blue-500/20 border-b-cyan-400/60 border-t-transparent"
                    animate={{ rotateZ: -360, rotateX: -30 }}
                    transition={{ duration: 15 / speed, repeat: Infinity, ease: "linear" }}
                />

                {/* 4. SCAN LINE EFFECT */}
                <div className="absolute inset-0 rounded-full overflow-hidden opacity-20 bg-[linear-gradient(to_bottom,transparent_0%,#49c5ff_50%,transparent_100%)] animate-scan" style={{ animationDuration: '3s' }} />

                {/* 5. GLOW AMBIENCE */}
                <div className="absolute inset-0 bg-cyan-500/10 blur-[80px] rounded-full" />
            </motion.div>
        </div>
    );
}
