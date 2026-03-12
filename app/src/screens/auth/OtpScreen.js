/**
 * OtpScreen.js
 */
import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, Animated,
    KeyboardAvoidingView, Platform, TextInput, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthBg, AuthHeader, Btn, ErrMsg, OkMsg, BackArrow, C, RADIUS } from './_authShared';
import { verifyOtp, otpRequest } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';

export default function OtpScreen({ route, navigation }) {
    const email = route.params?.email || '';
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ok, setOk] = useState('');
    const [timer, setTimer] = useState(59);

    const refs = useRef([]);
    const fAnims = useRef([0, 1, 2, 3, 4, 5].map(() => new Animated.Value(0))).current;
    const setAuth = useAuthStore(s => s.setAuth);

    /* Entrance */
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(anim, { toValue: 1, duration: 420, useNativeDriver: true }).start();
        setTimeout(() => refs.current[0]?.focus(), 500);
    }, []);
    const animStyle = {
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
    };

    /* Countdown */
    useEffect(() => {
        if (timer <= 0) return;
        const t = setTimeout(() => setTimer(n => n - 1), 1000);
        return () => clearTimeout(t);
    }, [timer]);

    /* Box focus animation */
    const focusBox = (i, on) =>
        Animated.timing(fAnims[i], { toValue: on ? 1 : 0, duration: 150, useNativeDriver: false }).start();

    /* Handle digit entry */
    const onType = (text, i) => {
        const d = [...digits];
        d[i] = text.replace(/\D/g, '');
        setDigits(d);
        if (text && i < 5) refs.current[i + 1]?.focus();
    };

    const onKey = (e, i) => {
        if (e.nativeEvent.key === 'Backspace' && !digits[i] && i > 0)
            refs.current[i - 1]?.focus();
    };

    const verify = async () => {
        const otp = digits.join('').trim();
        if (otp.length < 6) return setError('Enter the complete 6-digit code.');
        setError('');
        setOk('');
        setLoading(true);
        try {
            const { data: res } = await verifyOtp(email, otp);
            setOk('Email verified successfully!');
            setTimeout(() => {
                setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
            setDigits(['', '', '', '', '', '']);
            setTimeout(() => refs.current[0]?.focus(), 60);
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
                    <Animated.View style={[s.inner, animStyle]}>

                        <BackArrow onPress={() => navigation.goBack()} />

                        <View style={[s.header, { alignItems: 'center' }]}>
                            <Text style={[s.title, { textAlign: 'center' }]}>Check your email</Text>
                            <Text style={[s.sub, { textAlign: 'center' }]}>
                                We sent a 6-digit code to{'\n'}
                                <Text style={{ color: C.text, fontWeight: '600' }}>{email}</Text>
                            </Text>
                        </View>

                        <ErrMsg msg={error} />
                        <OkMsg msg={ok} />

                        {/* ── OTP digit boxes ── */}
                        <View style={s.boxes}>
                            {digits.map((d, i) => {
                                const bc = fAnims[i].interpolate({
                                    inputRange: [0, 1], outputRange: [C.border, C.focus],
                                });
                                const bg = fAnims[i].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [C.dim6, 'rgba(0,212,255,0.06)'],
                                });
                                return (
                                    <Animated.View key={i} style={[s.box, { borderColor: bc, backgroundColor: bg }]}>
                                        <TextInput
                                            ref={el => refs.current[i] = el}
                                            style={[s.digit, { color: d ? C.cyan : C.text }]}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            value={d}
                                            onChangeText={t => onType(t, i)}
                                            onKeyPress={e => onKey(e, i)}
                                            onFocus={() => focusBox(i, true)}
                                            onBlur={() => focusBox(i, false)}
                                            selectTextOnFocus
                                            selectionColor={C.focus}
                                        />
                                    </Animated.View>
                                );
                            })}
                        </View>

                        <Btn label="Verify email" onPress={verify} loading={loading} />

                        {/* Resend */}
                        <View style={s.resend}>
                            <Text style={s.resendTxt}>Didn't get the code? </Text>
                            <TouchableOpacity
                                disabled={timer > 0}
                                onPress={async () => {
                                    if (timer > 0) return;
                                    setError('');
                                    try {
                                        await otpRequest(email);
                                        setTimer(59);
                                    } catch (err) {
                                        setError(err.response?.data?.message || 'Failed to resend OTP');
                                    }
                                }}
                            >
                                <Text style={[s.resendAction, { color: timer > 0 ? C.muted : C.cyan }]}>
                                    {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </Animated.View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    inner: { flex: 1, paddingHorizontal: 26, justifyContent: 'flex-start', paddingTop: 60 },
    header: { marginBottom: 28 },
    title: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.6, marginBottom: 10 },
    sub: { fontSize: 15, color: C.sub, lineHeight: 23 },
    boxes: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24,
    },
    box: {
        width: 46, height: 56, borderRadius: 12, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center',
    },
    digit: {
        fontSize: 24, fontWeight: '800', textAlign: 'center',
        width: '100%', height: '100%',
        textAlignVertical: 'center',
        padding: 0, includeFontPadding: false,
    },
    resend: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20,
    },
    resendTxt: { fontSize: 14, color: C.muted },
    resendAction: { fontSize: 14, fontWeight: '600' },
});
