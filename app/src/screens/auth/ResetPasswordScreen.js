import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { resetPassword } from '../../api/auth.api';

export default function ResetPasswordScreen({ route, navigation }) {
    const defaultEmail = route.params?.email || '';
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { theme } = useTheme();

    const handleReset = async () => {
        setError('');
        setSuccess('');

        if (!code) return setError('Please enter the reset code');
        if (password.length < 8) return setError('Password must be at least 8 characters long');
        if (!/[A-Z]/.test(password) && !/[0-9]/.test(password)) return setError('Password must include at least one uppercase letter or number');
        if (password !== confirmPassword) return setError('Passwords do not match');

        setLoading(true);
        try {
            await resetPassword(defaultEmail, code, password);
            setSuccess('Password reset successfully!');
            setTimeout(() => {
                navigation.navigate('Login');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={24} color={theme.text} />
                    </TouchableOpacity>

                    <Text style={[styles.title, { color: theme.cyan }]}>Reset Password</Text>
                    <Text style={[styles.subtitle, { color: theme.textDim }]}>Enter the code sent to {defaultEmail}</Text>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    {success ? <Text style={styles.successText}>{success}</Text> : null}

                    <Input
                        label="Reset Code"
                        placeholder="Enter 6-digit code"
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        leftIcon={<Icon name="key" size={20} color={theme.textDim} />}
                    />

                    <Input
                        label="New Password"
                        placeholder="Create a new password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        leftIcon={<Icon name="lock" size={20} color={theme.textDim} />}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Icon name={showPassword ? "eye" : "eye-off"} size={20} color={theme.textDim} />
                            </TouchableOpacity>
                        }
                    />

                    <Input
                        label="Confirm Password"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                        leftIcon={<Icon name="lock" size={20} color={theme.textDim} />}
                    />

                    <Button title="Reset Password" onPress={handleReset} loading={loading} style={{ marginTop: 24 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 60 },
    backButton: { position: 'absolute', top: 0, left: 0, zIndex: 10 },
    title: { fontSize: typography.fontSizes.xl, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: typography.fontSizes.md, textAlign: 'center', marginBottom: 32 },
    errorText: { color: '#ef4444', textAlign: 'center', marginBottom: 16 },
    successText: { color: '#10b981', textAlign: 'center', marginBottom: 16 },
});
