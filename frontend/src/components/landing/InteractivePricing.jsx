"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";

export default function InteractivePricing() {
    const [isYearly, setIsYearly] = useState(false);

    const plans = [
        {
            name: "Free Tier",
            price: "₹0",
            period: isYearly ? "/yr" : "/mo",
            credits: isYearly ? "10 AI credits / year" : "10 AI credits / month",
            desc: "Start free and scale as you grow.",
            features: [
                "10 tasks per month", // Wait, user prompt said 30? "30 tasks per month"
                "30 schedules per month",
                "30 behavior patterns",
                "10 free AI credits on signup",
                "Basic AI chat support",
                "Mobile & Web access"
            ]
        },
        {
            name: "Pro",
            price: isYearly ? "₹4,999" : "₹499",
            period: isYearly ? "/yr" : "/mo",
            credits: isYearly ? "600 AI credits / year" : "50 AI credits / month",
            desc: "Most Popular",
            highlight: true,
            features: [
                "Unlimited tasks & schedules",
                "Unlimited behavior patterns",
                isYearly ? "50 AI credits/mo (billed yearly)" : "50 AI credits / month",
                "Advanced AI chat (GPT-4o-mini)",
                "Voice input & output",
                "Priority support",
                "Calendar integrations"
            ]
        },
        {
            name: "Pro Plus",
            price: isYearly ? "₹9,999" : "₹999",
            period: isYearly ? "/yr" : "/mo",
            credits: isYearly ? "1080 AI credits / year" : "90 AI credits / month",
            desc: "For power users & teams.",
            features: [
                "Everything in Pro",
                isYearly ? "90 AI credits/mo (billed yearly)" : "90 AI credits / month",
                "Advanced AI research (Tavily)",
                "Unlimited voice interactions",
                "Custom AI workflows",
                "Team collaboration",
                "Dedicated support"
            ]
        }
    ];

    return (
        <section className="py-32 px-6 bg-black" id="pricing">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-6">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">Simple Pricing</h2>
                    <p className="text-gray-400 text-xl">Choose plans that scale with your ambitions.</p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <span className={`text-sm font-medium ${!isYearly ? "text-white" : "text-gray-500"}`}>Monthly</span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="w-14 h-7 bg-white/10 rounded-full relative p-1 transition-colors hover:bg-white/20"
                        >
                            <motion.div
                                animate={{ x: isYearly ? 28 : 0 }}
                                className="w-5 h-5 bg-cyan-500 rounded-full shadow-lg"
                            />
                        </button>
                        <span className={`text-sm font-medium ${isYearly ? "text-white" : "text-gray-500"}`}>Yearly (Save ~17%)</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`p-8 rounded-3xl border transition-all duration-300 flex flex-col relative ${plan.highlight ? 'bg-[#0a0a0a] border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)] scale-105 z-10' : 'bg-black border-white/10 hover:border-white/20'}`}
                        >
                            {plan.highlight && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                                <p className="text-sm text-cyan-400 font-medium">{plan.credits}</p>
                            </div>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-bold text-white">{plan.price}</span>
                                <span className="text-gray-500">{plan.period}</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feat, j) => (
                                    <li key={j} className="flex items-start gap-3 text-sm text-gray-400">
                                        <span className="text-cyan-500 mt-0.5"><FaCheck /></span>
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant={plan.highlight ? "primary" : "outline"}
                                className={`w-full h-12 rounded-xl text-sm font-bold ${plan.highlight ? 'bg-white text-black hover:bg-gray-200' : 'border-white/10 hover:bg-white/5'}`}
                            >
                                Choose {plan.name}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
