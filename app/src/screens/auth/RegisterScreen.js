import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { register } from '../../api/auth.api';

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { theme } = useTheme();

    const handleRegister = async () => {
        setError('');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name.trim()) return setError('Please enter your name');
        if (!emailRegex.test(email)) return setError('Please enter a valid email address');
        if (password.length < 8) return setError('Password must be at least 8 characters long');
        if (password !== confirmPassword) return setError('Passwords do not match');

        setLoading(true);
        try {
            await register(name, email, password);
            navigation.navigate('OtpVerification', { email });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
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
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.title, { color: theme.cyan }]}>Create Account</Text>
                    <Text style={[styles.subtitle, { color: theme.text }]}>Create an account so you can explore all the{'\n'}existing jobs</Text>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Input
                        placeholder="Name"
                        value={name}
                        onChangeText={setName}
                        containerStyle={styles.input}
                    />

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
                        secureTextEntry
                        containerStyle={styles.input}
                    />

                    <Input
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        containerStyle={styles.input}
                    />

                    <Button
                        title="Sign up"
                        onPress={handleRegister}
                        loading={loading}
                        style={[styles.signUpBtn, { backgroundColor: theme.cyan, shadowColor: theme.cyan }]}
                    />

                    <TouchableOpacity
                        style={styles.loginRedirect}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={[styles.loginRedirectText, { color: theme.textDim }]}>Already have an account</Text>
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
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, padding: 32, justifyContent: 'center' },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 20
    },
    errorText: { color: '#ef4444', textAlign: 'center', marginBottom: 16 },
    input: { marginBottom: 20 },
    signUpBtn: {
        height: 60,
        borderRadius: 12,
        marginTop: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    loginRedirect: { marginTop: 24, alignSelf: 'center' },
    loginRedirectText: { fontWeight: '600' },
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
