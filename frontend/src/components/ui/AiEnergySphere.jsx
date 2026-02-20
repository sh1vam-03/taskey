"use client";

import React, { useEffect, useRef } from "react";

// Particle buffer stride (floats per particle)
// [ baseX, baseY, baseZ, x, y, z, phase, speed, pSize ]
const S = 9;

export default function AiEnergySphere({
    size = 600,
    particleCount = 1200,
    baseRadius = 200,
    waveStrength = 10,
    rotationSpeed = 0.01,
    hoverRadius = 65,
    repelStrength = 14,
    springStrength = 0.08,
}) {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 9999, y: 9999 });
    const bufRef = useRef(null);
    const rafRef = useRef(null);

    /* ── Mouse ──────────────────────────────────────────────────────────────── */
    useEffect(() => {
        const onMove = (e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            mouseRef.current.x = e.clientX - rect.left - rect.width / 2;
            mouseRef.current.y = e.clientY - rect.top - rect.height / 2;
        };
        const onLeave = () => { mouseRef.current.x = mouseRef.current.y = 9999; };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseleave", onLeave);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseleave", onLeave);
        };
    }, []);

    /* ── Init particles ─────────────────────────────────────────────────────── */
    useEffect(() => {
        const buf = new Float32Array(particleCount * S);
        for (let i = 0; i < particleCount; i++) {
            const o = i * S;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = baseRadius + Math.pow(Math.random(), 0.4) * 12;
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            buf[o] = buf[o + 3] = x;
            buf[o + 1] = buf[o + 4] = y;
            buf[o + 2] = buf[o + 5] = z;
            buf[o + 6] = Math.random() * Math.PI * 2;
            buf[o + 7] = 0.4 + Math.random() * 0.6;
            buf[o + 8] = 0.55 + Math.random() * 1.05;
        }
        bufRef.current = buf;
    }, [particleCount, baseRadius]);

    /* ── Render loop ────────────────────────────────────────────────────────── */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        const dpr = window.devicePixelRatio || 1;

        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const hoverRSq = hoverRadius * hoverRadius;
        const BUCKETS = 12;

        const slotPX = new Float32Array(particleCount);
        const slotPY = new Float32Array(particleCount);
        const slotR = new Float32Array(particleCount);
        const slotBkt = new Uint8Array(particleCount);
        const bktCount = new Int32Array(BUCKETS);
        const bktSlots = Array.from({ length: BUCKETS }, () => new Uint16Array(particleCount));

        let t = 0;

        const frame = () => {
            t += 1;
            const buf = bufRef.current;
            if (!buf) { rafRef.current = requestAnimationFrame(frame); return; }

            ctx.clearRect(0, 0, size, size);

            // ── Cyan atmospheric inner glow ──────────────────────────────────
            // Cyan is HSL ~185°, so we lock hue drift in that range
            const hueBase = 185 + Math.sin(t * 0.005) * 8; // subtle ±8° drift around 185

            const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
            bg.addColorStop(0, `hsla(${hueBase},100%,65%,0.09)`);
            bg.addColorStop(0.5, `hsla(${hueBase + 5},90%,45%,0.04)`);
            bg.addColorStop(1, "hsla(0,0%,0%,0)");
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, size, size);

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const cosR = Math.cos(t * rotationSpeed);
            const sinR = Math.sin(t * rotationSpeed);

            bktCount.fill(0);

            // ── Physics pass ─────────────────────────────────────────────────
            for (let i = 0; i < particleCount; i++) {
                const o = i * S;

                const wave = Math.sin(t * 0.018 * buf[o + 7] + buf[o + 6]) * waveStrength;
                const bx = buf[o] * cosR - buf[o + 2] * sinR + wave;
                const bz = buf[o] * sinR + buf[o + 2] * cosR;
                const by = buf[o + 1] + Math.cos(t * 0.014 + buf[o + 6]) * wave;

                buf[o + 3] += (bx - buf[o + 3]) * springStrength;
                buf[o + 4] += (by - buf[o + 4]) * springStrength;
                buf[o + 5] += (bz - buf[o + 5]) * springStrength;

                const rawD = (buf[o + 5] + baseRadius) / (baseRadius * 2);
                const depth = rawD < 0 ? 0 : rawD > 1 ? 1 : rawD;
                const sc = 0.55 + depth;
                const px = buf[o + 3] * sc;
                const py = buf[o + 4] * sc;

                const dx = px - mx;
                const dy = py - my;
                const dSq = dx * dx + dy * dy;
                if (dSq < hoverRSq) {
                    const len = Math.sqrt(buf[o + 3] * buf[o + 3] + buf[o + 4] * buf[o + 4] + buf[o + 5] * buf[o + 5]) || 1;
                    const force = (1 - dSq / hoverRSq) * repelStrength;
                    buf[o + 3] += buf[o + 3] / len * force;
                    buf[o + 4] += buf[o + 4] / len * force;
                    buf[o + 5] += buf[o + 5] / len * force;
                }

                const bkt = Math.min(BUCKETS - 1, (depth * BUCKETS) | 0);
                slotPX[i] = px;
                slotPY[i] = py;
                slotR[i] = Math.max(0.4, buf[o + 8] * sc);
                slotBkt[i] = bkt;
                bktSlots[bkt][bktCount[bkt]++] = i;
            }

            // ── Batch draw — cyan palette per depth bucket ───────────────────
            ctx.shadowBlur = 0;

            for (let b = 0; b < BUCKETS; b++) {
                const count = bktCount[b];
                if (!count) continue;

                const depth = (b + 0.5) / BUCKETS;

                // Cyan hue range: 180° (aqua) → 195° (cyan-blue) by depth
                const hue = (180 + depth * 15) | 0;
                // Saturation full, lightness 55% → 85% front-to-back
                const lum = (55 + depth * 30) | 0;
                const alpha = (0.08 + depth * 0.92).toFixed(2);

                ctx.fillStyle = `hsla(${hue},100%,${lum}%,${alpha})`;
                ctx.beginPath();

                const slots = bktSlots[b];
                for (let s = 0; s < count; s++) {
                    const i = slots[s];
                    const px = cx + slotPX[i];
                    const py = cy + slotPY[i];
                    const r = slotR[i];
                    ctx.moveTo(px + r, py);
                    ctx.arc(px, py, r, 0, Math.PI * 2);
                }
                ctx.fill();
            }

            // ── Cyan rim glow overlay ─────────────────────────────────────────
            const rim = ctx.createRadialGradient(cx, cy, baseRadius * 0.72, cx, cy, baseRadius * 1.18);
            rim.addColorStop(0, "hsla(0,0%,0%,0)");
            rim.addColorStop(0.65, `hsla(185,100%,75%,0.07)`);
            rim.addColorStop(1, "hsla(0,0%,0%,0)");
            ctx.fillStyle = rim;
            ctx.fillRect(0, 0, size, size);

            rafRef.current = requestAnimationFrame(frame);
        };

        frame();
        return () => cancelAnimationFrame(rafRef.current);
    }, [size, waveStrength, rotationSpeed, baseRadius, hoverRadius, repelStrength, springStrength, particleCount]);

    return (
        <div
            style={{
                position: "relative",
                width: size,
                height: size,
                // No background, no border-radius, no box-shadow — canvas only
                background: "transparent",
            }}
        >
            <canvas ref={canvasRef} style={{ display: "block" }} />
        </div>
    );
}