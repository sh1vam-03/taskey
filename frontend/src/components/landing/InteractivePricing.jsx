"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaTimes, FaBolt, FaMicrophone, FaGlobe, FaRobot } from "react-icons/fa";

// ─── Minimal Button shim (replace with your own Button component) ────────────
function Button({ children, variant = "default", className = "", ...props }) {
    const base =
        "relative inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-all duration-200 focus:outline-none";
    const variants = {
        scanline:
            "bg-cyan-500 text-black hover:bg-cyan-400 active:scale-[.98] shadow-[0_0_20px_rgba(0,255,255,0.25)]",
        ghost:
            "border border-white/20 text-white hover:border-white/50 hover:bg-white/5 active:scale-[.98]",
        outline:
            "border border-cyan-500/40 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-950/30 active:scale-[.98]",
    };
    return (
        <button className={`${base} ${variants[variant] ?? variants.ghost} ${className}`} {...props}>
            {children}
        </button>
    );
}

// ─── Data ────────────────────────────────────────────────────────────────────
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
        status: "STANDBY",
        cta: "Get Started",
        highlight: false,
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
        status: "RECOMMENDED",
        cta: "Start Pro",
        highlight: true,
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
        status: "PREMIUM",
        cta: "Start Pro+",
        highlight: false,
        isPremium: true,
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

    const getPrice = (plan) => {
        if (plan.monthlyPrice === 0) return "Free";
        return isYearly ? `₹${plan.yearlyPrice}` : `₹${plan.monthlyPrice}`;
    };

    const getPeriod = (plan) => {
        if (plan.monthlyPrice === 0) return "";
        return isYearly ? "/year" : "/month";
    };

    const getCredits = (plan) =>
        isYearly ? plan.yearlyCredits : plan.monthlyCredits;

    const yearlyDiscount = (monthly, yearly) =>
        Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100);

    return (
        <section className="py-24 px-4 md:px-8 bg-black min-h-screen" id="pricing">
            {/* ── Header ── */}
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 border-b border-white/10 pb-8">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-600 mb-3">
                            [PRICING_MODULE]
                        </p>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">
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

                {/* ── Plan Cards ── */}
                <div className="grid md:grid-cols-3 gap-5 mb-6">
                    {PLANS.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className={`relative p-8 transition-all duration-300 group flex flex-col ${plan.highlight
                                    ? "bg-cyan-950/10 border border-cyan-500/60 shadow-[0_0_40px_rgba(0,255,255,0.07)]"
                                    : plan.isPremium
                                        ? "bg-white/[0.02] border border-white/15 hover:border-white/30"
                                        : "bg-black border border-white/10 hover:border-white/25"
                                }`}
                        >
                            {/* Corner brackets */}
                            {[
                                "top-0 left-0 border-t border-l",
                                "top-0 right-0 border-t border-r",
                                "bottom-0 left-0 border-b border-l",
                                "bottom-0 right-0 border-b border-r",
                            ].map((pos, k) => (
                                <div
                                    key={k}
                                    className={`absolute ${pos} w-3 h-3 transition-colors ${plan.highlight
                                            ? "border-cyan-500"
                                            : "border-white/20 group-hover:border-white/50"
                                        }`}
                                />
                            ))}

                            {/* Badge */}
                            {plan.badge && (
                                <div
                                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] font-mono font-bold uppercase tracking-widest rounded-sm ${plan.highlight
                                            ? "bg-cyan-500 text-black"
                                            : "bg-white text-black"
                                        }`}
                                >
                                    ✦ {plan.badge}
                                </div>
                            )}

                            {/* Plan ID + Name */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="font-mono text-[9px] text-gray-600 mb-1">
                                        [{plan.id}]
                                    </div>
                                    <h3
                                        className={`text-2xl font-black tracking-tight ${plan.highlight
                                                ? "text-cyan-400"
                                                : plan.isPremium
                                                    ? "text-white"
                                                    : "text-gray-200"
                                            }`}
                                    >
                                        {plan.name}
                                    </h3>
                                </div>
                                {plan.highlight && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                        <span className="text-[9px] font-mono text-cyan-500">ACTIVE</span>
                                    </div>
                                )}
                            </div>

                            {/* Price */}
                            <div className="mb-2 border-b border-white/5 pb-6">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={isYearly ? "yearly" : "monthly"}
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
                            <div className="mb-5">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-cyan-500 border border-cyan-900/40 bg-cyan-950/20 px-2.5 py-1 rounded-sm">
                                    <FaBolt className="w-2.5 h-2.5" />
                                    {getCredits(plan)}
                                </span>
                            </div>

                            {/* Desc */}
                            <p className="text-gray-500 text-xs font-mono mb-7 leading-relaxed">
                                {plan.desc}
                            </p>

                            {/* Features */}
                            <div className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feat, j) => (
                                    <div key={j} className="flex items-center gap-3 text-xs font-mono">
                                        {feat.included ? (
                                            <FaCheck
                                                className={`w-3 h-3 flex-shrink-0 ${plan.highlight ? "text-cyan-400" : "text-gray-400"
                                                    }`}
                                            />
                                        ) : (
                                            <FaTimes className="w-3 h-3 flex-shrink-0 text-gray-700" />
                                        )}
                                        <span
                                            className={feat.included ? "text-gray-300" : "text-gray-700"}
                                        >
                                            {feat.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant={plan.highlight ? "scanline" : plan.isPremium ? "outline" : "ghost"}
                                className="w-full"
                            >
                                {plan.cta}
                            </Button>
                        </motion.div>
                    ))}
                </div>

                {/* ── Credits note ── */}
                <div className="flex items-start gap-3 border border-white/5 bg-white/[0.02] p-4 rounded-sm mb-20">
                    <FaRobot className="text-cyan-700 w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] font-mono text-gray-500 leading-relaxed">
                        <span className="text-gray-400 font-bold">AI credits</span> are used when interacting with the AI assistant — for chat, voice responses, and real-time web lookups.{" "}
                        <span className="text-cyan-700">Most users never run out.</span> Need more? Top up anytime below.
                    </p>
                </div>

                {/* ── Comparison Table ── */}
                <div className="mb-20">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-600 mb-6">
                        [FEATURE_COMPARISON]
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-xs font-mono">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-4 pr-8 text-gray-600 font-normal w-1/3">Feature</th>
                                    {PLANS.map((plan) => (
                                        <th
                                            key={plan.id}
                                            className={`py-4 px-6 font-bold text-center ${plan.highlight ? "text-cyan-400" : "text-gray-300"
                                                }`}
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
                                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="py-4 pr-8 text-gray-500">{row.label}</td>
                                        {row.values.map((val, j) => (
                                            <td key={j} className="py-4 px-6 text-center">
                                                {val === null ? (
                                                    <FaTimes className="w-3 h-3 text-gray-700 mx-auto" />
                                                ) : val === true ? (
                                                    <FaCheck
                                                        className={`w-3 h-3 mx-auto ${j === 1 ? "text-cyan-500" : "text-gray-400"
                                                            }`}
                                                    />
                                                ) : (
                                                    <span
                                                        className={j === 1 ? "text-cyan-400" : "text-gray-300"}
                                                    >
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
                </div>

                {/* ── Top-Up Packs ── */}
                <div className="mb-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-600 mb-2">
                        [AI_CREDIT_TOPUPS]
                    </p>
                    <p className="text-gray-500 text-xs font-mono mb-8">
                        Need more AI power this month? Top up your credits instantly — no plan change required.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {TOPUPS.map((pack, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -2 }}
                                className="relative border border-white/10 hover:border-cyan-800/50 bg-black p-6 flex items-center justify-between gap-4 transition-all group cursor-pointer"
                            >
                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-cyan-800/60 transition-colors" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-cyan-800/60 transition-colors" />

                                <div>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <FaBolt className="text-cyan-600 w-3 h-3" />
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
                                    <button className="text-[10px] font-mono text-cyan-600 hover:text-cyan-400 transition-colors mt-1 underline underline-offset-2">
                                        Buy now →
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}