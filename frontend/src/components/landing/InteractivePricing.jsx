"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaTimes, FaBolt, FaRobot } from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

// ─── Data ─────────────────────────────────────────────────────────────────────
const PLANS = [
    {
        id: "TIER.01",
        name: "Free",
        badge: null,
        monthlyPrice: 0,
        yearlyPrice: 0,
        monthlyCredits: "10 credits (one-time trial)",
        yearlyCredits: "10 credits (one-time trial)",
        desc: "Perfect for manual productivity tracking.",
        cta: "Get Started",
        variant: "default",       // Card variant
        buttonVariant: "ghost",   // Button variant
        features: [
            { label: "200 tasks / month", included: true },
            { label: "50 schedules / month", included: true },
            { label: "30 behavior logs / month", included: true },
            { label: "AI assistant access", included: false },
            { label: "Real-time web data", included: false },
            { label: "Voice interaction", included: false },
        ],
    },
    {
        id: "TIER.02",
        name: "Pro",
        badge: "Most Popular",
        monthlyPrice: 29,
        yearlyPrice: 299,
        monthlyCredits: "300 AI credits / month",
        yearlyCredits: "3,600 AI credits / year",
        desc: "Best for professionals who want AI-powered productivity.",
        cta: "Start Pro",
        variant: "filled",        // Card variant — tinted, highlighted
        buttonVariant: "primary", // Button variant — solid cyan CTA
        features: [
            { label: "300 tasks / month", included: true },
            { label: "100 schedules / month", included: true },
            { label: "50 behavior logs / month", included: true },
            { label: "AI chat (text)", included: true },
            { label: "Real-time web data", included: true },
            { label: "Voice interaction", included: false },
        ],
    },
    {
        id: "TIER.03",
        name: "Pro+",
        badge: "Best Value",
        monthlyPrice: 79,
        yearlyPrice: 799,
        monthlyCredits: "900 AI credits / month",
        yearlyCredits: "10,800 AI credits / year",
        desc: "For power users who want a complete AI productivity partner.",
        cta: "Start Pro+",
        variant: "outline",       // Card variant — cyan border
        buttonVariant: "outline", // Button variant — transparent with cyan border
        features: [
            { label: "1,000 tasks / month", included: true },
            { label: "500 schedules / month", included: true },
            { label: "100 behavior logs / month", included: true },
            { label: "AI chat (text)", included: true },
            { label: "Real-time web data", included: true },
            { label: "Voice interaction (STT + TTS)", included: true },
        ],
    },
];

const TOPUPS = [
    { price: 29, credits: 200 },
    { price: 49, credits: 450 },
    { price: 99, credits: 1000 },
];

const TABLE_ROWS = [
    { label: "Tasks / month", values: ["200", "300", "1,000"] },
    { label: "Schedules / month", values: ["50", "100", "500"] },
    { label: "Behavior logs / month", values: ["30", "50", "100"] },
    { label: "AI assistant", values: [null, "Text", "Text + Voice"] },
    { label: "Real-time web data", values: [null, true, true] },
    { label: "Voice (STT + TTS)", values: [null, null, true] },
    { label: "AI credits", values: ["10 (trial)", "300 / mo", "900 / mo"] },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function InteractivePricing() {
    const [isYearly, setIsYearly] = useState(false);

    const getPrice = (p) => p.monthlyPrice === 0 ? "Free" : isYearly ? `₹${p.yearlyPrice}` : `₹${p.monthlyPrice}`;
    const getPeriod = (p) => p.monthlyPrice === 0 ? "" : isYearly ? "/year" : "/month";
    const getCredits = (p) => isYearly ? p.yearlyCredits : p.monthlyCredits;
    const yearlyDiscount = (mo, yr) => Math.round(((mo * 12 - yr) / (mo * 12)) * 100);

    return (
        <section className="py-12 md:py-24 px-4 md:px-8 bg-black" id="pricing">
            <div className="max-w-6xl mx-auto">

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-20 gap-8 border-b border-white/10 pb-8">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-600 mb-3">
                            [PRICING_MODULE]
                        </p>
                        <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">
                            Simple Pricing.
                            <br />
                            <span className="text-cyan-400">Real Value.</span>
                        </h2>
                        <p className="text-gray-500 font-mono text-xs mt-4 max-w-sm">
                            No hidden fees. No token confusion. Upgrade or downgrade anytime.
                        </p>
                    </div>

                    {/* ── Toggle ── */}
                    <div className="flex flex-col items-end gap-2">
                        {isYearly && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 px-3 py-1 rounded-sm"
                            >
                                ✦ Save up to {yearlyDiscount(79, 799)}% with yearly billing
                            </motion.div>
                        )}
                        <div className="flex items-center gap-1 bg-black p-1 rounded-sm border border-white/20 relative">
                            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white/30" />
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white/30" />
                            <button
                                onClick={() => setIsYearly(false)}
                                className={`px-6 py-2 text-xs font-mono font-bold transition-all ${!isYearly ? "bg-white text-black" : "text-gray-500 hover:text-white"}`}
                            >
                                MONTHLY
                            </button>
                            <button
                                onClick={() => setIsYearly(true)}
                                className={`px-6 py-2 text-xs font-mono font-bold transition-all ${isYearly ? "bg-white text-black" : "text-gray-500 hover:text-white"}`}
                            >
                                YEARLY
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Plan Cards ──────────────────────────────────────────── */}
                <div className="grid md:grid-cols-3 gap-5 mb-6">
                    {PLANS.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="relative"
                        >
                            {/* Popular / Best Value badge */}
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1 text-[10px] font-mono font-bold uppercase tracking-widest rounded-sm bg-[var(--color-primary)] text-black">
                                    ✦ {plan.badge}
                                </div>
                            )}

                            <Card
                                variant={plan.variant}
                                shimmer={plan.variant === "filled"}
                                className="h-full flex flex-col"
                            >
                                {/* Plan ID + name + status dot */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="font-mono text-[9px] text-gray-600 mb-1">
                                            [{plan.id}]
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight text-white">
                                            {plan.name}
                                        </h3>
                                    </div>
                                    {plan.variant === "filled" && (
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
                                            <span className="text-[9px] font-mono text-[var(--color-primary)]">RECOMMENDED</span>
                                        </div>
                                    )}
                                </div>

                                {/* Price */}
                                <div className={`mb-5 border-b border-white/5 pb-5 ${isYearly && plan.monthlyPrice === 0 ? 'pb-9.5' : ''}`}>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={isYearly ? "yr" : "mo"}
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 8 }}
                                            transition={{ duration: 0.18 }}
                                            className="flex items-end gap-2"
                                        >
                                            <span className="text-5xl font-black text-white tracking-tighter">
                                                {getPrice(plan)}
                                            </span>
                                            <span className="text-gray-500 text-sm font-mono mb-1">
                                                {getPeriod(plan)}
                                            </span>
                                        </motion.div>
                                    </AnimatePresence>
                                    {isYearly && plan.monthlyPrice > 0 && (
                                        <p className="text-[10px] font-mono text-gray-600 mt-1">
                                            ≈ ₹{Math.round(plan.yearlyPrice / 12)}/month · Save ₹{plan.monthlyPrice * 12 - plan.yearlyPrice}
                                        </p>
                                    )}
                                </div>

                                {/* Credits pill */}
                                <div className="mb-4">
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[var(--color-primary)] border border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] px-2.5 py-1 rounded-sm">
                                        <FaBolt className="w-2.5 h-2.5" />
                                        {getCredits(plan)}
                                    </span>
                                    {isYearly && plan.monthlyPrice > 0 && (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-[9px] font-mono text-cyan-500/70 flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-cyan-500/50" />
                                                Credits roll over monthly during the plan
                                            </p>
                                            <p className="text-[9px] font-mono text-gray-600 flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-gray-600" />
                                                Unused credits expire at end of subscription term
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Desc */}
                                <p className="text-gray-500 text-xs font-mono mb-6 leading-relaxed">
                                    {plan.desc}
                                </p>

                                {/* Flex spacer — absorbs height difference so features + button pin to bottom */}
                                <div className="flex-1" />

                                {/* Features */}
                                <div className="space-y-3 mb-8">
                                    {plan.features.map((feat, j) => (
                                        <div key={j} className="flex items-center gap-3 text-xs font-mono">
                                            {feat.included ? (
                                                <FaCheck className="w-3 h-3 flex-shrink-0 text-[var(--color-primary)]" />
                                            ) : (
                                                <FaTimes className="w-3 h-3 flex-shrink-0 text-gray-700" />
                                            )}
                                            <span className={feat.included ? "text-gray-300" : "text-gray-700"}>
                                                {feat.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <Button variant={plan.buttonVariant} size="md" className="w-full">
                                    {plan.cta}
                                </Button>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* ── Credits note ─────────────────────────────────────────── */}
                <Card variant="ghost" className="mb-20">
                    <div className="flex items-start gap-3">
                        <FaRobot className="text-[var(--color-primary)] w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
                        <p className="text-[11px] font-mono text-gray-500 leading-relaxed">
                            <span className="text-gray-400 font-bold">AI credits</span> are used when interacting with the AI assistant — for chat, voice responses, and real-time web lookups.{" "}
                            <span className="text-[var(--color-primary)] opacity-70">Most users never run out.</span> Need more? Top up anytime below.
                        </p>
                    </div>
                </Card>

                {/* ── Comparison Table ─────────────────────────────────────── */}
                <div className="mb-20">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-600 mb-6">
                        [FEATURE_COMPARISON]
                    </p>
                    <Card variant="default" noPadding>
                        <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                            <table className="w-full border-collapse text-xs font-mono">
                                <thead>
                                    <tr className="border-b border-white/[0.07]">
                                        <th className="text-left py-4 px-6 text-gray-600 font-normal w-1/3">Feature</th>
                                        {PLANS.map((plan) => (
                                            <th
                                                key={plan.id}
                                                className={`py-4 px-6 font-bold text-center ${plan.variant === "filled" ? "text-[var(--color-primary)]" : "text-gray-400"}`}
                                            >
                                                {plan.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {TABLE_ROWS.map((row, i) => (
                                        <tr
                                            key={i}
                                            className="border-b border-white/[0.04] hover:bg-[var(--color-primary-muted)] transition-colors"
                                        >
                                            <td className="py-4 px-6 text-gray-500">{row.label}</td>
                                            {row.values.map((val, j) => (
                                                <td key={j} className="py-4 px-6 text-center">
                                                    {val === null ? (
                                                        <FaTimes className="w-3 h-3 text-gray-700 mx-auto" />
                                                    ) : val === true ? (
                                                        <FaCheck className="w-3 h-3 mx-auto text-[var(--color-primary)]" />
                                                    ) : (
                                                        <span className={j === 1 ? "text-[var(--color-primary)]" : "text-gray-300"}>
                                                            {val}
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* ── Top-Up Packs ─────────────────────────────────────────── */}
                <div className="mb-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-600 mb-2">
                        [AI_CREDIT_TOPUPS]
                    </p>
                    <p className="text-gray-500 text-xs font-mono mb-8">
                        Need more AI power this month? Top up your credits instantly — no plan change required.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {TOPUPS.map((pack, i) => (
                            <motion.div key={i} whileHover={{ y: -2 }}>
                                <Card variant="default" className="cursor-pointer">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <FaBolt className="text-[var(--color-primary)] w-3 h-3 opacity-70" />
                                                <span className="text-xl font-black text-white tracking-tight">
                                                    {pack.credits}
                                                </span>
                                                <span className="text-[10px] text-gray-600 font-mono">credits</span>
                                            </div>
                                            <p className="text-[10px] text-gray-600 font-mono">
                                                ≈ ₹{(pack.price / pack.credits).toFixed(2)} per credit
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-white">₹{pack.price}</div>
                                            <Button variant="ghost" size="sm" className="mt-2">
                                                Buy now →
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}