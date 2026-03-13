import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import RazorpayCheckout from 'react-native-razorpay';
import { subscribe, createTopUp, verifyTopUp, getUsage, getHistory, getSubscription, cancelSubscription, downgradePlan } from '../../api/billing.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAlert } from '../../context/AlertContext';
import { useAuthStore } from '../../store/auth.store';

// ── DATA MATCHING WEB ───────────────────────────────────────────────────
const PLANS = [
    {
        id: 'FREE',
        tierId: 'TIER.01',
        name: 'Free',
        badge: null,
        monthlyPrice: 0,
        yearlyPrice: 0,
        monthlyCredits: '10 credits (trial)',
        yearlyCredits: '10 credits (trial)',
        desc: 'Perfect for manual productivity tracking.',
        features: [
            { label: '200 tasks / month', included: true },
            { label: '50 schedules / month', included: true },
            { label: '30 behavior logs / month', included: true },
            { label: 'AI assistant access', included: false },
            { label: 'Real-time web data', included: false },
            { label: 'Voice interaction', included: false },
        ]
    },
    {
        id: 'PRO',
        tierId: 'TIER.02',
        name: 'Pro',
        badge: 'MOST POPULAR',
        monthlyPrice: 29,
        yearlyPrice: 299,
        monthlyCredits: '300 AI credits / month',
        yearlyCredits: '3,600 AI credits / year',
        desc: 'Best for professionals who want AI-powered productivity.',
        features: [
            { label: '300 tasks / month', included: true },
            { label: '100 schedules / month', included: true },
            { label: '50 behavior logs / month', included: true },
            { label: 'AI chat (text)', included: true },
            { label: 'Real-time web data', included: true },
            { label: 'Voice interaction', included: false },
        ]
    },
    {
        id: 'PRO_PLUS',
        tierId: 'TIER.03',
        name: 'Pro+',
        badge: 'BEST VALUE',
        monthlyPrice: 79,
        yearlyPrice: 799,
        monthlyCredits: '900 AI credits / month',
        yearlyCredits: '10,800 AI credits / year',
        desc: 'For power users who want a complete AI productivity partner.',
        features: [
            { label: '1,000 tasks / month', included: true },
            { label: '500 schedules / month', included: true },
            { label: '100 behavior logs / month', included: true },
            { label: 'AI chat (text)', included: true },
            { label: 'Real-time web data', included: true },
            { label: 'Voice interaction (STT + TTS)', included: true },
        ]
    }
];

const TOP_UPS = [
    { id: 'CREDIT_200', credits: 200, price: 29 },
    { id: 'CREDIT_450', credits: 450, price: 49 },
    { id: 'CREDIT_1000', credits: 1000, price: 99 },
];

export default function BillingScreen({ navigation }) {
    const { alert } = useAlert();
    const [loadingTopUp, setLoadingTopUp] = useState(false);
    const [loadingPlan, setLoadingPlan] = useState(null);
    const [usage, setUsage] = useState(null);
    const [history, setHistory] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [isYearly, setIsYearly] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { theme, isDark } = useTheme();
    const user = useAuthStore(s => s.user);

    const loadData = async () => {
        try {
            const [subRes, usageRes, histRes] = await Promise.all([
                getSubscription(),
                getUsage(),
                getHistory()
            ]);
            setSubscription(subRes.data.data);
            setUsage(usageRes.data.data);
            setHistory(histRes.data.data || []);
        } catch (err) {
            console.log('Error loading billing data:', err);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const currentPlanId = user?.plan || 'FREE';
    const cyan = theme.cyan ?? '#00d4ff';

    const handleSubscribe = async (planId) => {
        if (planId === 'FREE') return;
        try {
            setLoadingPlan(planId);
            const cycle = isYearly ? 'YEARLY' : 'MONTHLY';
            const { data } = await subscribe(planId, cycle);

            if (!data.orderId) {
                alert('Success', 'Plan updated successfully.');
                return;
            }

            openRazorpay(data, () => {
                alert('Success', 'Payment Successful! System upgrading...');
            });
        } catch (err) {
            console.log(err);
            alert('Error', 'Failed to initiate subscription');
        } finally { setLoadingPlan(null); }
    };

    const handleTopUp = async (pkgId) => {
        try {
            setLoadingTopUp(pkgId);
            const { data } = await createTopUp(pkgId);
            openRazorpay(data, async (res) => {
                try {
                    await verifyTopUp({
                        razorpay_payment_id: res.razorpay_payment_id,
                        razorpay_order_id: res.razorpay_order_id,
                        razorpay_signature: res.razorpay_signature
                    });
                    alert('Success', 'Credits added successfully!');
                } catch (verifyErr) {
                    alert('Error', 'Payment verification failed. Please contact support.');
                }
            });
        } catch (err) {
            console.log(err);
            alert('Error', 'Failed to initiate top-up');
        } finally { setLoadingTopUp(null); }
    };

    const handleCancel = () => {
        alert(
            'Cancel Subscription',
            'Are you sure you want to cancel? Your access will remain active until the end of the current billing cycle.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Confirm Cancellation',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await cancelSubscription();
                            alert('Success', 'Cancellation scheduled. Access remains until cycle end.');
                            loadData();
                        } catch (err) {
                            alert('Error', 'Cancellation failed. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const handleDowngrade = async (newPlanId) => {
        try {
            setLoadingPlan(newPlanId);
            await downgradePlan(newPlanId);
            alert('Success', `Plan downgraded to ${newPlanId.replace('_', ' ')}. Effective next cycle.`);
            loadData();
        } catch (err) {
            alert('Error', 'Downgrade failed. Please try again.');
        } finally {
            setLoadingPlan(null);
        }
    };

    const openRazorpay = (data, onSuccess) => {
        const options = {
            description: 'TASKTIME Billing',
            image: 'https://your-logo-url.com/logo.png',
            currency: 'INR',
            key: data.razorpayKey || 'rzp_test_1Dp5s9sn',
            amount: data.amount,
            name: 'TASKTIME',
            order_id: data.orderId,
            prefill: { email: user?.email || '', contact: '', name: user?.name || '' },
            theme: { color: cyan }
        };

        RazorpayCheckout.open(options)
            .then(res => { if (onSuccess) onSuccess(res); else alert('Success', 'Payment successful'); })
            .catch(err => alert('Error', `Payment failed: ${err.description || 'Unknown error'}`));
    };

    const isNearLimit = currentPlanId === 'FREE' && usage && (
        (usage.taskCount / usage.limits.task > 0.8) ||
        (usage.scheduleCount / usage.limits.schedule > 0.8) ||
        (usage.behaviorCount / usage.limits.behavior > 0.8)
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Billing & Usage</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={cyan} />}
            >

                {/* ── CURRENT PLAN SUMMARY ── */}
                <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.summaryRow}>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(234, 179, 8, 0.1)', borderColor: 'rgba(234, 179, 8, 0.2)' }]}>
                                    <Icon name="zap" size={16} color="#eab308" />
                                </View>
                                <Text style={[styles.summaryTitle, { color: theme.text }]}>
                                    Current Plan: <Text style={{ color: cyan }}>{currentPlanId === 'PRO_PLUS' ? 'Pro+' : currentPlanId === 'PRO' ? 'Pro' : 'Free'}</Text>
                                </Text>
                            </View>
                            <Text style={[styles.summaryDesc, { color: theme.textDim }]}>
                                {currentPlanId === 'FREE' ? 'Upgrade to unlock AI-powered productivity.' : 'Pro capabilities active.'}
                            </Text>

                            {/* Credit Pill */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
                                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: cyan + '15', borderWidth: 1, borderColor: cyan + '25', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <MaterialIcon name="lightning-bolt" size={12} color={cyan} />
                                    <Text style={{ fontSize: 11, fontWeight: '900', color: cyan, fontFamily: 'monospace' }}>
                                        {user?.aiCreditBalance || 0} AI CREDITS
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {currentPlanId !== 'FREE' && (
                            <TouchableOpacity onPress={handleCancel}>
                                <Text style={{ color: '#ff4444', fontSize: 12, fontWeight: '700' }}>Cancel</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Limit Warning */}
                    {isNearLimit && (
                        <View style={{ marginTop: 16, p: 12, borderRadius: 12, backgroundColor: 'rgba(249, 115, 22, 0.1)', borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.2)', flexDirection: 'row', gap: 10, padding: 12 }}>
                            <Icon name="alert-triangle" size={16} color="#f97316" />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: '#f97316' }}>Limit Approaching</Text>
                                <Text style={{ fontSize: 11, color: theme.textDim, marginTop: 2 }}>You are reaching the capacity of your current plan.</Text>
                            </View>
                        </View>
                    )}

                    {subscription?.nextBillingAt && (
                        <>
                            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, color: theme.textDim, fontWeight: '700' }}>BILLING CYCLE: {subscription.billingCycle}</Text>
                                <Text style={{ fontSize: 10, color: theme.textDim, fontWeight: '700' }}>RENEWAL: {new Date(subscription.nextBillingAt).toLocaleDateString()}</Text>
                            </View>
                        </>
                    )}
                </View>

                {/* ── USAGE CARDS ── */}
                <View style={styles.usageRow}>
                    <UsageCard
                        label="Tasks"
                        count={usage?.taskCount}
                        limit={usage?.limits?.task}
                        icon={<Icon name="check-circle" size={16} color={cyan} />}
                        color={cyan}
                        theme={theme}
                        isDark={isDark}
                    />
                    <UsageCard
                        label="Schedules"
                        count={usage?.scheduleCount}
                        limit={usage?.limits?.schedule}
                        icon={<Icon name="trending-up" size={16} color="#6366f1" />}
                        color="#6366f1"
                        theme={theme}
                        isDark={isDark}
                    />
                    <UsageCard
                        label="Logs"
                        count={usage?.behaviorCount}
                        limit={usage?.limits?.behavior}
                        icon={<Icon name="shield" size={16} color="#a855f7" />}
                        color="#a855f7"
                        theme={theme}
                        isDark={isDark}
                    />
                    <UsageCard
                        label="Credits"
                        count={user?.aiCreditBalance || 0}
                        limit={subscription?.usageLimit}
                        icon={<MaterialIcon name="lightning-bolt" size={16} color={cyan} />}
                        color={cyan}
                        theme={theme}
                        isDark={isDark}
                    />
                </View>

                <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', marginVertical: 32 }]} />

                {/* ── SUBSCRIPTION PLANS ── */}
                <Text style={[styles.sectionTitle, { color: theme.cyan }]}>SUBSCRIPTION PLANS</Text>
                <Text style={[styles.sectionDesc, { color: theme.text }]}>Simple Pricing. <Text style={{ color: cyan }}>Real Value.</Text></Text>

                <View style={styles.toggleContainer}>
                    <TouchableOpacity onPress={() => setIsYearly(false)} style={[styles.toggleBtn, !isYearly && { backgroundColor: theme.text }]}>
                        <Text style={[styles.toggleText, !isYearly ? { color: theme.bg } : { color: theme.textDim }]}>MONTHLY</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsYearly(true)} style={[styles.toggleBtn, isYearly && { backgroundColor: theme.text }]}>
                        <Text style={[styles.toggleText, isYearly ? { color: theme.bg } : { color: theme.textDim }]}>YEARLY</Text>
                    </TouchableOpacity>
                </View>

                {PLANS.map(plan => {
                    const isCurrent = currentPlanId === plan.id;
                    const planRank = { 'FREE': 0, 'PRO': 1, 'PRO_PLUS': 2 };
                    const currentRank = planRank[currentPlanId] || 0;
                    const planRankValue = planRank[plan.id];
                    const isDowngrade = planRankValue < currentRank;

                    const price = plan.monthlyPrice === 0 ? '₹0' : (isYearly ? `₹${plan.yearlyPrice}` : `₹${plan.monthlyPrice}`);
                    const period = plan.monthlyPrice === 0 ? '' : (isYearly ? '/yr' : '/mo');
                    const credits = isYearly ? plan.yearlyCredits : plan.monthlyCredits;

                    return (
                        <View key={plan.id} style={[styles.planCard, { backgroundColor: theme.surface, borderColor: isCurrent ? cyan : theme.border }]}>
                            {plan.badge && (
                                <View style={[styles.badgeContainer, { backgroundColor: cyan }]}>
                                    <Text style={styles.badgeText}>✦ {plan.badge}</Text>
                                </View>
                            )}

                            <View style={styles.planHeader}>
                                <View>
                                    <Text style={[styles.tierId, { color: theme.textDim }]}>[{plan.tierId}]</Text>
                                    <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
                                </View>
                                {isCurrent && (
                                    <View style={[styles.activePill, { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)' }]}>
                                        <Text style={styles.activePillTxt}>ACTIVE</Text>
                                    </View>
                                )}
                            </View>

                            <View style={[styles.priceRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                                <Text style={[styles.planPrice, { color: theme.text }]}>{price}</Text>
                                <Text style={[styles.perMonth, { color: theme.textDim }]}>{period}</Text>
                            </View>

                            {/* Credits Pill */}
                            <View style={{ marginBottom: 16 }}>
                                <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, backgroundColor: cyan + '10', borderWidth: 1, borderColor: cyan + '20', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    <MaterialIcon name="lightning-bolt" size={12} color={cyan} />
                                    <Text style={{ fontSize: 10, fontWeight: '900', color: cyan, fontFamily: 'monospace' }}>{credits.toUpperCase()}</Text>
                                </View>
                            </View>

                            {isYearly && plan.monthlyPrice > 0 && (
                                <Text style={{ fontSize: 10, color: theme.textDim, fontFamily: 'monospace', marginBottom: 12 }}>
                                    ≈ ₹{Math.round(plan.yearlyPrice / 12)}/mo · Save ₹{plan.monthlyPrice * 12 - plan.yearlyPrice}
                                </Text>
                            )}

                            <Text style={[styles.planDesc, { color: theme.textDim }]}>{plan.desc}</Text>

                            <View style={styles.featuresList}>
                                {plan.features.map((feat, idx) => (
                                    <View key={idx} style={styles.featureRow}>
                                        {feat.included ? (
                                            <Icon name="check" size={14} color={cyan} style={styles.featureIcon} />
                                        ) : (
                                            <Icon name="x" size={14} color={theme.textDim} style={[styles.featureIcon, { opacity: 0.5 }]} />
                                        )}
                                        <Text style={[styles.featureText, { color: feat.included ? theme.text : theme.textDim, opacity: feat.included ? 1 : 0.6 }]}>
                                            {feat.label}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <Button
                                title={isCurrent ? '✓ Current Plan' : (isDowngrade ? `Downgrade to ${plan.name}` : `Upgrade to ${plan.name}`)}
                                variant={isCurrent ? 'ghost' : (plan.id === 'PRO' ? 'primary' : 'outline')}
                                onPress={() => isDowngrade ? handleDowngrade(plan.id) : handleSubscribe(plan.id)}
                                loading={loadingPlan === plan.id}
                                disabled={isCurrent || plan.id === 'FREE'}
                                style={{ marginTop: 24 }}
                            />
                        </View>
                    );
                })}

                {/* AI Credits Note */}
                <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <MaterialIcon name="robot" size={20} color={cyan} style={{ opacity: 0.5 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.infoTxt, { color: theme.textDim }]}>
                            <Text style={{ color: theme.text, fontWeight: 'bold' }}>AI credits</Text> are used for chat, voice, and web search. Most users never run out. Top up anytime.
                        </Text>
                    </View>
                </View>

                {/* ── TOP UP CREDITS ── */}
                <Text style={[styles.sectionTitle, { color: theme.cyan }]}>TOP UP AI CREDITS</Text>
                <View style={styles.topUpGrid}>
                    {TOP_UPS.map(pkg => (
                        <View key={pkg.id} style={[styles.topUpCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <MaterialIcon name="lightning-bolt" size={20} color={cyan} style={{ marginBottom: 8, opacity: 0.8 }} />
                            <Text style={[styles.topUpCredits, { color: theme.text }]}>{pkg.credits}</Text>
                            <Text style={[styles.topUpCreditsLabel, { color: theme.textDim }]}>credits</Text>
                            <Text style={[styles.topUpPrice, { color: theme.text }]}>₹{pkg.price}</Text>
                            <Button title="Buy" size="sm" variant="outline" loading={loadingTopUp === pkg.id} onPress={() => handleTopUp(pkg.id)} style={{ marginTop: 12, width: '100%' }} />
                        </View>
                    ))}
                </View>

                {/* ── BILLING HISTORY ── */}
                <View style={styles.historySection}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Icon name="file-text" size={20} color={theme.textDim} />
                        <Text style={[styles.summaryTitle, { color: theme.text, fontSize: 16 }]}>Billing History</Text>
                    </View>

                    <View style={[styles.historyTable, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', borderColor: theme.border }]}>
                        <View style={[styles.historyHeader, { borderBottomColor: theme.border, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}>
                            <Text style={[styles.historyLabel, { flex: 1 }]}>DATE</Text>
                            <Text style={[styles.historyLabel, { flex: 2 }]}>DESC</Text>
                            <Text style={[styles.historyLabel, { flex: 1, textAlign: 'right' }]}>AMT</Text>
                        </View>

                        {history.length === 0 ? (
                            <View style={{ padding: 24, alignItems: 'center' }}>
                                <Text style={{ fontSize: 12, color: theme.textDim, fontFamily: 'monospace' }}>No payment history found.</Text>
                            </View>
                        ) : history.map(item => (
                            <View key={item.id} style={[styles.historyRow, { borderBottomColor: theme.border }]}>
                                <Text style={[styles.historyTxt, { flex: 1, color: theme.textDim }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                                <View style={{ flex: 2 }}>
                                    <Text style={[styles.historyTxt, { color: theme.text, fontWeight: '700' }]} numberOfLines={1}>
                                        {item.purpose.replace('_', ' ')}
                                    </Text>
                                    <View style={[styles.statusBadge, {
                                        alignSelf: 'flex-start', marginTop: 4,
                                        borderColor: item.status === 'PAID' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        backgroundColor: item.status === 'PAID' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)'
                                    }]}>
                                        <Text style={[styles.statusTxt, { color: item.status === 'PAID' ? '#22c55e' : '#ef4444' }]}>{item.status}</Text>
                                    </View>
                                </View>
                                <Text style={[styles.historyTxt, { flex: 1, textAlign: 'right', color: theme.text, fontWeight: '900' }]}>₹{item.amount / 100}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ alignItems: 'center', marginVertical: 32 }}>
                    <Text style={{ fontSize: 10, color: theme.textDim, fontWeight: '700', letterSpacing: 2 }}>TASKTIME SECURE PAYMENTS</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function UsageCard({ label, count = 0, limit, icon, color, theme, isDark }) {
    const isUnlimited = limit === null || limit === undefined;
    const percentage = isUnlimited ? 0 : Math.min((count / limit) * 100, 100);

    const barColor = percentage > 85 ? '#ef4444' : color;

    return (
        <View style={[styles.usageCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.usageHeader}>
                <View style={[styles.usageIcon, { backgroundColor: color + '15' }]}>{icon}</View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.usageLabel, { color: theme.textDim }]}>{label.toUpperCase()}</Text>
                    <Text style={[styles.usageValue, { color: theme.text }]}>
                        {count}{!isUnlimited && <Text style={{ fontSize: 13, opacity: 0.5 }}>/{limit}</Text>}
                    </Text>
                </View>
            </View>
            {!isUnlimited && (
                <View style={styles.usageProgressBg}>
                    <View style={[styles.usageProgressFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
    backBtn: { padding: 12 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    scrollContent: { padding: 16, paddingBottom: 40 },

    sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 4, marginTop: 8, opacity: 0.8 },
    sectionDesc: { fontSize: 28, fontWeight: '900', letterSpacing: -1, marginBottom: 24 },

    summaryCard: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 32 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    iconBox: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    summaryTitle: { fontSize: 18, fontWeight: '800' },
    summaryDesc: { fontSize: 13, fontFamily: 'monospace', marginTop: 8, lineHeight: 18 },
    divider: { height: 1, width: '100%', marginVertical: 16 },
    creditsRow: { flexDirection: 'row', alignItems: 'center' },
    creditsLabel: { fontSize: 10, fontFamily: 'monospace', letterSpacing: 1, marginBottom: 2 },
    creditsValue: { fontSize: 24, fontWeight: '900', fontFamily: 'monospace' },

    topUpGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 12 },
    topUpCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 16, alignItems: 'center' },
    topUpCredits: { fontSize: 20, fontWeight: '900', fontFamily: 'monospace' },
    topUpCreditsLabel: { fontSize: 10, fontFamily: 'monospace', marginBottom: 6 },
    topUpPrice: { fontSize: 14, fontWeight: '700' },

    toggleContainer: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 4, marginBottom: 24, alignSelf: 'flex-start' },
    toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
    toggleText: { fontSize: 12, fontWeight: '800', fontFamily: 'monospace' },

    planCard: { borderRadius: 16, borderWidth: 1, padding: 24, marginBottom: 24, position: 'relative' },
    badgeContainer: { position: 'absolute', top: -12, alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4 },
    badgeText: { color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
    planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    tierId: { fontSize: 10, fontFamily: 'monospace', marginBottom: 4 },
    planName: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
    activePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1 },
    activePillTxt: { color: '#22c55e', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
    priceRow: { flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 16, borderBottomWidth: 1, marginBottom: 16 },
    planPrice: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
    perMonth: { fontSize: 14, fontFamily: 'monospace', marginBottom: 6, marginLeft: 4 },
    planDesc: { fontSize: 12, fontFamily: 'monospace', lineHeight: 18, marginBottom: 20 },
    featuresList: { gap: 12 },
    featureRow: { flexDirection: 'row', alignItems: 'center' },
    featureIcon: { marginRight: 10 },
    featureText: { fontSize: 12, fontFamily: 'monospace' },

    /* usage cards */
    usageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
    usageCard: { flex: 1, minWidth: '47%', borderRadius: 16, borderWidth: 1, padding: 16 },
    usageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    usageIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    usageLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
    usageValue: { fontSize: 18, fontWeight: '900', fontFamily: 'monospace' },
    usageProgressBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' },
    usageProgressFill: { height: '100%', borderRadius: 2 },

    /* info card */
    infoCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 32, flexDirection: 'row', gap: 12 },
    infoTxt: { fontSize: 11, fontFamily: 'monospace', lineHeight: 16 },

    /* history */
    historySection: { marginTop: 40 },
    historyTable: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
    historyHeader: { flexDirection: 'row', padding: 12, borderBottomWidth: 1 },
    historyLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.4)' },
    historyRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, alignItems: 'center' },
    historyTxt: { fontSize: 12, fontFamily: 'monospace' },
    statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
    statusTxt: { fontSize: 9, fontWeight: '900' },
});
