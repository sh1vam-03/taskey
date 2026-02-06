"use client";
import React from "react";
import { FaLock, FaShieldAlt, FaServer, FaUserSecret } from "react-icons/fa";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-black text-white -mt-20 pt-32 pb-20 px-4 overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-500">
            {/* GLOBAL BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* HERO */}
                <div className="text-center mb-24">
                    <div className="inline-block border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 rounded-full mb-8">
                        <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                            // SYSTEM_DEFENSE: ACTIVE
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-white">
                        Security Architecture
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Security is not a feature; it is the substrate. <br />
                        We engineer zero-trust environments for your neural data.
                    </p>
                </div>

                {/* DEFENSE MATRIX */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 rounded-sm overflow-hidden mb-32 border border-white/10">
                    {[
                        {
                            title: "End-to-End Encryption",
                            desc: "All data in transit is secured via TLS 1.3. Data at rest is encrypted using AES-256 GCM standards within isolated cloud shards.",
                            icon: <FaLock />
                        },
                        {
                            title: "AI Safety Barriers",
                            desc: "Our Neural Engine implements strict input sanitization to prevent prompt injection attacks and ensures data from one user never leaks to another's context.",
                            icon: <FaShieldAlt />
                        },
                        {
                            title: "Infrastructure Isolation",
                            desc: "We utilize ephemeral compute instances that spin down immediately after processing, minimizing the attack surface for persistent threats.",
                            icon: <FaServer />
                        },
                        {
                            title: "Human Access Control",
                            desc: "No human engineer can access user data without explicit cryptographic consent keys generated during support inquiries.",
                            icon: <FaUserSecret />
                        }
                    ].map((item, i) => (
                        <div key={i} className="bg-black p-10 group hover:bg-neutral-900/30 transition-colors relative flex flex-col justify-between h-full">
                            {/* Tech Decorators */}
                            <div className="absolute top-2 left-2 text-[8px] text-white/20 font-mono">+</div>
                            <div className="absolute top-2 right-2 text-[8px] text-white/20 font-mono">+</div>
                            <div className="absolute bottom-2 left-2 text-[8px] text-white/20 font-mono">+</div>
                            <div className="absolute bottom-2 right-2 text-[8px] text-white/20 font-mono">+</div>

                            <div className="absolute top-6 right-6 text-2xl text-neutral-800 group-hover:text-cyan-500/50 transition-colors duration-500">
                                {item.icon}
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                                {/* Expanding Line */}
                                <div className="h-px w-8 bg-white/20 my-4 group-hover:w-full group-hover:bg-cyan-500/50 transition-all duration-500" />
                                <p className="text-gray-500 leading-relaxed text-sm font-mono">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* REPORTING */}
                <div className="border border-white/10 bg-white/5 p-8 md:p-12 rounded-sm text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">White Hat Program</h3>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                        We welcome collaboration with the security research community.
                        If you identify a vulnerability in the Neural Architecture, report it immediately.
                    </p>
                    <Link href="mailto:security@taskey.ai">
                        <Button variant="scanline" size="lg" className="uppercase tracking-wider">
                            Report Vulnerability
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
