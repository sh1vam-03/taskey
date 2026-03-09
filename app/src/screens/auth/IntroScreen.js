import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

export default function IntroScreen({ navigation }) {
    const { theme } = useTheme();
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={styles.content}>
                <View style={[styles.imagePlaceholder, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.imageText, { color: theme.textDim }]}>ILLUSTRATION HERE</Text>
                </View>

                <Text style={[styles.title, { color: theme.cyan }]}>Discover Your Dream Job here</Text>
                <Text style={[styles.subtitle, { color: theme.text }]}>
                    Explore all the existing job roles based on your interest and study major
                </Text>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.loginBtn, { backgroundColor: theme.cyan, shadowColor: theme.cyan }]}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginBtnText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.registerBtn}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={[styles.registerBtnText, { color: theme.text }]}>Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: 32, justifyContent: 'center', alignItems: 'center' },
    imagePlaceholder: {
        width: '100%',
        height: 300,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    imageText: {},
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    loginBtn: {
        flex: 1,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    loginBtnText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
    registerBtn: {
        flex: 1,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    registerBtnText: { fontSize: 18, fontWeight: 'bold' },
});
