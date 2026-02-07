"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function TermsClient() {
    const lastUpdated = "February 06, 2026";

    // 🔹 RESPONSIVE ORB SIZING
    const [orbSize, setOrbSize] = useState(1000);

    useEffect(() => {
        const updateSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            // Base size on width, but cap it for smaller screens
            let newSize = Math.min(1000, Math.max(600, width * 0.6));

            // Height Constraint for Laptops (1366x768) and smaller
            if (height < 800) {
                newSize = Math.min(newSize, 700);
            }
            setOrbSize(newSize);
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    return (
        <div className="min-h-[100dvh] bg-black text-gray-300 -mt-20 pt-[calc(var(--section-spacing)*1.5)] pb-[var(--section-spacing)] px-[var(--container-padding)] overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-500">
            {/* GLOBAL BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />

                {/* RESPONSIVE AiEnergySphere */}
            </div>

            <div className="w-full max-w-3xl mx-auto relative z-10">
                <div className="mb-16 border-b border-white/10 pb-8">
                    <div className="inline-block border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 rounded-full mb-6">
                        <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest">
                            // SYSTEM_CONTRACT
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tighter">TERMS OF SERVICE</h1>
                    <p className="text-sm font-mono text-gray-500">EFFECTIVE_DATE: {lastUpdated}</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-sm relative overflow-hidden">
                    {/* Tech Decorators */}
                    <div className="absolute top-2 left-2 text-[8px] text-white/20 font-mono">+</div>
                    <div className="absolute top-2 right-2 text-[8px] text-white/20 font-mono">+</div>
                    <div className="absolute bottom-2 left-2 text-[8px] text-white/20 font-mono">+</div>
                    <div className="absolute bottom-2 right-2 text-[8px] text-white/20 font-mono">+</div>

                    <div className="space-y-12 text-lg leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">1. Access Agreement</h2>
                            <p>
                                By initializing a Taskey account or accessing our neural interface, you agree to be bound by these Terms.
                                If you do not agree, do not establish an uplink to our systems.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">2. The AI Paradigm (Disclaimer)</h2>
                            <div className="bg-red-500/10 border-l-2 border-red-500 p-4 rounded-r-md text-base mb-4">
                                <strong>Critical Warning:</strong> Taskey is a probabilistic system, not a deterministic one.
                            </div>
                            <p>
                                Our AI models ("Thinking Partners") analyze patterns to generate suggestions, schedules, and content.
                                While highly advanced, the System may hallucinate or generate inaccurate outputs. You retain full responsibility for verifying all System outputs before execution.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">3. Account Security</h2>
                            <p>
                                You are the architect of your node. You are responsible for maintaining the confidentiality of your cryptographic keys (passwords)
                                and for all activities that occur under your designation.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">4. Acceptable Use</h2>
                            <p>You agree not to use the System to:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400 mt-2">
                                <li>Reverse engineer the neural architecture or interfere with our network latency.</li>
                                <li>Generate harmful, illegal, or malicious payloads.</li>
                                <li>Automate interaction with the interface via unauthorized bots (scrapers).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">5. Termination</h2>
                            <p>
                                We reserve the right to sever your uplink immediately, without prior notice, if you violate these Terms or if your usage patterns degrade the integrity of the collective network.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">6. Limitation of Liability</h2>
                            <p>
                                To the maximum extent permitted by law, Taskey shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the service.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
