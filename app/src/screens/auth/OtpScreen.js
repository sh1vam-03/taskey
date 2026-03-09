import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { verifyOtp } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';

export default function OtpScreen({ route, navigation }) {
    const email = route.params?.email || '';
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cooldown, setCooldown] = useState(30);
    const inputsRef = useRef([]);
    const setAuth = useAuthStore(state => state.setAuth);
    const { theme } = useTheme();

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => setCooldown(c => c - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleChange = (text, index) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text && index < 5) {
            inputsRef.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputsRef.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        const otp = code.join('');
        if (otp.length < 6) return setError('Please enter complete OTP');

        setError('');
        setLoading(true);
        try {
            const { data: response } = await verifyOtp(email, otp);
            setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
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
                    <Text style={[styles.title, { color: theme.cyan }]}>Verification</Text>
                    <Text style={[styles.subtitle, { color: theme.text }]}>Enter the 6-digit code sent to{'\n'}{email}</Text>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.codeContainer}>
                        {code.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={el => inputsRef.current[index] = el}
                                style={[styles.codeInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                                keyboardType="number-pad"
                                maxLength={1}
                                value={digit}
                                onChangeText={(text) => handleChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                placeholderTextColor={theme.textDim}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    <Button
                        title="Verify"
                        onPress={handleVerify}
                        loading={loading}
                        style={[styles.verifyBtn, { backgroundColor: theme.cyan, shadowColor: theme.cyan }]}
                    />

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.textDim }]}>Didn't receive code? </Text>
                        <TouchableOpacity onPress={() => setCooldown(30)} disabled={cooldown > 0}>
                            <Text style={[styles.resendText, { color: theme.cyan }, cooldown > 0 && { color: theme.textDim }]}>
                                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
                            </Text>
                        </TouchableOpacity>
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
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24
    },
    errorText: { color: '#ef4444', textAlign: 'center', marginBottom: 16 },
    codeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
    codeInput: {
        width: 45,
        height: 56,
        borderWidth: 1,
        borderRadius: 12,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    verifyBtn: {
        height: 60,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
    footerText: {},
    resendText: { fontWeight: 'bold' },
});
