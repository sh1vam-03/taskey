"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";

export default function InteractivePricing() {
    const [isYearly, setIsYearly] = useState(false);

    const plans = [
        {
            id: "TIER.01",
            name: "Free",
            price: "₹0",
            period: isYearly ? "/yr" : "/mo",
            credits: "10 CREDITS",
            desc: "Experimental Access.",
            features: ["10 Tasks/mo", "30 Schedules/mo", "Basic Chat"],
            status: "STANDBY"
        },
        {
            id: "TIER.02",
            name: "Pro",
            price: isYearly ? "₹4,999" : "₹499",
            period: isYearly ? "/yr" : "/mo",
            credits: isYearly ? "600 CREDITS" : "50 CREDITS",
            desc: "Professional Bandwidth.",
            highlight: true,
            features: ["Unlimited Tasks", "Voice Mode", "Calendar Sync", "Priority Support"],
            status: "RECOMMENDED"
        },
        {
            id: "TIER.03",
            name: "Plus",
            price: isYearly ? "₹9,999" : "₹999",
            period: isYearly ? "/yr" : "/mo",
            credits: isYearly ? "1080 CREDITS" : "90 CREDITS",
            desc: "Maximum Throughput.",
            features: ["Deep Research", "Custom Workflows", "Team features", "API Access"],
            status: "PREMIUM"
        }
    ];

    return (
        <section className="py-[var(--section-spacing)] px-[var(--container-padding)] bg-black border-t border-white/5" id="pricing">
            <div className="w-full max-w-[var(--container-width)] mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 border-b border-white/10 pb-6">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-white">Pricing</h2>
                        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                            // RESOURCE_ALLOCATION_MATRIX
                        </p>
                    </div>

                    {/* Tech Toggle */}
                    <div className="flex items-center gap-1 bg-black p-1 rounded-sm border border-white/20 relative">
                        {/* Decorative corners for toggle */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white/30" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white/30" />

                        <button
                            onClick={() => setIsYearly(false)}
                            className={`px-6 py-2 text-xs font-mono font-bold transition-all ${!isYearly ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            MONTHLY
                        </button>
                        <button
                            onClick={() => setIsYearly(true)}
                            className={`px-6 py-2 text-xs font-mono font-bold transition-all ${isYearly ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            YEARLY
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`p-8 relative transition-all duration-300 group ${plan.highlight ? 'bg-cyan-950/10 border border-cyan-500/50' : 'bg-black border border-white/10 hover:border-white/30'}`}
                        >
                            {/* Corner Brackets */}
                            <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l transition-colors ${plan.highlight ? 'border-cyan-500' : 'border-white/20 group-hover:border-white/60'}`} />
                            <div className={`absolute top-0 right-0 w-3 h-3 border-t border-r transition-colors ${plan.highlight ? 'border-cyan-500' : 'border-white/20 group-hover:border-white/60'}`} />
                            <div className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l transition-colors ${plan.highlight ? 'border-cyan-500' : 'border-white/20 group-hover:border-white/60'}`} />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r transition-colors ${plan.highlight ? 'border-cyan-500' : 'border-white/20 group-hover:border-white/60'}`} />

                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="font-mono text-[10px] text-gray-500 mb-1">[{plan.id}]</div>
                                    <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-cyan-400' : 'text-white'}`}>{plan.name}</h3>
                                    <div className="text-[10px] font-mono text-cyan-600 border border-cyan-900/30 px-2 py-0.5 inline-block rounded-sm bg-cyan-950/20">
                                        {plan.credits}
                                    </div>
                                </div>
                                {plan.highlight && (
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                        <span className="text-[10px] font-mono text-cyan-500">ONLINE</span>
                                    </div>
                                )}
                            </div>

                            <div className="mb-8 border-b border-white/5 pb-8">
                                <span className="text-5xl font-bold text-white tracking-tighter">{plan.price}</span>
                                <span className="text-gray-500 text-sm ml-2 font-mono">{plan.period}</span>
                            </div>

                            <div className="space-y-4 mb-8">
                                {plan.features.map((feat, j) => (
                                    <div key={j} className="flex items-center gap-3 text-sm text-gray-400 font-mono">
                                        <span className={`w-1 h-1 ${plan.highlight ? 'bg-cyan-500' : 'bg-gray-600'}`} />
                                        {feat}
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant={plan.highlight ? "scanline" : "ghost"}
                                className="w-full"
                            >
                                {plan.highlight ? "Initialize_Pro" : "Start_Validating"}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
