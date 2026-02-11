"use client";
import React, { useEffect, useState } from "react";
import billingService from "@/services/billing.service";
import { PageHeader } from "@/components/dashboard/PageHeader";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import { FaCheck, FaCrown, FaCreditCard } from "react-icons/fa";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function BillingPage() {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isYearly, setIsYearly] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSub = async () => {
            setLoading(true);
            try {
                const data = await billingService.getCurrentSubscription();
                setSubscription(data);
            } catch (err) {
                console.error("Failed to load subscription", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSub();
    }, []);

    const handleUpgrade = async (plan) => {
        alert(`Upgrade to ${plan} logic coming soon (Requires Razorpay integration)`);
        // await billingService.subscribe(plan, "MONTHLY");
    };

    const StatusBadge = ({ active }) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${active ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}>
            {active ? "Active" : "Inactive"}
        </span>
    );

    const currentPlan = subscription?.plan || "FREE";

    return (
        <div className="space-y-8">
            <PageHeader
                title="System Resources"
                subtitle="Upgrade your neural network capacity and storage."
                action={
                    <div className="text-xs font-mono text-gray-500 uppercase border border-white/10 px-3 py-1 rounded bg-black/30">
                        BILLING_CYCLE: MONTHLY
                    </div>
                }
            />

            {/* Current Plan Summary */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <FaCrown className="w-32 h-32 text-white -rotate-12 translate-x-8 -translate-y-8" />
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <h2 className="text-cyan-500 text-xs font-mono font-bold uppercase tracking-widest mb-2">Active Subscription</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-4xl font-black text-white tracking-tight">{currentPlan}</span>
                            <StatusBadge active={subscription?.isActive || currentPlan === 'FREE'} />
                        </div>
                        {subscription?.nextBillingAt && (
                            <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Renewal Date: <span className="text-white font-mono">{new Date(subscription.nextBillingAt).toLocaleDateString()}</span>
                            </p>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <div className="text-right hidden md:block">
                            <div className="text-xs text-gray-500 uppercase font-mono">Credits Remaining</div>
                            <div className="text-2xl font-bold text-white">450 <span className="text-sm text-gray-500 font-normal">/ 500</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tech Toggle */}
            <div className="flex justify-center mb-8">
                <div className="flex items-center gap-1 bg-black p-1 rounded-sm border border-white/20 relative">
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

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* FREE */}
                <div className={`p-8 relative transition-all duration-300 group ${currentPlan === 'FREE' ? 'bg-zinc-900/50 border-white/10' : 'bg-black border border-white/10 hover:border-white/30'}`}>
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20 group-hover:border-white/60 transition-colors" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20 group-hover:border-white/60 transition-colors" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20 group-hover:border-white/60 transition-colors" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20 group-hover:border-white/60 transition-colors" />

                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="font-mono text-[10px] text-gray-500 mb-1">[TIER.01]</div>
                            <h3 className="text-xl font-bold text-gray-300 mb-1">Starter</h3>
                            <div className="text-[10px] font-mono text-cyan-600 border border-cyan-900/30 px-2 py-0.5 inline-block rounded-sm bg-cyan-950/20">
                                10 CREDITS
                            </div>
                        </div>
                    </div>

                    <div className="mb-8 border-b border-white/5 pb-8">
                        <span className="text-4xl font-bold text-white tracking-tighter">$0</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {["10 Tasks/mo", "30 Schedules/mo", "Basic Chat"].map((feat, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-gray-400 font-mono">
                                <span className="w-1 h-1 bg-gray-600" />
                                {feat}
                            </li>
                        ))}
                    </ul>

                    <Button
                        disabled={currentPlan === 'FREE'}
                        variant="ghost"
                        className="w-full"
                    >
                        {currentPlan === 'FREE' ? "Current System" : "Downgrade"}
                    </Button>
                </div>

                {/* PRO */}
                <div className={`p-8 relative transition-all duration-300 group ${currentPlan === 'PRO' ? 'bg-cyan-950/10 border-cyan-500/50' : 'bg-black border border-white/10 hover:border-cyan-500/30'}`}>
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500 transition-colors" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500 transition-colors" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-500 transition-colors" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500 transition-colors" />

                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="font-mono text-[10px] text-gray-500 mb-1">[TIER.02]</div>
                            <h3 className="text-xl font-bold text-cyan-400 mb-1">Pro</h3>
                            <div className="text-[10px] font-mono text-cyan-600 border border-cyan-900/30 px-2 py-0.5 inline-block rounded-sm bg-cyan-950/20">
                                {isYearly ? "600 CREDITS" : "50 CREDITS"}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-[10px] font-mono text-cyan-500">ONLINE</span>
                        </div>
                    </div>

                    <div className="mb-8 border-b border-white/5 pb-8">
                        <span className="text-4xl font-bold text-white tracking-tighter">{isYearly ? "$99" : "$9"}</span>
                        <span className="text-gray-500 text-sm ml-2 font-mono">{isYearly ? "/yr" : "/mo"}</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {["Unlimited Tasks", "Voice Mode", "Calendar Sync", "Priority Support"].map((feat, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-gray-400 font-mono">
                                <span className="w-1 h-1 bg-cyan-500" />
                                {feat}
                            </li>
                        ))}
                    </ul>

                    <Button
                        onClick={() => handleUpgrade("PRO")}
                        disabled={currentPlan === 'PRO'}
                        variant="scanline"
                        className="w-full"
                    >
                        {currentPlan === 'PRO' ? "System Active" : "Initialize Pro"}
                    </Button>
                </div>

                {/* PRO PLUS */}
                <div className={`p-8 relative transition-all duration-300 group ${currentPlan === 'PRO_PLUS' ? 'bg-purple-950/10 border-purple-500/50' : 'bg-black border border-white/10 hover:border-purple-500/30'}`}>
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-purple-500 transition-colors" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-purple-500 transition-colors" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-purple-500 transition-colors" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-purple-500 transition-colors" />

                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="font-mono text-[10px] text-gray-500 mb-1">[TIER.03]</div>
                            <h3 className="text-xl font-bold text-purple-400 mb-1">Plus</h3>
                            <div className="text-[10px] font-mono text-purple-400 border border-purple-900/30 px-2 py-0.5 inline-block rounded-sm bg-purple-950/20">
                                {isYearly ? "1080 CREDITS" : "90 CREDITS"}
                            </div>
                        </div>
                    </div>

                    <div className="mb-8 border-b border-white/5 pb-8">
                        <span className="text-4xl font-bold text-white tracking-tighter">{isYearly ? "$199" : "$19"}</span>
                        <span className="text-gray-500 text-sm ml-2 font-mono">{isYearly ? "/yr" : "/mo"}</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {["Deep Research", "Custom Workflows", "Team features", "API Access"].map((feat, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-gray-400 font-mono">
                                <span className="w-1 h-1 bg-purple-500" />
                                {feat}
                            </li>
                        ))}
                    </ul>

                    <Button
                        onClick={() => handleUpgrade("PRO_PLUS")}
                        disabled={currentPlan === 'PRO_PLUS'}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white border-0"
                    >
                        {currentPlan === 'PRO_PLUS' ? "System Active" : "Initialize Plus"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
