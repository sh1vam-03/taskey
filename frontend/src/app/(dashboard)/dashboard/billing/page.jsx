'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaBolt, FaRobot } from 'react-icons/fa';
import { CreditCard, Zap, FileText, Clock, CheckCircle, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import billingService from '@/services/billing.service';
import { useAuth } from '@/context/AuthContext';
import usageService from '@/services/usage.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import RazorpayScript from '@/components/RazorpayScript';

// ─── Plan Data (matches landing page InteractivePricing + backend plans.config) ──
const PLANS = [
    {
        id: 'FREE',
        tierId: 'TIER.01',
        name: 'Free',
        badge: null,
        monthlyPrice: 0,
        yearlyPrice: 0,
        monthlyCredits: '10 credits (one-time trial)',
        yearlyCredits: '10 credits (one-time trial)',
        desc: 'Perfect for manual productivity tracking.',
        variant: 'default',
        buttonVariant: 'ghost',
        features: [
            { label: '200 tasks / month', included: true },
            { label: '50 schedules / month', included: true },
            { label: '30 behavior logs / month', included: true },
            { label: 'AI assistant access', included: false },
            { label: 'Real-time web data', included: false },
            { label: 'Voice interaction', included: false },
        ],
    },
    {
        id: 'PRO',
        tierId: 'TIER.02',
        name: 'Pro',
        badge: 'Most Popular',
        monthlyPrice: 29,
        yearlyPrice: 299,
        monthlyCredits: '300 AI credits / month',
        yearlyCredits: '3,600 AI credits / year',
        desc: 'Best for professionals who want AI-powered productivity.',
        variant: 'filled',
        buttonVariant: 'primary',
        features: [
            { label: '300 tasks / month', included: true },
            { label: '100 schedules / month', included: true },
            { label: '50 behavior logs / month', included: true },
            { label: 'AI chat (text)', included: true },
            { label: 'Real-time web data', included: true },
            { label: 'Voice interaction', included: false },
        ],
    },
    {
        id: 'PRO_PLUS',
        tierId: 'TIER.03',
        name: 'Pro+',
        badge: 'Best Value',
        monthlyPrice: 79,
        yearlyPrice: 799,
        monthlyCredits: '900 AI credits / month',
        yearlyCredits: '10,800 AI credits / year',
        desc: 'For power users who want a complete AI productivity partner.',
        variant: 'outline',
        buttonVariant: 'outline',
        features: [
            { label: '1,000 tasks / month', included: true },
            { label: '500 schedules / month', included: true },
            { label: '100 behavior logs / month', included: true },
            { label: 'AI chat (text)', included: true },
            { label: 'Real-time web data', included: true },
            { label: 'Voice interaction (STT + TTS)', included: true },
        ],
    },
];

const TOP_UP_PACKS = [
    { id: 'CREDIT_200', credits: 200, price: 29 },
    { id: 'CREDIT_450', credits: 450, price: 49 },
    { id: 'CREDIT_1000', credits: 1000, price: 99 },
];

const TABLE_ROWS = [
    { label: 'Tasks / month', values: ['200', '300', '1,000'] },
    { label: 'Schedules / month', values: ['50', '100', '500'] },
    { label: 'Behavior logs / month', values: ['30', '50', '100'] },
    { label: 'AI assistant', values: [null, 'Text', 'Text + Voice'] },
    { label: 'Real-time web data', values: [null, true, true] },
    { label: 'Voice (STT + TTS)', values: [null, null, true] },
    { label: 'AI credits', values: ['10 (trial)', '300 / mo', '900 / mo'] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getPrice = (p, isYearly) => p.monthlyPrice === 0 ? 'Free' : isYearly ? `₹${p.yearlyPrice}` : `₹${p.monthlyPrice}`;
const getPeriod = (p, isYearly) => p.monthlyPrice === 0 ? '' : isYearly ? '/year' : '/month';
const getCredits = (p, isYearly) => isYearly ? p.yearlyCredits : p.monthlyCredits;
const yearlyDiscount = (mo, yr) => Math.round(((mo * 12 - yr) / (mo * 12)) * 100);

// ─── Component ────────────────────────────────────────────────────────────────
export default function BillingPage() {
    const { toast, success, error, info } = useToast();
    const { user, loading: authLoading } = useAuth();
    const [currentSub, setCurrentSub] = useState(null);
    const [usage, setUsage] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [cancelModal, setCancelModal] = useState(false);
    const [isYearly, setIsYearly] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [subData, usageData, historyData] = await Promise.all([
                    billingService.getCurrentSubscription(),
                    usageService.getMyUsage(),
                    billingService.getHistory()
                ]);
                setCurrentSub(subData);
                setUsage(usageData);
                setHistory(historyData);
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
        setProcessingId(planId);
        try {
            const billingCycle = isYearly ? 'YEARLY' : 'MONTHLY';
            const data = await billingService.subscribe(planId, billingCycle);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                subscription_id: data.subscriptionId,
                name: "TASKTIME",
                image: "",
                description: `${planId.replace('_', ' ')} Subscription (${billingCycle})`,
                handler: async function (response) {
                    success("Payment Successful! System upgrading...");
                    setTimeout(() => window.location.reload(), 2000);
                },
                modal: {
                    ondismiss: function () {
                        setProcessingId(null);
                    }
                },
                theme: { color: "#000000" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error(err);
            error("Subscription initialization failed. Check console.");
            setProcessingId(null);
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
        setProcessingId(newPlanId);
        try {
            await billingService.downgradePlan(newPlanId);
            success(`Plan downgraded to ${newPlanId.replace('_', ' ')}. Effective next cycle.`);
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            console.error(err);
            error("Downgrade failed. Please try again.");
            setProcessingId(null);
        }
    };

    const handleTopUp = async (packId) => {
        setProcessingId(packId);
        try {
            const orderData = await billingService.createTopUp(packId);

            const options = {
                key: orderData.data.key,
                amount: orderData.data.price * 100,
                currency: "INR",
                name: "TASKTIME",
                image: "",
                description: `Credit Top-Up: ${orderData.data.label}`,
                order_id: orderData.data.orderId,
                handler: async function (response) {
                    try {
                        await billingService.verifyTopUp({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        success("Credits added successfully!");
                        setTimeout(() => window.location.reload(), 1500);
                    } catch (err) {
                        console.error("Verification failed", err);
                        error("Payment verification failed. Please contact support.");
                        setProcessingId(null);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setProcessingId(null);
                    }
                },
                theme: { color: "#000000" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error(err);
            error("Top-up initialization failed.");
            setProcessingId(null);
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
    const planRank = { 'FREE': 0, 'PRO': 1, 'PRO_PLUS': 2 };
    const currentRank = planRank[currentPlanId] || 0;

    // Check if user is near any limit (only for FREE users)
    const isNearLimit = currentPlanId === 'FREE' && (
        (usage?.taskCount / usage?.limits?.task > 0.8) ||
        (usage?.scheduleCount / usage?.limits?.schedule > 0.8) ||
        (usage?.behaviorCount / usage?.limits?.behavior > 0.8)
    );

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <RazorpayScript />

            {/* ── Page Header ──────────────────────────────────────────── */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-cyan-500" />
                    Billing & Usage
                </h1>
                <p className="text-gray-400 font-mono text-sm max-w-xl">
                    No hidden fees. No token confusion. Upgrade or downgrade anytime.
                </p>
            </div>

            {/* ── Current Plan Card ────────────────────────────────────── */}
            <Card className="p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                <Zap className="h-5 w-5 text-yellow-500" />
                            </div>
                            <h3 className="font-bold text-xl text-white">
                                Current Plan: <span className="text-cyan-400 font-mono">{currentPlanId === 'PRO_PLUS' ? 'Pro+' : currentPlanId === 'PRO' ? 'Pro' : 'Free'}</span>
                            </h3>
                        </div>
                        <p className="text-sm text-gray-500 font-mono">
                            {currentPlanId === 'FREE' ? 'Upgrade to unlock AI-powered productivity.' : 'Pro capabilities active.'}
                        </p>

                        {user?.aiCreditBalance !== undefined && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs text-cyan-400 font-mono mt-2">
                                <FaBolt className="h-3 w-3" />
                                <strong>{user.aiCreditBalance}</strong> AI Credits
                            </div>
                        )}
                    </div>

                    {currentPlanId !== 'FREE' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCancelModal(true)}
                            className="text-red-400 hover:text-red-300 border-red-500/30 hover:bg-red-500/10"
                        >
                            Cancel Subscription
                        </Button>
                    )}
                </div>

                {/* Limit Warning */}
                {isNearLimit && (
                    <div className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-orange-400 font-bold text-sm">Resource Limit Approaching</h4>
                            <p className="text-gray-400 text-xs mt-1">
                                You are reaching the capacity of your current plan. Consider upgrading for more resources.
                            </p>
                        </div>
                    </div>
                )}

                {/* Renewal Info */}
                {currentSub?.nextBillingAt && (
                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gray-500">
                        <span>BILLING CYCLE: {currentSub.billingCycle || 'MONTHLY'}</span>
                        <span>RENEWAL: {new Date(currentSub.nextBillingAt).toLocaleDateString()}</span>
                    </div>
                )}
            </Card>

            {/* ── Usage Cards ──────────────────────────────────────────── */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <UsageCard
                    label="Tasks"
                    count={usage?.taskCount}
                    limit={usage?.limits?.task}
                    icon={<CheckCircle className="w-5 h-5" />}
                    color="cyan"
                />
                <UsageCard
                    label="Schedules"
                    count={usage?.scheduleCount}
                    limit={usage?.limits?.schedule}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="indigo"
                />
                <UsageCard
                    label="Behavior Logs"
                    count={usage?.behaviorCount}
                    limit={usage?.limits?.behavior}
                    icon={<Shield className="w-5 h-5" />}
                    color="purple"
                />

                {/* AI Credit Balance Card */}
                <Card className="p-6 flex flex-col justify-between h-full bg-gradient-to-br from-cyan-900/10 to-transparent hover:bg-cyan-900/20 transition-colors border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                            <FaBolt className="h-6 w-6" />
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-cyan-400/80 uppercase tracking-wider font-mono mb-1">AVAILABLE</p>
                            <p className="text-3xl font-bold font-mono text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                                {user?.aiCreditBalance || 0}
                            </p>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-2 font-mono">
                            <span className="text-gray-400">AI Credits</span>
                            <span className="text-cyan-500">Active</span>
                        </div>
                        <div className="h-2 w-full bg-cyan-950/50 rounded-full overflow-hidden border border-cyan-500/20">
                            <div className="h-full w-full bg-cyan-500/20 animate-pulse" />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 text-right">
                            {currentPlanId === 'FREE'
                                ? `FREE CREDITS: ${currentSub?.usageLimit || 10}`
                                : `Monthly Allocation: ${currentSub?.usageLimit || 0}`
                            }
                        </p>
                    </div>
                </Card>
            </div>

            {/* ── Pricing Section ──────────────────────────────────────── */}
            <div className="mt-16 pt-10 border-t border-white/5">

                {/* Header + Toggle */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 border-b border-white/10 pb-8">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-600 mb-3">
                            [SUBSCRIPTION_PLANS]
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-none">
                            Simple Pricing.
                            <br />
                            <span className="text-cyan-400">Real Value.</span>
                        </h2>
                    </div>

                    {/* Monthly / Yearly Toggle */}
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
                </div>

                {/* Plan Cards */}
                <div className="grid md:grid-cols-3 gap-5 mb-6">
                    {PLANS.map((plan, i) => {
                        const isCurrent = currentPlanId === plan.id;
                        const thisRank = planRank[plan.id];
                        const isUpgrade = thisRank > currentRank;
                        const isDowngrade = thisRank < currentRank;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="relative"
                            >
                                {/* Badge */}
                                {plan.badge && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1 text-[10px] font-mono font-bold uppercase tracking-widest rounded-sm bg-[var(--color-primary)] text-black">
                                        ✦ {plan.badge}
                                    </div>
                                )}

                                <Card
                                    variant={plan.variant}
                                    shimmer={plan.variant === 'filled'}
                                    className="h-full flex flex-col"
                                >
                                    {/* Plan ID + name + active indicator */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="font-mono text-[9px] text-gray-600 mb-1">
                                                [{plan.tierId}]
                                            </div>
                                            <h3 className="text-2xl font-black tracking-tight text-white">
                                                {plan.name}
                                            </h3>
                                        </div>
                                        {isCurrent && (
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-[9px] font-mono text-green-500">ACTIVE</span>
                                            </div>
                                        )}
                                        {!isCurrent && plan.variant === 'filled' && (
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
                                                key={isYearly ? 'yr' : 'mo'}
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 8 }}
                                                transition={{ duration: 0.18 }}
                                                className="flex items-end gap-2"
                                            >
                                                <span className="text-5xl font-black text-white tracking-tighter">
                                                    {getPrice(plan, isYearly)}
                                                </span>
                                                <span className="text-gray-500 text-sm font-mono mb-1">
                                                    {getPeriod(plan, isYearly)}
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
                                            {getCredits(plan, isYearly)}
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

                                    {/* Description */}
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
                                                <span className={feat.included ? 'text-gray-300' : 'text-gray-700'}>
                                                    {feat.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <Button
                                        onClick={() => {
                                            if (isCurrent) return;
                                            if (plan.id === 'FREE') setCancelModal(true);
                                            else if (isDowngrade) handleDowngrade(plan.id);
                                            else handleSubscribe(plan.id);
                                        }}
                                        disabled={isCurrent || (processingId !== null)}
                                        variant={isCurrent ? 'ghost' : plan.buttonVariant}
                                        size="md"
                                        className="w-full"
                                    >
                                        {processingId === plan.id
                                            ? 'Processing...'
                                            : isCurrent
                                                ? '✓ Current Plan'
                                                : plan.id === 'FREE'
                                                    ? 'Downgrade to Free'
                                                    : isDowngrade
                                                        ? `Downgrade to ${plan.name}`
                                                        : `Upgrade to ${plan.name}`
                                        }
                                    </Button>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* AI Credits Note */}
                <Card variant="ghost" className="mb-16">
                    <div className="flex items-start gap-3">
                        <FaRobot className="text-[var(--color-primary)] w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
                        <p className="text-[11px] font-mono text-gray-500 leading-relaxed">
                            <span className="text-gray-400 font-bold">AI credits</span> are used when interacting with the AI assistant — for chat, voice responses, and real-time web lookups.{" "}
                            <span className="text-[var(--color-primary)] opacity-70">Most users never run out.</span> Need more? Top up anytime below.
                        </p>
                    </div>
                </Card>

                {/* ── Feature Comparison Table ──────────────────────────── */}
                <div className="mb-16">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-600 mb-6">
                        [FEATURE_COMPARISON]
                    </p>
                    <Card variant="default" noPadding>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-xs font-mono">
                                <thead>
                                    <tr className="border-b border-white/[0.07]">
                                        <th className="text-left py-4 px-6 text-gray-600 font-normal w-1/3">Feature</th>
                                        {PLANS.map((plan) => (
                                            <th
                                                key={plan.id}
                                                className={`py-4 px-6 font-bold text-center ${plan.variant === 'filled' ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}
                                            >
                                                {plan.name}
                                                {currentPlanId === plan.id && (
                                                    <span className="ml-2 text-[9px] text-green-500">(You)</span>
                                                )}
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
                                                        <span className={j === 1 ? 'text-[var(--color-primary)]' : 'text-gray-300'}>
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
            </div>

            {/* ── Top-Up Section ────────────────────────────────────────── */}
            <div className="border-t border-white/5 pt-10">
                <div className="mb-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-600 mb-2">
                        [AI_CREDIT_TOPUPS]
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                        <FaBolt className="h-5 w-5 text-[var(--color-primary)]" />
                        Top Up Credits
                    </h2>
                    <p className="text-gray-500 text-xs font-mono">
                        Need more AI power this month? Top up your credits instantly — no plan change required.
                    </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                    {TOP_UP_PACKS.map((pack, i) => (
                        <motion.div key={pack.id} whileHover={{ y: -2 }}>
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
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => handleTopUp(pack.id)}
                                            disabled={processingId !== null}
                                        >
                                            {processingId === pack.id ? 'Processing...' : 'Buy now →'}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── Transaction History ───────────────────────────────────── */}
            <div className="border-t border-white/5 pt-10 pb-20">
                <div className="mb-6">
                    <h2 className="text-xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        Billing History
                    </h2>
                </div>

                <Card className="overflow-hidden bg-black/20 border-white/5">
                    {history.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 font-mono text-sm">
                            No payment history found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-white/5 text-gray-300 font-mono uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Ref ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 font-mono">
                                    {history.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3 text-gray-600" />
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium">
                                                {item.purpose.replace('_', ' ')}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.currency} {(item.amount / 100).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${item.status === 'PAID'
                                                    ? 'text-green-400 bg-green-500/10 border-green-500/20'
                                                    : 'text-red-400 bg-red-500/10 border-red-500/20'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-600">
                                                {item.razorpayPaymentId || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            <ConfirmationModal
                isOpen={cancelModal}
                onClose={() => setCancelModal(false)}
                onConfirm={handleCancel}
                title="Cancel Subscription"
                message="Are you sure you want to cancel? Your access will remain active until the end of the current billing cycle."
                confirmText="Confirm Cancellation"
                variant="danger"
            />
        </div>
    );
}

// ─── Usage Card ───────────────────────────────────────────────────────────────
function UsageCard({ label, count = 0, limit, icon, color = 'cyan' }) {
    const isUnlimited = limit === null || limit === undefined;
    const percentage = isUnlimited ? 0 : Math.min((count / limit) * 100, 100);

    let statusColor = 'bg-cyan-500';
    let textColor = 'text-cyan-400';

    if (color === 'purple') {
        statusColor = 'bg-purple-500';
        textColor = 'text-purple-400';
    } else if (color === 'indigo') {
        statusColor = 'bg-indigo-500';
        textColor = 'text-indigo-400';
    }

    if (!isUnlimited && percentage > 85) {
        statusColor = 'bg-red-500';
        textColor = 'text-red-500';
    } else if (!isUnlimited && percentage > 60) {
        statusColor = 'bg-yellow-500';
        textColor = 'text-yellow-500';
    }

    return (
        <Card className="p-6 flex flex-col justify-between h-full hover:bg-white/2 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-white/5 ${textColor}`}>
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-mono mb-1">USED</p>
                    <p className="text-2xl font-bold text-white font-mono">{count}</p>
                </div>
            </div>

            <div>
                <div className="flex justify-between text-xs mb-2 font-mono">
                    <span className="text-gray-400">{label}</span>
                    <span className={isUnlimited ? 'text-cyan-500' : (percentage > 85 ? 'text-red-400' : 'text-gray-400')}>
                        {isUnlimited ? 'UNLIMITED' : `${Math.round(percentage)}%`}
                    </span>
                </div>

                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    {!isUnlimited && (
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${statusColor}`}
                            style={{ width: `${percentage}%` }}
                        />
                    )}
                    {isUnlimited && (
                        <div className="h-full w-full bg-linear-to-r from-transparent via-cyan-500/20 to-transparent animate-shimmer" />
                    )}
                </div>

                {!isUnlimited && (
                    <p className="text-[10px] text-gray-500 mt-2 text-right">
                        Limit: {limit}
                    </p>
                )}
            </div>
        </Card>
    );
}
