"use client";
import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CallToAction() {
    return (
        <section className="relative py-32 px-4 bg-black overflow-hidden border-t border-white/5">
            {/* Background Decorators */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
                {/* Tech Label */}
                <div className="inline-block border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full mb-4">
                    <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest animate-pulse">
                        ● READY_TO_INIT
                    </span>
                </div>

                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 pb-4">
                    Augment your <span className="text-cyan-400">cortex</span> today.
                </h2>

                <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Stop managing. Start orchestrating. Join the neural network of
                    high-performance thinkers who have already upgraded.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
                    <Link href="/signup">
                        <Button variant="scanline" size="lg">
                            INITIALIZE_PROTOCOL_V1
                        </Button>
                    </Link>
                </div>

                {/* Bottom System Text */}
                <div className="pt-12 font-mono text-xs text-gray-600 uppercase tracking-widest">
                    System Capacity: 98% // Waiting for user input...
                </div>
            </div>
        </section>
    );
}
