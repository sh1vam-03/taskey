/**
 * ResetPasswordScreen.js
 */
import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, Animated,
    KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { AuthBg, AuthHeader, Input, Btn, ErrMsg, OkMsg, BackArrow, C, RADIUS } from './_authShared';
import { resetPassword } from '../../api/auth.api';

export default function ResetPasswordScreen({ route, navigation }) {
    const email = route.params?.email || '';

    const [code, setCode] = useState('');
    const [pass, setPass] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ok, setOk] = useState('');

    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(anim, { toValue: 1, duration: 420, useNativeDriver: true }).start();
    }, []);
    const animStyle = {
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
    };

    /* Live requirements */
    const reqs = [
        { ok: pass.length >= 8, label: 'At least 8 characters' },
        { ok: /[A-Z]/.test(pass), label: 'One uppercase letter' },
        { ok: /[0-9]/.test(pass), label: 'One number' },
        { ok: pass === confirm && pass !== '', label: 'Passwords match' },
    ];

    const handle = async () => {
        setError(''); setOk('');
        if (!code) return setError('Enter the reset code from your email.');
        if (pass.length < 8) return setError('Password must be at least 8 characters.');
        if (pass !== confirm) return setError('Passwords do not match.');
        if (!/[A-Z]/.test(pass) && !/[0-9]/.test(pass))
            return setError('Password must include an uppercase letter or number.');

        setLoading(true);
        try {
            await resetPassword(email, code, pass);
            setOk('Password updated successfully!');
            setTimeout(() => navigation.navigate('Login'), 1600);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={s.root}>
            <AuthBg />
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                <AuthHeader />
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        contentContainerStyle={s.scroll}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View style={animStyle}>

                            <BackArrow onPress={() => navigation.goBack()} />

                            <View style={[s.header, { alignItems: 'center' }]}>
                                <Text style={[s.title, { textAlign: 'center' }]}>Reset password</Text>
                                <Text style={[s.sub, { textAlign: 'center' }]}>
                                    Enter the code sent to{' '}
                                    <Text style={{ color: C.text, fontWeight: '600' }}>{email}</Text>
                                </Text>
                            </View>

                            <ErrMsg msg={error} />
                            <OkMsg msg={ok} />

                            <Input
                                label="Reset code"
                                placeholder="6-digit code"
                                value={code}
                                onChangeText={setCode}
                                iconLeft="hash"
                                keyboard="number-pad"
                                returnKey="next"
                            />

                            <Input
                                label="New password"
                                placeholder="Create a strong password"
                                value={pass}
                                onChangeText={setPass}
                                iconLeft="lock"
                                secure={!showPass}
                                iconRight={showPass ? 'eye-off' : 'eye'}
                                onIconRight={() => setShowPass(v => !v)}
                                returnKey="next"
                            />

                            <Input
                                label="Confirm new password"
                                placeholder="Repeat password"
                                value={confirm}
                                onChangeText={setConfirm}
                                iconLeft="lock"
                                secure={!showPass}
                                returnKey="done"
                                onSubmit={handle}
                            />

                            {/* Requirements — only shown while typing */}
                            {pass.length > 0 && (
                                <View style={[s.reqBox, { borderColor: C.border, backgroundColor: C.dim6 }]}>
                                    {reqs.map((r, i) => (
                                        <View key={i} style={s.reqRow}>
                                            <Icon
                                                name={r.ok ? 'check' : 'circle'}
                                                size={12}
                                                color={r.ok ? C.success : C.muted}
                                                style={{ marginRight: 9, flexShrink: 0 }}
                                            />
                                            <Text style={[s.reqTxt, { color: r.ok ? C.success : C.muted }]}>
                                                {r.label}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <Btn label="Reset password" onPress={handle} loading={loading} />

                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    scroll: { flexGrow: 1, paddingHorizontal: 26, justifyContent: 'center' },
    header: { marginBottom: 28 },
    title: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.6, marginBottom: 10 },
    sub: { fontSize: 15, color: C.sub, lineHeight: 23 },
    reqBox: {
        borderRadius: RADIUS.md, borderWidth: 1,
        padding: 16, marginBottom: 4, gap: 10,
    },
    reqRow: { flexDirection: 'row', alignItems: 'center' },
    reqTxt: { fontSize: 13, fontWeight: '500' },
});
