/**
 * BehaviorLogSheet -- TASKTIME
 * Premium glass bottom-sheet for logging daily behavior.
 * Same glass language as AppHeader / CustomTabBar / ProfilePanel.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity,
    TextInput, ScrollView, Platform, KeyboardAvoidingView,
    TouchableWithoutFeedback, Keyboard, Animated, Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

const { height: SCREEN_H } = Dimensions.get('window');

/* ─── Mood button ─────────────────────────────────────────────────────────── */
function MoodBtn({ type, icon, label, color, selected, onPress }) {
    const { isDark } = useTheme();
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[styles.moodBtn, {
                backgroundColor: selected
                    ? color + (isDark ? '1E' : '14')
                    : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                borderColor: selected
                    ? color + '55'
                    : (isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)'),
                ...Platform.select({
                    ios: selected ? {
                        shadowColor: color, shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25, shadowRadius: 10,
                    } : {},
                }),
            }]}
        >
            <Icon name={icon} size={26} color={selected ? color
                : (isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.28)')} />
            <Text style={[styles.moodLabel, {
                color: selected ? color
                    : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.32)'),
                fontWeight: selected ? '900' : '700',
            }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}


/* ─── Main component ──────────────────────────────────────────────────────── */
export default function BehaviorLogSheet({
    visible,
    onClose,
    onSave,
    currentLog = null,
    latestLog = null,
}) {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';
    const slideY = useRef(new Animated.Value(SCREEN_H)).current;

    const [mood, setMood] = useState('NEUTRAL');
    const [sleepHours, setSleepHours] = useState('7');
    const [exercise, setExercise] = useState(false);
    const [notes, setNotes] = useState('');

    /* slide animation */
    useEffect(() => {
        if (visible) {
            Animated.spring(slideY, { toValue: 0, speed: 18, bounciness: 3, useNativeDriver: true }).start();
        } else {
            Animated.timing(slideY, { toValue: SCREEN_H, duration: 260, useNativeDriver: true }).start();
        }
    }, [visible]);

    /* pre-fill */
    useEffect(() => {
        if (!visible) return;
        if (currentLog) {
            setMood(currentLog.mood || 'NEUTRAL');
            setSleepHours(String(currentLog.sleepHours ?? 7));
            setExercise(!!currentLog.exercise);
            setNotes(currentLog.notes || '');
        } else if (latestLog) {
            setMood('NEUTRAL');
            setSleepHours(String(latestLog.sleepHours ?? 7));
            setExercise(!!latestLog.exercise);
            setNotes('');
        } else {
            setMood('NEUTRAL'); setSleepHours('7'); setExercise(false); setNotes('');
        }
    }, [visible, currentLog, latestLog]);

    const handleSave = () => onSave({ mood, sleepHours: Number(sleepHours), exercise, notes });

    /* glass tokens */
    const sheetBg = isDark ? 'rgba(10,10,14,0.98)' : 'rgba(250,250,255,0.98)';
    const sheetBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
    const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
    const inputBord = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)';

    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    {/* dim backdrop */}
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ width: '100%', justifyContent: 'flex-end' }}
                    >
                        <Animated.View style={[
                            styles.sheet,
                            {
                                backgroundColor: sheetBg,
                                borderColor: sheetBord,
                                paddingBottom: insets.bottom,
                                transform: [{ translateY: slideY }],
                                ...Platform.select({
                                    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.22, shadowRadius: 24 },
                                    android: { elevation: 20 },
                                }),
                            },
                        ]}>
                            {/* Drag handle */}
                            <View style={[styles.handle, {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)',
                            }]} />

                            {/* Header */}
                            <View style={styles.header}>
                                <View>
                                    <Text style={[styles.sheetTitle, { color: theme.text ?? '#fff' }]}>
                                        {currentLog ? 'Update Activity' : 'Log Today\'s Activity'}
                                    </Text>
                                    <Text style={[styles.sheetSub, {
                                        color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                                    }]}>
                                        Track your mood, sleep & exercise
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={onClose}
                                    activeOpacity={0.75}
                                    style={[styles.closeBtn, { backgroundColor: glassBg, borderColor: glassBord }]}
                                >
                                    <Icon name="close" size={18}
                                        color={isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.45)'} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

                                {/* ── MOOD ── */}
                                <View style={styles.section}>
                                    <Text style={[styles.fieldLabel, { color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.32)' }]}>HOW DO YOU FEEL?</Text>
                                    <View style={styles.moodRow}>
                                        <MoodBtn type="HAPPY" icon="emoticon-happy-outline" label="HAPPY" color="#00cc88" selected={mood === 'HAPPY'} onPress={() => setMood('HAPPY')} />
                                        <MoodBtn type="NEUTRAL" icon="emoticon-neutral-outline" label="OKAY" color={cyan} selected={mood === 'NEUTRAL'} onPress={() => setMood('NEUTRAL')} />
                                        <MoodBtn type="SAD" icon="emoticon-sad-outline" label="SAD" color="#ff4444" selected={mood === 'SAD'} onPress={() => setMood('SAD')} />
                                    </View>
                                </View>

                                {/* ── SLEEP + EXERCISE ── */}
                                <View style={[styles.section, styles.twoCol]}>
                                    <View style={styles.halfCol}>
                                        <Input
                                            label="SLEEP HOURS"
                                            leftIcon="weather-night"
                                            value={sleepHours}
                                            onChangeText={setSleepHours}
                                            keyboardType="decimal-pad"
                                            placeholder="7.5"
                                            containerStyle={{ marginBottom: 0 }}
                                        />
                                    </View>

                                    {/* Exercise toggle */}
                                    <View style={styles.halfCol}>
                                        <Text style={[styles.fieldLabel, { color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.32)' }]}>EXERCISE</Text>
                                        <TouchableOpacity
                                            onPress={() => setExercise(!exercise)}
                                            activeOpacity={0.75}
                                            style={[
                                                styles.inputWrap,
                                                {
                                                    backgroundColor: exercise ? cyan + (isDark ? '1E' : '14') : inputBg,
                                                    borderColor: exercise ? cyan + '55' : inputBord,
                                                    ...Platform.select({
                                                        ios: exercise ? {
                                                            shadowColor: cyan,
                                                            shadowOffset: { width: 0, height: 0 },
                                                            shadowOpacity: 0.22,
                                                            shadowRadius: 8,
                                                        } : {},
                                                        android: exercise ? { elevation: 4 } : {},
                                                    }),
                                                }
                                            ]}
                                        >
                                            <Icon
                                                name={exercise ? 'check-circle' : 'circle-outline'}
                                                size={18}
                                                color={exercise ? cyan
                                                    : (isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.28)')}
                                                style={{ marginLeft: 14 }}
                                            />
                                            <Text style={[styles.exLabel, {
                                                color: exercise ? cyan
                                                    : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.40)'),
                                            }]}>
                                                {exercise ? 'Did it!' : 'Not today'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* ── NOTES ── */}
                                <View style={styles.section}>
                                    <Input
                                        label="NOTES (OPTIONAL)"
                                        value={notes}
                                        onChangeText={setNotes}
                                        multiline
                                        placeholder="Anything important about today?"
                                        style={{ minHeight: 100 }}
                                    />
                                </View>

                                {/* ── ACTIONS ── */}
                                <View style={styles.actions}>
                                    <Button
                                        title={currentLog ? 'Update' : 'Save Activity'}
                                        onPress={handleSave}
                                        style={{
                                            flex: 1,
                                            marginTop: 12,
                                            backgroundColor: cyan,
                                            height: 54,
                                            borderRadius: 18,
                                            ...Platform.select({
                                                ios: {
                                                    shadowColor: cyan,
                                                    shadowOffset: { width: 0, height: 8 },
                                                    shadowOpacity: 0.45,
                                                    shadowRadius: 18,
                                                },
                                                android: { elevation: 10 }
                                            })
                                        }}
                                        textStyle={{ color: '#000', fontWeight: '900', letterSpacing: 0.6 }}
                                    />
                                </View>

                            </ScrollView>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'flex-end',
    },
    avoidingView: { width: '100%', justifyContent: 'flex-end' },
    sheet: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        paddingHorizontal: 22,
        paddingTop: 8,
        maxHeight: '92%',
    },

    /* handle */
    handle: {
        width: 36, height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 10, marginBottom: 22,
    },

    /* header */
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    sheetTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
    sheetSub: { fontSize: 12, fontWeight: '500', marginTop: 3 },
    closeBtn: {
        width: 34, height: 34,
        borderRadius: 11,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* section */
    section: { marginBottom: 22 },
    twoCol: { flexDirection: 'row', gap: 12 },
    halfCol: { flex: 1 },
    fieldLabel: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 10,
    },

    /* mood */
    moodRow: { flexDirection: 'row', gap: 8 },
    moodBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        gap: 6,
    },
    moodLabel: { fontSize: 9, letterSpacing: 0.8 },

    inputWrap: {
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    exLabel: { fontSize: 13, fontWeight: '700', marginLeft: 10 },


    /* actions */
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    cancelBtn: {
        flex: 1,
        height: 54,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelTxt: { fontSize: 14, fontWeight: '700' },
    saveBtn: {
        flex: 2,
        height: 54,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    saveBtnShimmer: {
        position: 'absolute',
        top: 0, left: '10%',
        width: '35%', height: 1,
        backgroundColor: 'rgba(255,255,255,0.40)',
        borderRadius: 1,
    },
    saveTxt: { color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: 0.3 },
});