import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import RazorpayCheckout from 'react-native-razorpay';
import { subscribe, createTopUp, verifyTopUp } from '../../api/billing.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

const PLANS = [
    { id: 'FREE', name: 'Free', price: '₹0', features: ['50 tasks/mo', 'Basic AI', 'Standard Support'] },
    { id: 'PRO', name: 'Pro', price: '₹29', yearlyPrice: '₹290', features: ['500 tasks/mo', 'GPT-4o / Claude 3 Opus', 'Priority Support'] },
    { id: 'PRO_PLUS', name: 'Pro+', price: '₹79', yearlyPrice: '₹790', features: ['Unlimited tasks', 'All AI Models', '24/7 Support', 'Custom Integrations'] }
];

const TOP_UPS = [
    { id: 'pkg_1', credits: 200, price: '₹9' },
    { id: 'pkg_2', credits: 450, price: '₹19' },
    { id: 'pkg_3', credits: 1000, price: '₹39' },
];

export default function BillingScreen({ navigation }) {
    const [loadingTopUp, setLoadingTopUp] = useState(false);
    const [loadingPlan, setLoadingPlan] = useState(null);
    const [isYearly, setIsYearly] = useState(false);
    const { theme } = useTheme();

    const handleSubscribe = async (planId) => {
        try {
            setLoadingPlan(planId);
            const cycle = isYearly ? 'YEARLY' : 'MONTHLY';
            const { data } = await subscribe(planId, cycle);

            if (!data.orderId) {
                Alert.alert('Success', 'Plan updated successfully (Free tier).');
                return;
            }

            openRazorpay(data, () => {
                Alert.alert('Success', 'Payment Successful! System upgrading...');
            });
        } catch (err) {
            console.log(err);
            Alert.alert('Error', 'Failed to initiate subscription');
        } finally {
            setLoadingPlan(null);
        }
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
        } finally {
            setLoadingTopUp(null);
        }
    };

    const openRazorpay = (data, onSuccess) => {
        const options = {
            description: 'Upgrade TASKTIME Plan',
            image: 'https://your-logo-url.com/logo.png',
            currency: 'INR',
            key: data.razorpayKey || 'rzp_test_1Dp5s9sn', // Mock default
            amount: data.amount,
            name: 'TASKTIME',
            order_id: data.orderId,
            prefill: {
                email: 'user@example.com',
                contact: '9999999999',
                name: 'User'
            },
            theme: { color: theme.cyan }
        };

        RazorpayCheckout.open(options)
            .then((res) => {
                if (onSuccess) onSuccess(res);
                else Alert.alert('Success', `Payment successful: ${res.razorpay_payment_id}`);
            })
            .catch((err) => {
                Alert.alert('Error', `Payment failed: ${err.description || 'Unknown error'}`);
            });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="chevron-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Billing & Plans</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Upgrade Your Workflow</Text>

                <View style={styles.toggleRow}>
                    <Text style={[styles.toggleText, { color: theme.textDim }, !isYearly && { color: theme.text }]}>Monthly</Text>
                    <Switch
                        value={isYearly}
                        onValueChange={setIsYearly}
                        trackColor={{ false: theme.border, true: theme.cyan }}
                        thumbColor={theme.text}
                    />
                    <Text style={[styles.toggleText, { color: theme.textDim }, isYearly && { color: theme.text }]}>Yearly (Save 20%)</Text>
                </View>

                {PLANS.map(plan => (
                    <Card key={plan.id} style={[styles.planCard, { backgroundColor: theme.surface }]}>
                        <View style={styles.planHeader}>
                            <Text style={[styles.planName, { color: theme.cyan }]}>{plan.name}</Text>
                            <Text style={[styles.planPrice, { color: theme.text }]}>
                                {isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price}
                                <Text style={[styles.perMonth, { color: theme.textDim }]}>{isYearly ? '/yr' : '/mo'}</Text>
                            </Text>
                        </View>

                        <View style={styles.featuresList}>
                            {plan.features.map((feat, idx) => (
                                <View key={idx} style={styles.featureRow}>
                                    <Icon name="check" size={16} color={theme.cyan} style={styles.featureIcon} />
                                    <Text style={[styles.featureText, { color: theme.text }]}>{feat}</Text>
                                </View>
                            ))}
                        </View>

                        <Button
                            title={plan.id === 'FREE' ? 'Current Plan' : `Upgrade to ${plan.name}`}
                            variant={plan.id === 'FREE' ? 'outline' : 'primary'}
                            onPress={() => handleSubscribe(plan.id)}
                            loading={loadingPlan === plan.id}
                            disabled={plan.id === 'FREE'}
                            style={{ marginTop: 24 }}
                        />
                    </Card>
                ))}

                <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 32 }]}>Top Up Credits</Text>
                <View style={styles.topUpContainer}>
                    {TOP_UPS.map(pkg => (
                        <Card key={pkg.id} style={[styles.topUpCard, { backgroundColor: theme.surface }]}>
                            <Icon name="zap" size={24} color="#f59e0b" style={{ marginBottom: 8 }} />
                            <Text style={[styles.topUpCredits, { color: theme.text }]}>{pkg.credits} CR</Text>
                            <Text style={[styles.topUpPrice, { color: theme.textDim }]}>{pkg.price}</Text>
                            <Button
                                title="Buy"
                                size="sm"
                                variant="outline"
                                loading={loadingTopUp === pkg.id}
                                onPress={() => handleTopUp(pkg.id)}
                                style={{ marginTop: 12, width: '100%' }}
                            />
                        </Card>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    backBtn: { paddingRight: 16 },
    headerTitle: { fontSize: typography.fontSizes.lg, fontWeight: 'bold' },
    scrollContent: { padding: 16, paddingBottom: 40 },
    sectionTitle: { fontSize: typography.fontSizes.xl, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
    planCard: { marginBottom: 24, padding: 24 },
    planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    planName: { fontSize: typography.fontSizes.xl, fontWeight: 'bold' },
    planPrice: { fontSize: typography.fontSizes.xxl, fontWeight: 'bold' },
    perMonth: { fontSize: typography.fontSizes.sm },
    featuresList: {},
    featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    featureIcon: { marginRight: 12 },
    featureText: { fontSize: typography.fontSizes.md },
    toggleRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    toggleText: { fontSize: typography.fontSizes.md, marginHorizontal: 12, fontWeight: 'bold' },
    topUpContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    topUpCard: { flex: 1, padding: 12, alignItems: 'center' },
    topUpCredits: { fontSize: typography.fontSizes.md, fontWeight: 'bold' },
    topUpPrice: { fontSize: typography.fontSizes.sm, marginTop: 4 },
});
