"use client";
import React, { useEffect, useRef, useState } from "react"

export default function AiOrb({
    size = 300,
    glowColor = "#06b6d4", // Cyan-500
    coreColor = "#3b82f6", // Blue-500
    floatSpeed = 6, // Seconds for idle loop
    followStrength = 0.05, // Lower = smoother/slower tag
}) {
    const orbRef = useRef(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [target, setTarget] = useState({ x: 0, y: 0 })

    // Mouse tracking
    useEffect(() => {
        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window
            // Normalize -1 to 1
            const x = (e.clientX / innerWidth) * 2 - 1
            const y = (e.clientY / innerHeight) * 2 - 1
            setTarget({ x, y })
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    // Smooth Look-At / Follow Loop (Lerp)
    useEffect(() => {
        let animationFrame
        const animate = () => {
            setPosition((prev) => {
                const dx = target.x - prev.x
                const dy = target.y - prev.y

                // Stop micro-movements
                if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return prev

                return {
                    x: prev.x + dx * followStrength,
                    y: prev.y + dy * followStrength,
                }
            })
            animationFrame = requestAnimationFrame(animate)
        }
        animate()
        return () => cancelAnimationFrame(animationFrame)
    }, [target, followStrength])

    // Dynamic Styles for Performance
    const orbStyle = {
        width: size,
        height: size,
        background: `radial-gradient(circle at ${50 + position.x * 30}% ${50 + position.y * 30}%, #fff 0%, ${glowColor} 20%, ${coreColor} 60%, transparent 100%)`,
        boxShadow: `0 0 60px -10px ${glowColor}, 0 0 100px -20px ${coreColor}`,
        transform: `translate(${position.x * 20}px, ${position.y * 20}px)`,
        // We compose transforms: the JS translation + the CSS float animation 
        // Note: Ideally we wrap in a container for float, and animate child for interaction to avoid conflict.
        // Let's adjust structure below.
    }

    return (
        <div
            className="relative flex items-center justify-center pointer-events-none select-none"
            style={{ width: size, height: size }}
        >
            {/* Float Container - Handles Idle Animation */}
            <div
                className="w-full h-full animate-float"
                style={{ animationDuration: `${floatSpeed}s` }}
            >
                {/* Interactive Orb - Handles Mouse Follow & Gradient Shift */}
                <div
                    ref={orbRef}
                    className="w-full h-full rounded-full transition-transform duration-75 ease-out will-change-transform"
                    style={{
                        background: `radial-gradient(circle at ${40 + position.x * 20}% ${40 + position.y * 20}%, #ffffff 0%, ${glowColor} 25%, ${coreColor} 60%, transparent 80%)`,
                        boxShadow: `0 0 60px ${glowColor}40, 0 0 120px ${coreColor}20`,
                        transform: `translate(${position.x * 30}px, ${position.y * 30}px) scale(${1 + Math.abs(position.x) * 0.05})`,
                    }}
                >
                    {/* Inner Core Bloom for extra depth */}
                    <div
                        className="absolute inset-0 rounded-full mix-blend-overlay opacity-50"
                        style={{
                            background: `linear-gradient(${135 + position.x * 45}deg, rgba(255,255,255,0.8), transparent 60%)`
                        }}
                    />
                </div>
            </div>

            {/* Ambient Back Glow (Static) */}
            <div
                className="absolute inset-0 rounded-full blur-3xl opacity-20 -z-10"
                style={{ background: coreColor, transform: 'scale(1.5)' }}
            />
        </div>
    )
}
