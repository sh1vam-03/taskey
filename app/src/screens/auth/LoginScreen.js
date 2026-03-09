import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const setAuth = useAuthStore(state => state.setAuth);
    const { theme } = useTheme();

    const handleLogin = async () => {
        setError('');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return setError('Please enter a valid email address');
        if (!password) return setError('Password is required');

        setLoading(true);
        try {
            const { data: response } = await login(email, password, false);
            setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.content}>
                    <Text style={[styles.title, { color: theme.cyan }]}>Login here</Text>
                    <Text style={[styles.subtitle, { color: theme.text }]}>Welcome back you've{'\n'}been missed!</Text>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Input
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        containerStyle={styles.input}
                    />

                    <Input
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        containerStyle={styles.input}
                    />

                    <TouchableOpacity
                        style={styles.forgotPass}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={[styles.forgotPassText, { color: theme.cyan }]}>Forgot your password?</Text>
                    </TouchableOpacity>

                    <Button
                        title="Sign in"
                        onPress={handleLogin}
                        loading={loading}
                        style={[styles.signInBtn, { backgroundColor: theme.cyan, shadowColor: theme.cyan }]}
                    />

                    <TouchableOpacity
                        style={styles.createAccount}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={[styles.createAccountText, { color: theme.textDim }]}>Create new account</Text>
                    </TouchableOpacity>

                    <View style={styles.socialSection}>
                        <Text style={[styles.orText, { color: theme.cyan }]}>Or continue with</Text>
                        <View style={styles.socialIcons}>
                            <TouchableOpacity style={[styles.socialIcon, { backgroundColor: theme.surface }]}>
                                <Icon name="chrome" size={24} color={theme.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.socialIcon, { backgroundColor: theme.surface }]}>
                                <Icon name="facebook" size={24} color={theme.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.socialIcon, { backgroundColor: theme.surface }]}>
                                <Icon name="apple" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    content: { flex: 1, padding: 32, justifyContent: 'center' },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 28
    },
    errorText: { color: '#ef4444', textAlign: 'center', marginBottom: 16 },
    input: { marginBottom: 20 },
    forgotPass: { alignSelf: 'flex-end', marginBottom: 32 },
    forgotPassText: { fontWeight: 'bold' },
    signInBtn: {
        height: 60,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    createAccount: { marginTop: 24, alignSelf: 'center' },
    createAccountText: { fontWeight: '600' },
    socialSection: { marginTop: 48, alignItems: 'center' },
    orText: { fontWeight: '600', marginBottom: 24 },
    socialIcons: { flexDirection: 'row', gap: 16 },
    socialIcon: {
        width: 50,
        height: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
