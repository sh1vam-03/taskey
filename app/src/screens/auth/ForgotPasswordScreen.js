import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { forgotPassword } from '../../api/auth.api';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { theme } = useTheme();

    const handleForgot = async () => {
        setError('');
        setSuccess('');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return setError('Please enter a valid email address');

        setLoading(true);
        try {
            await forgotPassword(email);
            setSuccess('Reset code sent to your email.');
            setTimeout(() => {
                navigation.navigate('ResetPassword', { email });
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>

                <Text style={[styles.title, { color: theme.cyan }]}>Forgot Password</Text>
                <Text style={[styles.subtitle, { color: theme.textDim }]}>Enter your email to receive a reset code.</Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                {success ? <Text style={styles.successText}>{success}</Text> : null}

                <Input
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    leftIcon={<Icon name="mail" size={20} color={theme.textDim} />}
                />

                <Button title="Send Reset Code" onPress={handleForgot} loading={loading} style={{ marginTop: 24 }} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', padding: 24 },
    backButton: { position: 'absolute', top: 24, left: 24, zIndex: 10 },
    title: { fontSize: typography.fontSizes.xl, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: typography.fontSizes.md, textAlign: 'center', marginBottom: 32 },
    errorText: { color: '#ef4444', textAlign: 'center', marginBottom: 16 },
    successText: { color: '#10b981', textAlign: 'center', marginBottom: 16 },
});
