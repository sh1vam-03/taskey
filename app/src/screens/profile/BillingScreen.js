import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import RazorpayCheckout from 'react-native-razorpay';
import { subscribe, createTopUp, verifyTopUp } from '../../api/billing.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
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
    const [loadingTopUp, setLoadingTopUp] = useState(false);
    const [loadingPlan, setLoadingPlan] = useState(null);
    const [isYearly, setIsYearly] = useState(false);
    const { theme, isDark } = useTheme();
    const user = useAuthStore(s => s.user);

    const currentPlanId = user?.plan || 'FREE';
    const cyan = theme.cyan ?? '#00d4ff';

    const handleSubscribe = async (planId) => {
        if (planId === 'FREE') return;
        try {
            setLoadingPlan(planId);
            const cycle = isYearly ? 'YEARLY' : 'MONTHLY';
            const { data } = await subscribe(planId, cycle);

            if (!data.orderId) {
                Alert.alert('Success', 'Plan updated successfully.');
                return;
            }

            openRazorpay(data, () => {
                Alert.alert('Success', 'Payment Successful! System upgrading...');
            });
        } catch (err) {
            console.log(err);
            Alert.alert('Error', 'Failed to initiate subscription');
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
                    Alert.alert('Success', 'Credits added successfully!');
                } catch (verifyErr) {
                    Alert.alert('Error', 'Payment verification failed. Please contact support.');
                }
            });
        } catch (err) {
            console.log(err);
            Alert.alert('Error', 'Failed to initiate top-up');
        } finally { setLoadingTopUp(null); }
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
            .then(res => { if (onSuccess) onSuccess(res); else Alert.alert('Success', 'Payment successful'); })
            .catch(err => Alert.alert('Error', `Payment failed: ${err.description || 'Unknown error'}`));
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Billing & Usage</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* ── CURRENT PLAN SUMMARY ── */}
                <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.summaryRow}>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(234, 179, 8, 0.1)', borderColor: 'rgba(234, 179, 8, 0.2)' }]}>
                                    <Icon name="zap" size={16} color="#eab308" />
                                </View>
                                <Text style={[styles.summaryTitle, { color: theme.text }]}>
                                    Current Plan: <Text style={{ color: cyan }}>{currentPlanId.replace('_', '+')}</Text>
                                </Text>
                            </View>
                            <Text style={[styles.summaryDesc, { color: theme.textDim }]}>
                                {currentPlanId === 'FREE' ? 'Upgrade to unlock AI-powered productivity.' : 'Pro capabilities active.'}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />

                    <View style={styles.creditsRow}>
                        <MaterialIcon name="lightning-bolt" size={24} color={cyan} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.creditsLabel, { color: theme.textDim }]}>AI CREDITS AVAILABLE</Text>
                            <Text style={[styles.creditsValue, { color: theme.text }]}>{user?.aiCreditBalance || 0}</Text>
                        </View>
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
                    const price = plan.monthlyPrice === 0 ? '₹0' : (isYearly ? `₹${plan.yearlyPrice}` : `₹${plan.monthlyPrice}`);
                    const period = plan.monthlyPrice === 0 ? '' : (isYearly ? '/yr' : '/mo');

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
                                title={isCurrent ? '✓ Current Plan' : `Upgrade to ${plan.name}`}
                                variant={isCurrent ? 'ghost' : (plan.id === 'PRO' ? 'primary' : 'outline')}
                                onPress={() => handleSubscribe(plan.id)}
                                loading={loadingPlan === plan.id}
                                disabled={isCurrent || plan.id === 'FREE'}
                                style={{ marginTop: 24 }}
                            />
                        </View>
                    );
                })}

                <View style={{ alignItems: 'center', marginVertical: 32 }}>
                    <Text style={{ fontSize: 10, color: theme.textDim, fontWeight: '700', letterSpacing: 2 }}>TASKTIME SECURE PAYMENTS</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
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
});
