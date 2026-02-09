"use client";
import React, { useEffect, useState } from "react";
import billingService from "@/services/billing.service";
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
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FaCreditCard className="text-purple-500" /> Billing & Plans
            </h1>

            {/* Current Plan Summary */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Current Plan</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-white">{currentPlan}</span>
                        <StatusBadge active={subscription?.isActive || currentPlan === 'FREE'} />
                    </div>
                    {subscription?.nextBillingAt && (
                        <p className="text-sm text-gray-500 mt-2">
                            Renews on {new Date(subscription.nextBillingAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
                {/* Usage Stats could go here */}
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* FREE */}
                <div className={`p-6 rounded-xl border ${currentPlan === 'FREE' ? 'bg-zinc-900 border-cyan-500/50 shadow-lg shadow-cyan-900/20' : 'bg-black/40 border-white/5'} flex flex-col`}>
                    <h3 className="text-xl font-bold text-white mb-2">Free</h3>
                    <div className="text-3xl font-bold text-gray-300 mb-6">$0<span className="text-sm font-normal text-gray-500">/mo</span></div>
                    <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-sm text-gray-400"><FaCheck className="text-cyan-500" /> Basic Task Features</li>
                        <li className="flex items-center gap-2 text-sm text-gray-400"><FaCheck className="text-cyan-500" /> 10 Schedules/mo</li>
                        <li className="flex items-center gap-2 text-sm text-gray-400"><FaCheck className="text-cyan-500" /> Limited AI Credits</li>
                    </ul>
                    <button
                        disabled={currentPlan === 'FREE'}
                        className="w-full py-2 rounded-lg border border-white/10 text-white font-bold text-sm bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {currentPlan === 'FREE' ? "Current Plan" : "Downgrade"}
                    </button>
                </div>

                {/* PRO */}
                <div className={`p-6 rounded-xl border relative overflow-hidden ${currentPlan === 'PRO' ? 'bg-zinc-900 border-purple-500/50 shadow-lg shadow-purple-900/20' : 'bg-black/40 border-white/5'} flex flex-col`}>
                    {currentPlan === 'PRO' && <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">CURRENT</div>}
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><FaCrown className="text-purple-400" /> Pro</h3>
                    <div className="text-3xl font-bold text-white mb-6">$9<span className="text-sm font-normal text-gray-500">/mo</span></div>
                    <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-sm text-gray-300"><FaCheck className="text-purple-400" /> Unlimited Tasks</li>
                        <li className="flex items-center gap-2 text-sm text-gray-300"><FaCheck className="text-purple-400" /> Unlimited Schedules</li>
                        <li className="flex items-center gap-2 text-sm text-gray-300"><FaCheck className="text-purple-400" /> Advanced AI Insights</li>
                        <li className="flex items-center gap-2 text-sm text-gray-300"><FaCheck className="text-purple-400" /> 500 AI Credits/mo</li>
                    </ul>
                    <button
                        onClick={() => handleUpgrade("PRO")}
                        disabled={currentPlan === 'PRO'}
                        className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-purple-900/50"
                    >
                        {currentPlan === 'PRO' ? "Current Plan" : "Upgrade to Pro"}
                    </button>
                </div>

                {/* PRO PLUS */}
                <div className={`p-6 rounded-xl border relative overflow-hidden ${currentPlan === 'PRO_PLUS' ? 'bg-zinc-900 border-pink-500/50 shadow-lg shadow-pink-900/20' : 'bg-black/40 border-white/5'} flex flex-col`}>
                    {currentPlan === 'PRO_PLUS' && <div className="absolute top-0 right-0 bg-pink-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">CURRENT</div>}
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><FaCrown className="text-pink-400" /> Pro+</h3>
                    <div className="text-3xl font-bold text-white mb-6">$19<span className="text-sm font-normal text-gray-500">/mo</span></div>
                    <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-sm text-gray-300"><FaCheck className="text-pink-400" /> Everything in Pro</li>
                        <li className="flex items-center gap-2 text-sm text-gray-300"><FaCheck className="text-pink-400" /> Priority Support</li>
                        <li className="flex items-center gap-2 text-sm text-gray-300"><FaCheck className="text-pink-400" /> 2000 AI Credits/mo</li>
                        <li className="flex items-center gap-2 text-sm text-gray-300"><FaCheck className="text-pink-400" /> Early Access Features</li>
                    </ul>
                    <button
                        onClick={() => handleUpgrade("PRO_PLUS")}
                        disabled={currentPlan === 'PRO_PLUS'}
                        className="w-full py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-pink-900/50"
                    >
                        {currentPlan === 'PRO_PLUS' ? "Current Plan" : "Upgrade to Pro+"}
                    </button>
                </div>
            </div>
        </div>
    );
}
