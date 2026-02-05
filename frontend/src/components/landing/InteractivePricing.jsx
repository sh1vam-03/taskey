"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";

export default function InteractivePricing() {
    const [isYearly, setIsYearly] = useState(false);

    const plans = [
        {
            name: "Free",
            price: "₹0",
            period: isYearly ? "/yr" : "/mo",
            credits: "10 Credits",
            desc: "For individuals exploring AI.",
            features: ["10 Tasks/mo", "30 Schedules/mo", "Basic Chat"]
        },
        {
            name: "Pro",
            price: isYearly ? "₹4,999" : "₹499",
            period: isYearly ? "/yr" : "/mo",
            credits: isYearly ? "600 Credits" : "50 Credits",
            desc: "For professionals.",
            highlight: true,
            features: ["Unlimited Tasks", "Voice Mode", "Calendar Sync", "Priority Support"]
        },
        {
            name: "Plus",
            price: isYearly ? "₹9,999" : "₹999",
            period: isYearly ? "/yr" : "/mo",
            credits: isYearly ? "1080 Credits" : "90 Credits",
            desc: "For power users.",
            features: ["Deep Research", "Custom Workflows", "Team features", "API Access"]
        }
    ];

    return (
        <section className="py-32 px-6 bg-black" id="pricing">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-white">Pricing</h2>
                        <p className="text-gray-500 text-xl font-light">Start free. Upgrade for power.</p>
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center gap-4 bg-white/5 p-1 rounded-full border border-white/10">
                        <button
                            onClick={() => setIsYearly(false)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!isYearly ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setIsYearly(true)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${isYearly ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Yearly
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 group ${plan.highlight ? 'bg-white/5 border-cyan-500/50' : 'bg-black border-white/10 hover:border-white/30'}`}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-xl font-mono font-bold text-white mb-1">{plan.name}</h3>
                                        <p className="text-xs text-cyan-500 font-mono uppercase tracking-wider">{plan.credits}</p>
                                    </div>
                                    {plan.highlight && (
                                        <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse" />
                                    )}
                                </div>

                                <div className="mb-8">
                                    <span className="text-5xl font-bold text-white tracking-tighter">{plan.price}</span>
                                    <span className="text-gray-500 text-sm ml-2">{plan.period}</span>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {plan.features.map((feat, j) => (
                                        <div key={j} className="flex items-center gap-3 text-sm text-gray-400 border-t border-white/5 pt-3 first:border-0 first:pt-0">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                                            {feat}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                variant={plan.highlight ? "primary" : "outline"}
                                className={`w-full h-14 rounded-2xl text-base font-bold transition-all ${plan.highlight ? 'bg-white text-black hover:scale-[1.02]' : 'border-white/10 hover:bg-white text-white hover:text-black'}`}
                            >
                                Get Started
                            </Button>
                        </div>
                    ))}
                </div>

                <p className="text-center text-gray-600 text-sm mt-12 font-mono">
                    All plans include 10 free credits on signup. Cancel anytime.
                </p>
            </div>
        </section>
    )
}
