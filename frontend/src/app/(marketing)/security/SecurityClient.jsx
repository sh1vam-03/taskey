"use client";
import React from "react";
import { FaLock, FaShieldAlt, FaServer, FaUserSecret } from "react-icons/fa";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function SecurityClient() {
    return (
        <div className="min-h-[100dvh] bg-black text-white -mt-20 pt-[calc(var(--section-spacing)*1.5)] pb-[var(--section-spacing)] px-[var(--container-padding)] overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-500">
            {/* GLOBAL BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />

                {/* RESPONSIVE AiEnergySphere */}
            </div>

            <div className="w-full max-w-[var(--container-width)] mx-auto relative z-10">
                {/* HERO */}
                <div className="text-center mb-12 md:mb-24">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-white">
                        Security First
                    </h1>
                    <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        We take security seriously. Your data is encrypted, isolated, and protected using modern industry standards. TASKTIME is designed with a security-first architecture to safeguard your information.
                    </p>
                </div>

                {/* DEFENSE MATRIX */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 rounded-sm overflow-hidden mb-16 md:mb-32 border border-white/10">
                    {[
                        {
                            title: "Data Encryption",
                            desc: "All data is encrypted in transit using TLS 1.3 and encrypted at rest using industry-standard AES-256 encryption. This ensures your information remains protected during transmission and storage.",
                            icon: <FaLock />
                        },
                        {
                            title: "AI Data Isolation",
                            desc: "User data is logically isolated. One user's data is never accessible to another. AI processing does not share context across accounts.",
                            icon: <FaShieldAlt />
                        },
                        {
                            title: "Secure Infrastructure",
                            desc: "We use secure cloud infrastructure with strict access controls, network monitoring, and continuous updates to reduce vulnerabilities and protect against threats.",
                            icon: <FaServer />
                        },
                        {
                            title: "Access Control & Permissions",
                            desc: "Access to production systems is restricted to authorized personnel only. Internal access is logged, monitored, and granted strictly on a need-to-know basis.",
                            icon: <FaUserSecret />
                        }
                    ].map((item, i) => (
                        <div key={i} className="bg-black p-6 md:p-10 group hover:bg-neutral-900/30 transition-colors relative flex flex-col justify-between h-full">
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
                        If you believe you have discovered a security vulnerability, please report it responsibly. We appreciate responsible disclosure and will review all valid security reports promptly.
                    </p>
                    <Link href="mailto:security@tasktime.in">
                        <Button variant="scanline" size="lg" className="uppercase tracking-wider">
                            Report Vulnerability
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
