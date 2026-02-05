"use client";
import React, { useEffect, useRef, useState } from "react"

export default function AiEnergySphere({
    size = 400,
    speed = 1, // rotation/flow speed multiplier
    limit = 20, // max rotation degrees on hover
}) {
    // Mouse Interaction State
    const [mouse, setMouse] = useState({ x: 0, y: 0 })
    const requestRef = useRef(null)
    const targetRef = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window
            // Normalize coordinates (-1 to 1)
            const x = (e.clientX / innerWidth) * 2 - 1
            const y = (e.clientY / innerHeight) * 2 - 1
            targetRef.current = { x, y }
        }

        const animate = () => {
            // Smoothly interpolate current mouse to target (Lerp)
            setMouse((prev) => ({
                x: prev.x + (targetRef.current.x - prev.x) * 0.05,
                y: prev.y + (targetRef.current.y - prev.y) * 0.05
            }))
            requestRef.current = requestAnimationFrame(animate)
        }

        window.addEventListener("mousemove", handleMouseMove)
        requestRef.current = requestAnimationFrame(animate)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            cancelAnimationFrame(requestRef.current)
        }
    }, [])

    return (
        <div
            className="relative flex items-center justify-center pointer-events-none select-none"
            style={{ width: size, height: size, perspective: "1000px" }}
        >
            {/* 
              MAIN CONTAINER (Rotates based on Mouse) 
              We use `preserve-3d` to give real depth layering
            */}
            <div
                className="relative w-full h-full transition-transform duration-100 linear will-change-transform"
                style={{
                    transform: `rotateX(${-mouse.y * limit}deg) rotateY(${mouse.x * limit}deg)`,
                    transformStyle: "preserve-3d"
                }}
            >
                {/* --- LAYER 1: DEEP GLOW (Back) --- */}
                <div
                    className="absolute inset-0 rounded-full blur-[60px] opacity-40"
                    style={{
                        background: "radial-gradient(circle, #06b6d4 0%, #3b82f6 100%)",
                        transform: "translateZ(-50px)"
                    }}
                />

                {/* --- LAYER 2: WIREFRAME ENERGY SHELL (Outer) --- */}
                {/* Animated organic borders + spinning gradient */}
                <div
                    className="absolute inset-[10%] rounded-full opacity-60 mix-blend-screen"
                    style={{
                        border: "2px solid rgba(6, 182, 212, 0.3)",
                        boxShadow: "0 0 30px rgba(6, 182, 212, 0.2), inset 0 0 20px rgba(6, 182, 212, 0.2)",
                        animation: `sphere-morph ${6 / speed}s ease-in-out infinite alternate, sphere-spin ${20 / speed}s linear infinite`,
                        transform: "translateZ(20px)"
                    }}
                />

                {/* --- LAYER 3: RAPID ORBITAL RINGS (Energy Lines) --- */}
                {/* Thin lines rotating fast creates the "sphere surface" illusion */}
                <div
                    className="absolute inset-[5%] rounded-full border border-cyan-400/30 border-t-transparent border-b-transparent"
                    style={{ animation: `sphere-spin ${3 / speed}s linear infinite reverse` }}
                />
                <div
                    className="absolute inset-[15%] rounded-full border-2 border-blue-500/20 border-l-transparent border-r-transparent"
                    style={{ animation: `sphere-spin ${5 / speed}s linear infinite` }}
                />

                {/* --- LAYER 4: SURFACE TURBULENCE (Masked Gradient) --- */}
                {/* Gives the "plasma" texture look */}
                <div
                    className="absolute inset-0 rounded-full mix-blend-overlay opacity-80"
                    style={{
                        background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), transparent 50%), repeating-conic-gradient(from 0deg, rgba(6,182,212,0.1) 0deg, transparent 20deg, rgba(59,130,246,0.1) 40deg)",
                        animation: `sphere-spin ${15 / speed}s linear infinite`
                    }}
                />

                {/* --- LAYER 5: CORE PULSE (Center) --- */}
                <div
                    className="absolute inset-[25%] rounded-full bg-blue-900 blur-xl"
                    style={{
                        background: "radial-gradient(circle, #ffffff 0%, #06b6d4 40%, transparent 80%)",
                        animation: `pulse-core ${3 / speed}s ease-in-out infinite alternate`,
                        mixBlendMode: "hard-light"
                    }}
                />

                {/* --- LAYER 6: INTERACTIVE GLOW (Follows Mouse) --- */}
                {/* This light source moves OPPOSITE to rotation to look like it stays fixed in world space or tracks cursor */}
                <div
                    className="absolute inset-0 rounded-full mix-blend-plus-lighter opacity-60"
                    style={{
                        background: `radial-gradient(circle at ${50 + mouse.x * 40}% ${50 + mouse.y * 40}%, rgba(255,255,255,0.8) 0%, transparent 40%)`,
                        transform: "translateZ(30px)"
                    }}
                />
            </div>
        </div>
    )
}
