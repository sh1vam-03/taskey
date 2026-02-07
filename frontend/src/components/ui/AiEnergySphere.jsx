"use client";

import React, { useEffect, useRef } from "react";

export default function AiEnergySphere({
    size =600,
    particleCount = 1000,
    baseRadius = 200,
    waveStrength = 10,
    rotationSpeed = 0.01,
    hoverRadius = 65,
    repelStrength = 14,
    springStrength = 0.08,
}) {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 9999, y: 9999 });
    const particlesRef = useRef([]);
    const rafRef = useRef(null);

    /* ===============================
       Mouse tracking (SCREEN SPACE)
    =============================== */
    useEffect(() => {
        const move = (e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            mouseRef.current.x = e.clientX - rect.left - rect.width / 2;
            mouseRef.current.y = e.clientY - rect.top - rect.height / 2;
        };

        const leave = () => {
            mouseRef.current.x = 9999;
            mouseRef.current.y = 9999;
        };

        window.addEventListener("mousemove", move);
        window.addEventListener("mouseleave", leave);
        return () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseleave", leave);
        };
    }, []);

    /* ===============================
       Particle initialization
    =============================== */
    useEffect(() => {
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const bias = Math.pow(Math.random(), 0.4);
            const r = baseRadius + bias * 12;

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            particles.push({
                baseX: x,
                baseY: y,
                baseZ: z,
                x, y, z,
                phase: Math.random() * Math.PI * 2,
                speed: 0.4 + Math.random() * 0.6,
                size: 0.55 + Math.random() * 1.05,
            });
        }

        particlesRef.current = particles;
    }, [particleCount, baseRadius]);

    /* ===============================
       Animation loop (CORRECT SPACE)
    =============================== */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;

        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        ctx.scale(dpr, dpr);

        let t = 0;
        const hoverRadiusSq = hoverRadius * hoverRadius;

        const animate = () => {
            t += 1;
            ctx.clearRect(0, 0, size, size);
            ctx.save();
            ctx.translate(size / 2, size / 2);

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;

            const cosR = Math.cos(t * rotationSpeed);
            const sinR = Math.sin(t * rotationSpeed);

            for (const p of particlesRef.current) {
                /* ---- base surface ---- */
                const wave =
                    Math.sin(t * 0.018 * p.speed + p.phase) * waveStrength;

                const baseX = p.baseX * cosR - p.baseZ * sinR + wave;
                const baseZ = p.baseX * sinR + p.baseZ * cosR;
                const baseY =
                    p.baseY + Math.cos(t * 0.014 + p.phase) * wave;

                /* ---- spring toward base ---- */
                p.x += (baseX - p.x) * springStrength;
                p.y += (baseY - p.y) * springStrength;
                p.z += (baseZ - p.z) * springStrength;

                /* ---- depth & projection ---- */
                const rawDepth = (p.z + baseRadius) / (baseRadius * 2);
                const depth = Math.min(1, Math.max(0, rawDepth));
                const scale = 0.55 + depth;

                const px = p.x * scale;
                const py = p.y * scale;

                /* ---- cursor interaction (PROJECTED SPACE ✔) ---- */
                const dx = px - mx;
                const dy = py - my;
                const distSq = dx * dx + dy * dy;

                if (distSq < hoverRadiusSq) {
                    // surface normal
                    const len = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) || 1;
                    const nx = p.x / len;
                    const ny = p.y / len;
                    const nz = p.z / len;

                    const k = 1 - distSq / hoverRadiusSq;
                    const force = k * repelStrength;

                    p.x += nx * force;
                    p.y += ny * force;
                    p.z += nz * force;
                }

                /* ---- draw ---- */
                const radius = Math.max(0.5, p.size * scale);

                ctx.beginPath();
                ctx.fillStyle = `hsla(${180 + depth * 20}, 100%, 70%, ${0.2 + depth * 0.8})`;
                ctx.shadowBlur = distSq < hoverRadiusSq ? 4 : 2;
                ctx.shadowColor = ctx.fillStyle;
                ctx.arc(px, py, radius, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
            rafRef.current = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(rafRef.current);
    }, [
        size,
        waveStrength,
        rotationSpeed,
        baseRadius,
        hoverRadius,
        repelStrength,
        springStrength,
    ]);

    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
        >
            <canvas ref={canvasRef} />
        </div>
    );
}
