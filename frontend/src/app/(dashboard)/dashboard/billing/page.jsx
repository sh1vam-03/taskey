'use client';

import { useState, useEffect } from 'react';
import billingService from '@/services/billing.service';
import { useAuth } from '@/context/AuthContext';
import { Check, CreditCard, Shield, Zap, Sparkles, TrendingUp, FileText, Clock, BarChart3, CheckCircle, AlertTriangle } from 'lucide-react';
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

const TOP_UP_PACKS = [
    {
        id: "CREDIT_100",
        credits: 100,
        price: '₹99',
        label: "Starter Pack"
    },
    {
        id: "CREDIT_500",
        credits: 500,
        price: '₹399',
        label: "Pro Pack"
    },
    {
        id: "CREDIT_1000",
        credits: 1000,
        price: '₹699',
        label: "Power Pack"
    }
];

export default function BillingPage() {
    const { toast, success, error, info } = useToast();
    const { user, loading: authLoading } = useAuth();
    const [currentSub, setCurrentSub] = useState(null);
    const [usage, setUsage] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [cancelModal, setCancelModal] = useState(false);

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
            const data = await billingService.subscribe(planId, 'MONTHLY');

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                subscription_id: data.subscriptionId,
                name: "TASKTIME",
                description: `${planId.replace('_', ' ')} Subscription`,
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
            // orderData contains: orderId, key, pack details...

            const options = {
                key: orderData.data.key, // Ensure backend returns key in data.key or just key
                amount: orderData.data.price * 100,
                currency: "INR",
                name: "TASKTIME",
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
    // Paid plans are effectively unlimited for standard resources
    const isUnlimited = currentPlanId !== 'FREE';

    // Check if user is near any limit (only for FREE users)
    const isNearLimit = !isUnlimited && (
        (usage?.taskCount / usage?.limits?.task > 0.8) ||
        (usage?.scheduleCount / usage?.limits?.schedule > 0.8) ||
        (usage?.behaviorCount / usage?.limits?.behavior > 0.8)
    );

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <RazorpayScript />
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-cyan-500" />
                    Billing & Usage
                </h1>
                <p className="text-gray-400 font-mono text-sm max-w-xl">
                    Monitor resource consumption and manage your subscription.
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

                {/* Limit Warning (If applicable) */}
                {isNearLimit && (
                    <div className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-orange-400 font-bold text-sm">Resource Limit Approaching</h4>
                            <p className="text-gray-400 text-xs mt-1">
                                You are reaching the capacity of your current plan. Systems may be restricted once limits are hit.
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

            {/* Detailed Usage Cards (Merged from Usage Page) */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <UsageCard
                    label="Task Protocol"
                    count={usage?.taskCount}
                    limit={isUnlimited ? null : usage?.limits?.task}
                    icon={<CheckCircle className="w-5 h-5" />}
                    color="cyan"
                />
                <UsageCard
                    label="Temporal Blocks"
                    count={usage?.scheduleCount}
                    limit={isUnlimited ? null : usage?.limits?.schedule}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="indigo"
                />
                <UsageCard
                    label="Behavior Logs"
                    count={usage?.behaviorCount}
                    limit={isUnlimited ? null : usage?.limits?.behavior}
                    icon={<Shield className="w-5 h-5" />}
                    color="purple"
                />

                {/* AI Credit Balance Card (Wallet Style) */}
                <Card className="p-6 flex flex-col justify-between h-full bg-gradient-to-br from-cyan-900/10 to-transparent hover:bg-cyan-900/20 transition-colors border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-cyan-400/80 uppercase tracking-wider font-mono mb-1">AVAILABLE</p>
                            <p className="text-3xl font-bold text-white font-mono text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                                {user?.aiCreditBalance || 0}
                            </p>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-2 font-mono">
                            <span className="text-gray-400">Neural Credits</span>
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

            {/* Pricing Section */}
            <div className="grid gap-6 lg:grid-cols-3 mt-16 pt-10 border-t border-white/5">
                <div className="col-span-full mb-8 flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tighter text-white mb-2">Subscription Matrix</h2>
                        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                            // SYSTEM_ACCESS_LEVELS
                        </p>
                    </div>
                </div>

                {PLANS.map((plan, index) => {
                    const isCurrent = currentPlanId === plan.id;

                    // Determine Plan Rank for Logic
                    const planRank = { 'FREE': 0, 'PRO': 1, 'PRO_PLUS': 2 };
                    const currentRank = planRank[currentPlanId] || 0;
                    const thisRank = planRank[plan.id];

                    const isUpgrade = thisRank > currentRank;
                    const isDowngrade = thisRank < currentRank;

                    // Cyberpunk Styling Logic
                    const isHighlight = plan.recommended || isCurrent;
                    const borderColor = isHighlight ? 'border-cyan-500/50' : 'border-white/10';
                    const bgColor = isHighlight ? 'bg-cyan-950/10' : 'bg-black';
                    const titleColor = isHighlight ? 'text-cyan-400' : 'text-white';
                    const tierLabel = `TIER.0${index + 1}`;

                    return (
                        <div
                            key={plan.id}
                            className={`p-8 relative transition-all duration-300 group ${bgColor} border ${borderColor} hover:border-white/30 flex flex-col`}
                        >
                            {/* Corner Brackets */}
                            <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l transition-colors ${isHighlight ? 'border-cyan-500' : 'border-white/20 group-hover:border-white/60'}`} />
                            <div className={`absolute top-0 right-0 w-3 h-3 border-t border-r transition-colors ${isHighlight ? 'border-cyan-500' : 'border-white/20 group-hover:border-white/60'}`} />
                            <div className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l transition-colors ${isHighlight ? 'border-cyan-500' : 'border-white/20 group-hover:border-white/60'}`} />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r transition-colors ${isHighlight ? 'border-cyan-500' : 'border-white/20 group-hover:border-white/60'}`} />

                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="font-mono text-[10px] text-gray-500 mb-1">[{tierLabel}]</div>
                                    <h3 className={`text-xl font-bold mb-1 ${titleColor}`}>{plan.name}</h3>
                                    <div className="text-[10px] font-mono text-cyan-600 border border-cyan-900/30 px-2 py-0.5 inline-block rounded-sm bg-cyan-950/20">
                                        {plan.id === 'FREE' ? 'BASIC ACCESS' : (plan.id === 'PRO' ? 'FULL ACCESS' : 'ELITE ACCESS')}
                                    </div>
                                </div>
                                {isCurrent && (
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-mono text-green-500">ACTIVE</span>
                                    </div>
                                )}
                            </div>

                            <div className="mb-8 border-b border-white/5 pb-8 flex-1">
                                <span className="text-4xl font-bold text-white tracking-tighter">{plan.price}</span>
                                {plan.id !== 'FREE' && <span className="text-gray-500 text-sm ml-2 font-mono">/mo</span>}
                            </div>

                            <div className="space-y-4 mb-8">
                                {plan.features.map((feat, j) => (
                                    <div key={j} className="flex items-start gap-3 text-sm text-gray-400 font-mono">
                                        <span className={`w-1 h-1 mt-1.5 shrink-0 ${isHighlight ? 'bg-cyan-500' : 'bg-gray-600'}`} />
                                        {feat}
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => {
                                    if (isCurrent) return;
                                    if (plan.id === 'FREE') setCancelModal(true);
                                    else if (isDowngrade) handleDowngrade(plan.id);
                                    else handleSubscribe(plan.id);
                                }}
                                disabled={isCurrent || (processingId !== null)}
                                variant={isHighlight ? "scanline" : "ghost"}
                                className="w-full"
                            >
                                {processingId === plan.id
                                    ? 'PROCESSING...'
                                    : (isCurrent ? 'SYSTEM_ACTIVE' : (plan.id === 'FREE' ? 'DOWNGRADE_TO_FREE' : (isDowngrade ? 'DOWNGRADE_SYSTEM' : 'INITIALIZE_UPGRADE')))
                                }
                            </Button>
                        </div>
                    );
                })}
            </div>

            {/* Top-Up Section */}
            <div className="mt-16 border-t border-white/5 pt-10">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                        <Zap className="h-6 w-6 text-yellow-500" />
                        Neural Credit Top-Up
                    </h2>
                    <p className="text-gray-400 font-mono text-sm max-w-xl">
                        // INSTANT_CAPACITY_INJECTION
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {TOP_UP_PACKS.map((pack) => (
                        <div key={pack.id} className="p-6 relative transition-all duration-300 group bg-black border border-white/10 hover:border-yellow-500/50 flex flex-col">
                            {/* Corner Brackets (Yellow) */}
                            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20 group-hover:border-yellow-500 transition-colors" />
                            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20 group-hover:border-yellow-500 transition-colors" />
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20 group-hover:border-yellow-500 transition-colors" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20 group-hover:border-yellow-500 transition-colors" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="mb-4">
                                    <div className="font-mono text-[10px] text-gray-500 mb-1">[{pack.id}]</div>
                                    <h3 className="text-lg font-bold text-white font-mono">{pack.label}</h3>
                                    <div className="text-3xl font-bold text-yellow-400 mt-2 tracking-tighter">{pack.price}</div>
                                </div>

                                <div className="flex items-center gap-2 mb-8 text-yellow-500/80 font-mono text-sm border border-yellow-500/20 bg-yellow-500/5 p-2 rounded-sm self-start">
                                    <Zap className="h-4 w-4" />
                                    <span>{pack.credits} CREDITS</span>
                                </div>

                                <Button
                                    onClick={() => handleTopUp(pack.id)}
                                    disabled={processingId !== null}
                                    variant="ghost"
                                    className="mt-auto border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 w-full"
                                >
                                    {processingId === pack.id ? 'PROCESSING...' : 'INITIATE_TOP_UP'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Transaction History */}
            <div className="mt-16 border-t border-white/5 pt-10 pb-20">
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
                title="Terminate Subscription"
                message="Are you sure you want to cancel your Pro capabilities? Your access will remain active until the end of the current billing cycle."
                confirmText="Confirm Cancellation"
                variant="danger"
            />
        </div >
    );
}

function UsageCard({ label, count = 0, limit, icon, color = "cyan", forceLimit = false }) {
    const isUnlimited = !forceLimit && (limit === null || limit === undefined);
    const percentage = isUnlimited ? 0 : Math.min((count / limit) * 100, 100);

    // Color Logic
    let statusColor = "bg-cyan-500";
    let textColor = "text-cyan-400";

    if (color === 'purple') {
        statusColor = "bg-purple-500";
        textColor = "text-purple-400";
    } else if (color === 'indigo') {
        statusColor = "bg-indigo-500";
        textColor = "text-indigo-400";
    }

    // Warning Override
    if (!isUnlimited && percentage > 85) {
        statusColor = "bg-red-500";
        textColor = "text-red-500";
    } else if (!isUnlimited && percentage > 60) {
        statusColor = "bg-yellow-500";
        textColor = "text-yellow-500";
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
                    <span className={isUnlimited ? "text-cyan-500" : (percentage > 85 ? "text-red-400" : "text-gray-400")}>
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
