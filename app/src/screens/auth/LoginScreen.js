/**
 * LoginScreen.js
 */
import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, Animated,
    KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AuthBg, AuthHeader, Input, Btn, ErrMsg,
    C, RADIUS,
} from './_authShared';
import Icon from 'react-native-vector-icons/Feather';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const setAuth = useAuthStore(s => s.setAuth);

    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(anim, { toValue: 1, duration: 420, useNativeDriver: true }).start();
    }, []);
    const style = {
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
    };

    const handle = async () => {
        setError('');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return setError('Enter a valid email address.');
        if (!password)
            return setError('Password is required.');
        setLoading(true);
        try {
            const { data: res } = await login(email, password);
            setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
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
                    <AuthHeader />
                    <ScrollView
                        contentContainerStyle={s.scroll}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View style={style}>

                            <View style={[s.header, { alignItems: 'center' }]}>
                                <Text style={[s.title, { textAlign: 'center' }]}>Welcome back</Text>
                                <Text style={[s.sub, { textAlign: 'center' }]}>Login to access your TASKTIME account</Text>
                            </View>

                            <ErrMsg msg={error} />

                            <Input
                                label="EMAIL ADDRESS"
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
                                placeholder="Your password"
                                value={password}
                                onChangeText={setPassword}
                                iconLeft="lock"
                                secure={!showPass}
                                iconRight={showPass ? 'eye-off' : 'eye'}
                                onIconRight={() => setShowPass(v => !v)}
                                returnKey="done"
                                onSubmit={handle}
                            />

                            <TouchableOpacity
                                style={s.forgot}
                                onPress={() => navigation.navigate('ForgotPassword')}
                            >
                                <Text style={s.forgotTxt}>Forgot password?</Text>
                            </TouchableOpacity>

                            <Btn label="Log in" onPress={handle} loading={loading} />

                            <View style={s.footer}>
                                <Text style={s.footerTxt}>
                                    Don't have an account?{' '}
                                    <Text style={s.footerLink} onPress={() => navigation.navigate('Register')}>
                                        CREATE ACCOUNT
                                    </Text>
                                </Text>
                            </View>

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
    title: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.6, marginBottom: 6 },
    sub: { fontSize: 15, color: C.sub },
    forgot: { alignSelf: 'flex-end', marginTop: 4, marginBottom: 16 },
    forgotTxt: { fontSize: 13, color: C.cyan, fontWeight: '600' },
    footer: { marginTop: 32, alignItems: 'center' },
    footerTxt: { fontSize: 13, color: C.sub, fontWeight: '500' },
    footerLink: { color: C.cyan, fontWeight: '700' },
});
