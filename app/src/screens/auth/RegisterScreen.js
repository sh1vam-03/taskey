/**
 * RegisterScreen.js
 */
import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, Animated,
    KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AuthBg, Logo, Input, Btn, GhostBtn, ErrMsg,
    C, RADIUS,
} from './_authShared';
import Icon from 'react-native-vector-icons/Feather';
import { register } from '../../api/auth.api';

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(anim, { toValue: 1, duration: 420, useNativeDriver: true }).start();
    }, []);
    const style = {
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
    };

    /* Password strength — 0..4 */
    const strength = (() => {
        let n = 0;
        if (pass.length >= 8) n++;
        if (/[A-Z]/.test(pass)) n++;
        if (/[0-9]/.test(pass)) n++;
        if (/[^A-Za-z0-9]/.test(pass)) n++;
        return n;
    })();
    const STRENGTH_COLOR = ['', '#f87171', '#fb923c', C.cyan, C.success];
    const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    const handle = async () => {
        setError('');
        if (!name.trim())
            return setError('Please enter your name.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return setError('Enter a valid email address.');
        if (pass.length < 8)
            return setError('Password must be at least 8 characters.');
        if (pass !== confirm)
            return setError('Passwords do not match.');
        setLoading(true);
        try {
            await register(name, email, pass);
            navigation.navigate('OtpVerification', { email });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={s.root}>
            <AuthBg />
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        contentContainerStyle={s.scroll}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View style={style}>

                            <View style={s.logoRow}><Logo size="md" /></View>

                            <View style={s.header}>
                                <Text style={s.title}>Create account</Text>
                                <Text style={s.sub}>Start managing tasks with AI</Text>
                            </View>

                            <ErrMsg msg={error} />

                            <Input
                                label="Full name"
                                placeholder="Your name"
                                value={name}
                                onChangeText={setName}
                                iconLeft="user"
                                returnKey="next"
                            />

                            <Input
                                label="Email"
                                placeholder="you@example.com"
                                value={email}
                                onChangeText={setEmail}
                                iconLeft="mail"
                                keyboard="email-address"
                                capitalize="none"
                                returnKey="next"
                            />

                            <Input
                                label="Password"
                                placeholder="Min. 8 characters"
                                value={pass}
                                onChangeText={setPass}
                                iconLeft="lock"
                                secure={!showPass}
                                iconRight={showPass ? 'eye-off' : 'eye'}
                                onIconRight={() => setShowPass(v => !v)}
                                returnKey="next"
                            />

                            {/* Password strength */}
                            {pass.length > 0 && (
                                <View style={s.strengthRow}>
                                    <View style={s.bars}>
                                        {[1, 2, 3, 4].map(i => (
                                            <View
                                                key={i}
                                                style={[
                                                    s.bar,
                                                    { backgroundColor: i <= strength ? STRENGTH_COLOR[strength] : C.dim10 },
                                                ]}
                                            />
                                        ))}
                                    </View>
                                    <Text style={[s.strengthTxt, { color: STRENGTH_COLOR[strength] }]}>
                                        {STRENGTH_LABEL[strength]}
                                    </Text>
                                </View>
                            )}

                            <Input
                                label="Confirm password"
                                placeholder="Repeat password"
                                value={confirm}
                                onChangeText={setConfirm}
                                iconLeft="lock"
                                secure={!showPass}
                                returnKey="done"
                                onSubmit={handle}
                            />

                            <Btn label="Create account" onPress={handle} loading={loading} />

                            <GhostBtn
                                label="Log in instead"
                                onPress={() => navigation.navigate('Login')}
                            />

                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    scroll: { flexGrow: 1, paddingHorizontal: 26, paddingBottom: 40, paddingTop: 16 },
    logoRow: { marginBottom: 36 },
    header: { marginBottom: 28 },
    title: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.6, marginBottom: 6 },
    sub: { fontSize: 15, color: C.sub },
    strengthRow: {
        flexDirection: 'row', alignItems: 'center',
        gap: 10, marginTop: -4, marginBottom: 12,
    },
    bars: { flex: 1, flexDirection: 'row', gap: 5 },
    bar: { flex: 1, height: 2, borderRadius: 1 },
    strengthTxt: { fontSize: 11, fontWeight: '700', minWidth: 38 },
});
