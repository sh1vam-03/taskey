"use client";
import React, { useEffect, useState } from "react";
import billingService from "@/services/billing.service";
import { PageHeader } from "@/components/dashboard/PageHeader";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import { FaCheck, FaCrown, FaCreditCard } from "react-icons/fa";

export default function BillingPage() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

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

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* FREE */}
                <div className={`relative p-1 rounded-2xl transition-all duration-300 ${currentPlan === 'FREE' ? 'bg-linear-to-b from-white/10 to-transparent' : 'bg-transparent'}`}>
                    <div className="h-full bg-zinc-900/80 border border-white/5 rounded-xl p-6 flex flex-col backdrop-blur-md">
                        <h3 className="text-lg font-bold text-gray-300 mb-2">Starter</h3>
                        <div className="text-3xl font-bold text-white mb-6">$0<span className="text-sm font-normal text-gray-500">/mo</span></div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-gray-400"><FaCheck className="text-cyan-500 shrink-0" /> Basic Task Management</li>
                            <li className="flex items-center gap-3 text-sm text-gray-400"><FaCheck className="text-cyan-500 shrink-0" /> 10 Schedules/mo</li>
                            <li className="flex items-center gap-3 text-sm text-gray-400"><FaCheck className="text-cyan-500 shrink-0" /> Community Support</li>
                        </ul>
                        <button
                            disabled={currentPlan === 'FREE'}
                            className="w-full py-3 rounded-lg border border-white/10 text-gray-400 font-bold text-sm bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {currentPlan === 'FREE' ? "Current Plan" : "Downgrade"}
                        </button>
                    </div>
                </div>

                {/* PRO */}
                <div className={`relative p-1 rounded-2xl transition-all duration-300 bg-linear-to-b from-purple-500 to-cyan-500 shadow-[0_0_40px_rgba(168,85,247,0.15)] transform md:-translate-y-4`}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-purple-500 to-cyan-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap">
                        Most Popular
                    </div>
                    <div className="h-full bg-zinc-900 border border-white/10 rounded-xl p-6 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">Pro System <FaCrown className="text-purple-400 text-xs" /></h3>
                        <div className="text-4xl font-black text-white mb-6">$9<span className="text-sm font-normal text-gray-500">/mo</span></div>
                        <ul className="space-y-4 mb-8 flex-1 z-10">
                            <li className="flex items-center gap-3 text-sm text-gray-300"><FaCheck className="text-purple-400 shrink-0" /> Unlimited Tasks</li>
                            <li className="flex items-center gap-3 text-sm text-gray-300"><FaCheck className="text-purple-400 shrink-0" /> Unlimited Schedules</li>
                            <li className="flex items-center gap-3 text-sm text-gray-300"><FaCheck className="text-purple-400 shrink-0" /> AI Neural Insights</li>
                            <li className="flex items-center gap-3 text-sm text-gray-300"><FaCheck className="text-purple-400 shrink-0" /> 500 AI Credits/mo</li>
                        </ul>
                        <button
                            onClick={() => handleUpgrade("PRO")}
                            disabled={currentPlan === 'PRO'}
                            className="w-full py-3 rounded-lg bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {currentPlan === 'PRO' ? "Current Plan" : "Upgrade to Pro"}
                        </button>
                    </div>
                </div>

                {/* PRO PLUS */}
                <div className={`relative p-1 rounded-2xl transition-all duration-300 ${currentPlan === 'PRO_PLUS' ? 'bg-linear-to-b from-pink-500 to-purple-500' : 'bg-transparent'}`}>
                    <div className="h-full bg-zinc-900/80 border border-white/5 rounded-xl p-6 flex flex-col backdrop-blur-md">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">Pro+</h3>
                        <div className="text-3xl font-bold text-white mb-6">$19<span className="text-sm font-normal text-gray-500">/mo</span></div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-gray-300"><FaCheck className="text-pink-400 shrink-0" /> Everything in Pro</li>
                            <li className="flex items-center gap-3 text-sm text-gray-300"><FaCheck className="text-pink-400 shrink-0" /> Priority Support</li>
                            <li className="flex items-center gap-3 text-sm text-gray-300"><FaCheck className="text-pink-400 shrink-0" /> 2000 AI Credits/mo</li>
                            <li className="flex items-center gap-3 text-sm text-gray-300"><FaCheck className="text-pink-400 shrink-0" /> Beta Features Access</li>
                        </ul>
                        <button
                            onClick={() => handleUpgrade("PRO_PLUS")}
                            disabled={currentPlan === 'PRO_PLUS'}
                            className="w-full py-3 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {currentPlan === 'PRO_PLUS' ? "Current Plan" : "Upgrade to Pro+"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
