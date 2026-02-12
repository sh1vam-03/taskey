'use client';

import { useState, useEffect } from 'react';
import usageService from '@/services/usage.service';
import billingService from '@/services/billing.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import { BarChart3, TrendingUp, Zap, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsagePage() {
    const router = useRouter();
    const [data, setData] = useState(null); // includes usage & limits
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [usageData, subData] = await Promise.all([
                    usageService.getMyUsage(),
                    billingService.getCurrentSubscription()
                ]);
                setData(usageData);
                setSubscription(subData);
            } catch (err) {
                console.error("Failed to load usage data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <SkeletonLoader type="card" className="h-32" />
                <div className="grid gap-6 md:grid-cols-2">
                    <SkeletonLoader type="card" className="h-64" />
                    <SkeletonLoader type="card" className="h-64" />
                </div>
            </div>
        );
    }

    const isUnlimited = data?.limits === 'UNLIMITED';
    const planName = subscription?.plan || 'FREE';

    // Check if user is near any limit (only for FREE users)
    const isNearLimit = !isUnlimited && (
        (data?.taskCount / data?.limits?.task > 0.8) ||
        (data?.scheduleCount / data?.limits?.schedule > 0.8) ||
        (data?.behaviorCount / data?.limits?.behavior > 0.8)
    );

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-cyan-500" />
                    System Usage
                </h1>
                <p className="text-gray-400 font-mono text-sm max-w-xl">
                    Resource consumption analysis and limit monitoring.
                </p>
            </div>

            {/* Plan Summary Card */}
            <Card className="p-6 relative overflow-hidden">
                <div className={`absolute top-0 right-0 p-32 rounded-full blur-3xl transition-colors ${planName === 'FREE' ? 'bg-gray-500/5' : 'bg-cyan-500/10'}`} />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg border ${planName === 'FREE' ? 'bg-white/5 border-white/10' : 'bg-cyan-500/10 border-cyan-500/20'}`}>
                                {planName === 'FREE' ? <Shield className="h-5 w-5 text-gray-400" /> : <Zap className="h-5 w-5 text-cyan-400" />}
                            </div>
                            <h3 className="font-bold text-xl text-white">
                                Active Protocol: <span className={`${planName === 'FREE' ? 'text-gray-300' : 'text-cyan-400'} font-mono`}>{planName.replace('_', ' ')}</span>
                            </h3>
                        </div>
                        <p className="text-sm text-gray-500 font-mono">
                            {planName === 'FREE'
                                ? 'Standard limits active. Upgrade for unrestricted access.'
                                : 'Enhanced capabilities engaged. No resource restrictions.'}
                        </p>
                        {subscription?.nextBillingAt && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 font-mono mt-2">
                                <CheckCircle className="h-3 w-3" />
                                Renewing: {new Date(subscription.nextBillingAt).toLocaleDateString()}
                            </div>
                        )}
                    </div>

                    {planName === 'FREE' && (
                        <Button
                            variant="primary"
                            onClick={() => router.push('/dashboard/billing')}
                            className="bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-0"
                        >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            INCREASE LIMITS
                        </Button>
                    )}
                </div>
            </Card>

            {/* Limit Warning (If applicable) */}
            {isNearLimit && (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="text-orange-400 font-bold text-sm">Resource Limit Approaching</h4>
                        <p className="text-gray-400 text-xs mt-1">
                            You are reaching the capacity of your current plan. Systems may be restricted once limits are hit.
                        </p>
                    </div>
                </div>
            )}

            {/* Usage Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <UsageCard
                    label="Task Protocol"
                    count={data?.taskCount}
                    limit={isUnlimited ? null : data?.limits?.task}
                    icon={<CheckCircle className="w-5 h-5" />}
                    color="cyan"
                />
                <UsageCard
                    label="Temporal Blocks"
                    count={data?.scheduleCount}
                    limit={isUnlimited ? null : data?.limits?.schedule}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="indigo"
                />
                <UsageCard
                    label="Neural Actions"
                    count={data?.behaviorCount}
                    limit={isUnlimited ? null : data?.limits?.behavior}
                    icon={<Zap className="w-5 h-5" />}
                    color="purple"
                />
            </div>
        </div>
    );
}

function UsageCard({ label, count = 0, limit, icon, color = "cyan" }) {
    const isUnlimited = limit === null || limit === undefined;
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
