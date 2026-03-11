/**
 * ForgotPasswordScreen.js
 */
import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, Animated,
    KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthBg, Input, Btn, ErrMsg, OkMsg, BackArrow, C } from './_authShared';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { forgotPassword } from '../../api/auth.api';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
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

    const handle = async () => {
        setError(''); setOk('');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return setError('Enter a valid email address.');
        setLoading(true);
        try {
            await forgotPassword(email);
            setOk('Reset link sent. Check your inbox.');
            setTimeout(() => navigation.navigate('Login'), 1600);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not send reset code. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={s.root}>
            <AuthBg />
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    style={s.kav}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <Animated.View style={[s.inner, animStyle]}>

                        <View style={[s.logoRow, { alignItems: 'center' }]}>
                            <Svg height={45} width={300} style={{ marginBottom: 12 }}>
                                <Defs>
                                    <LinearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor="#ffffff" stopOpacity="1" />
                                        <Stop offset="0.5" stopColor="#e0e0e0" stopOpacity="1" />
                                        <Stop offset="1" stopColor="#888888" stopOpacity="1" />
                                    </LinearGradient>
                                </Defs>
                                <SvgText
                                    fill="url(#loginGrad)"
                                    fontSize="36"
                                    fontWeight="900"
                                    x="150"
                                    y="36"
                                    textAnchor="middle"
                                    letterSpacing="8"
                                >
                                    TASKTIME
                                </SvgText>
                            </Svg>
                        </View>

                        <BackArrow onPress={() => navigation.goBack()} />

                        <View style={[s.header, { alignItems: 'center' }]}>
                            <Text style={[s.title, { textAlign: 'center' }]}>Forgot password?</Text>
                            <Text style={[s.sub, { textAlign: 'center' }]}>
                                Enter your account email and we'll send you a password reset link.
                            </Text>
                        </View>

                        <ErrMsg msg={error} />
                        <OkMsg msg={ok} />

                        <Input
                            label="EMAIL ADDRESS"
                            placeholder="you@example.com"
                            value={email}
                            onChangeText={setEmail}
                            iconLeft="mail"
                            keyboard="email-address"
                            capitalize="none"
                            autoFocus
                            returnKey="done"
                            onSubmit={handle}
                        />

                        <Btn
                            label="Send reset link"
                            onPress={handle}
                            loading={loading}
                            disabled={!!ok}
                        />

                    </Animated.View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    kav: { flex: 1, justifyContent: 'center' },
    inner: { paddingHorizontal: 26 },
    logoRow: { marginBottom: 28 },
    header: { marginBottom: 28 },
    title: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.6, marginBottom: 10 },
    sub: { fontSize: 15, color: C.sub, lineHeight: 23 },
});
