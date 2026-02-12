'use client';

import { useState, useEffect } from 'react';
import billingService from '@/services/billing.service';
import { useAuth } from '@/context/AuthContext';
import { Check, CreditCard, Shield, Zap, Sparkles, TrendingUp } from 'lucide-react';
import usageService from '@/services/usage.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import RazorpayScript from '@/components/RazorpayScript';

const PLANS = [
    {
        id: 'FREE',
        name: 'Starter Protocol',
        price: '₹0',
        features: [
            '20 Tasks per month',
            '30 Schedule blocks per month',
            '15 Behavior logs per month',
            'Basic Neural Access (10 Credits)'
        ],
        icon: Shield,
        color: 'border-white/10'
    },
    {
        id: 'PRO',
        name: 'Pro Systems',
        price: '₹499/mo',
        features: [
            'Unlimited Tasks',
            'Unlimited Schedules',
            'Unlimited Behavior Logs',
            '500 Neural Credits',
            'Priority Signal'
        ],
        recommended: true,
        icon: Zap,
        color: 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]'
    },
    {
        id: 'PRO_PLUS',
        name: 'Elite Interface',
        price: '₹999/mo',
        features: [
            'Everything in Pro',
            '2000 Neural Credits',
            'Voice Synthesis',
            'Predictive Analytics',
            'Early Beta Access'
        ],
        icon: Sparkles,
        color: 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.1)]'
    }
];

export default function BillingPage() {
    const { toast, success, error, info } = useToast();
    const { user, loading: authLoading } = useAuth();
    const [currentSub, setCurrentSub] = useState(null);
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [cancelModal, setCancelModal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [subData, usageData] = await Promise.all([
                    billingService.getCurrentSubscription(),
                    usageService.getMyUsage()
                ]);
                setCurrentSub(subData);
                setUsage(usageData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) loadData();
    }, [user]);

    const handleSubscribe = async (planId) => {
        if (planId === 'FREE') return;
        setProcessing(true);
        try {
            const data = await billingService.subscribe(planId, 'MONTHLY');

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                subscription_id: data.subscriptionId,
                name: "Taskey AI",
                description: `${planId.replace('_', ' ')} Subscription`,
                handler: async function (response) {
                    success("Payment Successful! System upgrading...");
                    setTimeout(() => window.location.reload(), 2000);
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                    }
                },
                theme: { color: "#06b6d4" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error(err);
            error("Subscription initialization failed. Check console.");
            setProcessing(false);
        }
    };

    const handleCancel = async () => {
        try {
            await billingService.cancelSubscription();
            setCancelModal(false);
            success("Cancellation scheduled. Access remains until cycle end.");
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            console.error(err);
            error("Cancellation failed. Please try again.");
        }
    };

    const handleDowngrade = async (newPlanId) => {
        setProcessing(true);
        try {
            await billingService.downgradePlan(newPlanId);
            success(`Plan downgraded to ${newPlanId.replace('_', ' ')}. Effective next cycle.`);
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            console.error(err);
            error("Downgrade failed. Please try again.");
            setProcessing(false);
        }
    };

    if (loading || authLoading) return (
        <div className="space-y-6">
            <SkeletonLoader type="card" className="h-48" />
            <div className="grid gap-6 lg:grid-cols-3">
                <SkeletonLoader type="card" className="h-96" />
                <SkeletonLoader type="card" className="h-96" />
                <SkeletonLoader type="card" className="h-96" />
            </div>
        </div>
    );

    const currentPlanId = user?.plan || 'FREE';

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <RazorpayScript />
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-cyan-500" />
                    Subscription Matrix
                </h1>
                <p className="text-gray-400 font-mono text-sm max-w-xl">
                    Upgrade your neural capacity and system limits.
                </p>
            </div>

            {/* Current Plan Card */}
            <Card className="p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                <Zap className="h-5 w-5 text-yellow-500" />
                            </div>
                            <h3 className="font-bold text-xl text-white">
                                Current Status: <span className="text-cyan-400 font-mono">{currentPlanId.replace('_', ' ')}</span>
                            </h3>
                        </div>
                        <p className="text-sm text-gray-500 font-mono">
                            {currentPlanId === 'FREE' ? 'Upgrade required for maximum efficiency.' : 'Pro capabilities active.'}
                        </p>

                        {user?.aiCreditBalance !== undefined && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-xs text-yellow-500 font-mono mt-2">
                                <Zap className="h-3 w-3" />
                                <strong>{user.aiCreditBalance}</strong> Neural Credits
                            </div>
                        )}
                    </div>

                    {currentPlanId !== 'FREE' && (
                        <Button
                            variant="scanline"
                            size="sm"
                            onClick={() => setCancelModal(true)}
                            className="text-red-400 hover:text-red-300 border-red-500/30 hover:bg-red-500/10"
                        >
                            TERMINATE SUBSCRIPTION
                        </Button>
                    )}
                </div>

                {/* Usage Stats */}
                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    <UsageBar label="Task Protocol" current={usage?.taskCount} max={usage?.limits?.task} color="cyan" />
                    <UsageBar label="Temporal Blocks" current={usage?.scheduleCount} max={usage?.limits?.schedule} color="indigo" />
                    <UsageBar label="Neural Actions" current={usage?.behaviorCount} max={usage?.limits?.behavior} color="purple" />
                </div>

                {/* Renewal Info */}
                {currentSub?.nextBillingAt && (
                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gray-500">
                        <span>BILLING CYCLE: {currentSub.billingCycle || 'MONTHLY'}</span>
                        <span>RENEWAL: {new Date(currentSub.nextBillingAt).toLocaleDateString()}</span>
                    </div>
                )}
            </Card>

            {/* Pricing Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                {PLANS.map(plan => {
                    const isCurrent = currentPlanId === plan.id;

                    // Determine Plan Rank for Logic
                    const planRank = { 'FREE': 0, 'PRO': 1, 'PRO_PLUS': 2 };
                    const currentRank = planRank[currentPlanId] || 0;
                    const thisRank = planRank[plan.id];

                    const isUpgrade = thisRank > currentRank;
                    const isDowngrade = thisRank < currentRank;

                    const Icon = plan.icon;
                    return (
                        <Card
                            key={plan.id}
                            className={`flex flex-col relative transition-all duration-300 hover:-translate-y-1 ${plan.color} ${isCurrent ? 'bg-white/5' : ''}`}
                        >
                            {plan.recommended && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[10px] px-3 py-1 rounded-sm font-bold font-mono tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                                    RECOMMENDED
                                </div>
                            )}

                            <div className="p-6 flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <Icon className={`h-8 w-8 ${plan.id === 'FREE' ? 'text-gray-400' : plan.id === 'PRO' ? 'text-cyan-400' : 'text-purple-400'}`} />
                                    {isCurrent && <div className="text-[10px] font-mono text-green-400 border border-green-500/30 px-2 py-0.5 rounded bg-green-500/10">ACTIVE</div>}
                                </div>

                                <h3 className="font-bold text-xl text-white font-mono">{plan.name}</h3>
                                <div className="mt-2 text-3xl font-bold text-white tracking-tight">{plan.price}</div>
                                <p className="text-xs text-gray-500 font-mono mb-6 uppercase tracking-wider">/ monthly cycle</p>

                                <ul className="space-y-4">
                                    {plan.features.map((feat, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                            <div className="mt-0.5 p-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                                                <Check className="h-3 w-3" />
                                            </div>
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-6 pt-0 mt-auto">
                                <Button
                                    onClick={() => {
                                        if (isCurrent) return;
                                        if (plan.id === 'FREE') setCancelModal(true); // Downgrade to Free = Cancel
                                        else if (isDowngrade) handleDowngrade(plan.id);
                                        else handleSubscribe(plan.id);
                                    }}
                                    disabled={isCurrent || processing}
                                    variant={isCurrent ? "ghost" : (plan.recommended ? "scanline" : "primary")}
                                    className={`w-full ${isCurrent ? 'opacity-50' : ''}`}
                                >
                                    {isCurrent ? 'SYSTEM ACTIVE' : (plan.id === 'FREE' ? 'DOWNGRADE TO FREE' : (isDowngrade ? 'DOWNGRADE' : (processing ? 'INITIALIZING...' : 'UPGRADE')))}
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <ConfirmationModal
                isOpen={cancelModal}
                onClose={() => setCancelModal(false)}
                onConfirm={handleCancel}
                title="Terminate Subscription"
                message="Are you sure you want to cancel your Pro capabilities? Your access will remain active until the end of the current billing cycle."
                confirmText="Confirm Cancellation"
                variant="danger"
            />
        </div>
    );
}

function UsageBar({ label, current = 0, max, color = "cyan" }) {
    const isUnlimited = !max;
    const percentage = isUnlimited ? 0 : Math.min(((current || 0) / max) * 100, 100);

    const colors = {
        cyan: "bg-cyan-500",
        purple: "bg-purple-500",
        indigo: "bg-indigo-500",
        red: "bg-red-500"
    };

    return (
        <div>
            <div className="flex justify-between text-[10px] font-mono mb-2 uppercase tracking-wider text-gray-400">
                <span>{label}</span>
                <span>
                    {current} / {isUnlimited ? '∞' : max}
                </span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${percentage > 90 ? colors.red : colors[color]}`}
                    style={{ width: `${isUnlimited ? 100 : percentage}%`, opacity: isUnlimited ? 0.3 : 1 }}
                />
            </div>
        </div>
    );
}
