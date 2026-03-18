import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Platform, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

const AlertContext = createContext({});

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const { theme, isDark } = useTheme();
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState({
        title: '',
        message: '',
        buttons: [],
    });

    const alert = useCallback((title, message, buttons = [{ text: 'OK' }]) => {
        setConfig({ title, message, buttons });
        setVisible(true);
    }, []);

    const close = () => setVisible(false);

    return (
        <AlertContext.Provider value={{ alert }}>
            {children}
            <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
                <Pressable style={styles.backdrop} onPress={close} />
                <View style={styles.center}>
                    <View style={[styles.box, { backgroundColor: isDark ? '#1a1a1e' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                        {/* ICON / HEADER ACCENT */}
                        <View style={[styles.iconCircle, { backgroundColor: theme.cyan + '15' }]}>
                            <Icon name="information-outline" size={32} color={theme.cyan} />
                        </View>

                        <Text style={[styles.title, { color: theme.text }]}>{config.title}</Text>
                        <Text style={[styles.message, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>{config.message}</Text>

                        <View style={styles.actions}>
                            {config.buttons.map((btn, i) => {
                                const isDestructive = btn.style === 'destructive';
                                const isCancel = btn.style === 'cancel';
                                const isPrimary = !isCancel && !isDestructive;

                                return (
                                    <TouchableOpacity
                                        key={i}
                                        activeOpacity={0.8}
                                        style={[
                                            styles.btn,
                                            isDestructive && styles.btnDestructive,
                                            isPrimary && { backgroundColor: theme.cyan },
                                            isCancel && { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                                            config.buttons.length > 2 && { width: '100%' }
                                        ]}
                                        onPress={() => {
                                            close();
                                            if (btn.onPress) btn.onPress();
                                        }}
                                    >
                                        <Text style={[
                                            styles.btnText,
                                            isPrimary && { color: '#000' },
                                            isDestructive && { color: '#fff' },
                                            isCancel && { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }
                                        ]}>
                                            {btn.text}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </Modal>
        </AlertContext.Provider>
    );
};

const styles = StyleSheet.create({
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    box: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 28,
        borderWidth: 1,
        padding: 24,
        alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
            android: { elevation: 10 }
        })
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
    },
    title: { fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 10, letterSpacing: -0.5 },
    message: { fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
    actions: { width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 12, flexWrap: 'wrap' },
    btn: {
        flex: 1,
        height: 50,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    btnDestructive: { backgroundColor: '#ef4444' },
    btnText: { fontSize: 15, fontWeight: '800' }
});
