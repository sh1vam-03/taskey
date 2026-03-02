"use client";
import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

const CONTAINER_CLASS = "w-full max-w-[var(--container-width)] mx-auto px-[var(--container-padding)]";

export default function CallToAction() {
    return (
        <section className={`relative py-[var(--section-spacing)] ${CONTAINER_CLASS} bg-black overflow-hidden border-t border-white/5`}>
            {/* Background Decorators */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-[var(--container-width)] mx-auto text-center space-y-8">
                {/* Tech Label */}
                <div className="inline-block border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full mb-4">
                    <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest animate-pulse">
                        Start Today
                    </span>
                </div>

                <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 pb-4">
                    Take control of your time with <span className="text-cyan-400">AI.</span>
                </h2>

                <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    TASKTIME helps you plan, prioritize, and execute effortlessly.
                    Let AI handle the complexity so you can focus on what truly matters.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
                    <Link href="/signup">
                        <Button variant="scanline" size="lg">
                            Start Planning Smarter
                        </Button>
                    </Link>
                </div>

                {/* Bottom System Text */}
                <div className="pt-12 font-mono text-xs text-gray-600 uppercase tracking-widest">
                    Free plan available. Upgrade anytime.
                </div>
            </div>
        </section>
    );
}
