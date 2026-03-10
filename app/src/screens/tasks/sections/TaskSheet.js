/**
 * TaskSheet -- TASKTIME
 * Premium glass bottom-sheet for creating and editing tasks.
 * Consistent with BehaviorLogSheet / ProfilePanel glass language.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity,
    TextInput, ScrollView, Platform, KeyboardAvoidingView,
    Animated, Dimensions, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';

const { height: SCREEN_H } = Dimensions.get('window');

/* ── Priority selector pill ──────────────────────────────────────────────── */
const PRIORITIES = [
    { value: 'LOW', label: 'Low', icon: 'arrow-down-bold', color: '#00cc88' },
    { value: 'MEDIUM', label: 'Medium', icon: 'minus', color: '#eab308' },
    { value: 'HIGH', label: 'High', icon: 'arrow-up-bold', color: '#f97316' },
];

function PriorityPill({ item, selected, onPress, isDark }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[styles.priPill, {
                backgroundColor: selected
                    ? item.color + (isDark ? '1E' : '14')
                    : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                borderColor: selected
                    ? item.color + '55'
                    : (isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)'),
                ...Platform.select({
                    ios: selected ? {
                        shadowColor: item.color,
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.22,
                        shadowRadius: 8,
                    } : {},
                }),
            }]}
        >
            <Icon name={item.icon} size={12}
                color={selected ? item.color
                    : (isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.28)')} />
            <Text style={[styles.priPillTxt, {
                color: selected ? item.color
                    : (isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.38)'),
                fontWeight: selected ? '900' : '700',
            }]}>
                {item.label}
            </Text>
        </TouchableOpacity>
    );
}

/* ── Field label ─────────────────────────────────────────────────────────── */
function Label({ text, isDark }) {
    return (
        <Text style={[styles.label, {
            color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.32)',
        }]}>
            {text}
        </Text>
    );
}

/* ── Date row (simple inline date selector) ──────────────────────────────── */
function DateRow({ value, onChange, isDark, glassBg, glassBord, textColor }) {
    const today = new Date();
    // Quick picks: today, tomorrow, in 3 days, in 7 days, clear
    const picks = [
        { label: 'Today', days: 0 },
        { label: 'Tomorrow', days: 1 },
        { label: '3 Days', days: 3 },
        { label: '1 Week', days: 7 },
    ];

    const getDateStr = (days) => {
        const d = new Date(today);
        d.setDate(d.getDate() + days);
        return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
    };

    const isSelected = (days) => value === getDateStr(days);

    return (
        <View>
            <View style={styles.datePickRow}>
                {picks.map(p => (
                    <TouchableOpacity
                        key={p.label}
                        onPress={() => onChange(isSelected(p.days) ? '' : getDateStr(p.days))}
                        activeOpacity={0.75}
                        style={[styles.datePick, {
                            backgroundColor: isSelected(p.days)
                                ? (isDark ? 'rgba(0,212,255,0.14)' : 'rgba(0,212,255,0.10)')
                                : glassBg,
                            borderColor: isSelected(p.days) ? 'rgba(0,212,255,0.40)' : glassBord,
                        }]}
                    >
                        <Text style={[styles.datePickTxt, {
                            color: isSelected(p.days)
                                ? (isDark ? '#00d4ff' : '#0099bb')
                                : textColor,
                        }]}>
                            {p.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {/* Manual date display */}
            {value ? (
                <View style={[styles.dateDisplay, { backgroundColor: glassBg, borderColor: glassBord }]}>
                    <Icon name="calendar-check" size={14}
                        color={isDark ? 'rgba(0,212,255,0.80)' : 'rgba(0,153,187,0.80)'} />
                    <Text style={[styles.dateDisplayTxt, { color: isDark ? '#00d4ff' : '#0099bb' }]}>
                        {new Date(value + 'T12:00:00').toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric',
                        })}
                    </Text>
                    <TouchableOpacity onPress={() => onChange('')} style={{ marginLeft: 'auto' }}>
                        <Icon name="close-circle" size={16}
                            color={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)'} />
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function TaskSheet({
    visible,
    onClose,
    onSave,
    taskToEdit = null,
    categories = [],
    loading: savingProp = false,
}) {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';
    const slideY = useRef(new Animated.Value(SCREEN_H)).current;

    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

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
        if (taskToEdit) {
            setTitle(taskToEdit.title || '');
            setDesc(taskToEdit.description || '');
            setPriority(taskToEdit.priority || 'MEDIUM');
            const dateStr = taskToEdit.dueDate
                ? new Date(taskToEdit.dueDate).toLocaleDateString('en-CA')
                : '';
            setDueDate(dateStr);
            setCategoryId(taskToEdit.categoryId || taskToEdit.category?.id || '');
        } else {
            setTitle(''); setDesc(''); setPriority('MEDIUM'); setDueDate(''); setCategoryId('');
        }
        setError('');
    }, [visible, taskToEdit]);

    const handleSave = async () => {
        if (!title.trim()) { setError('Title is required.'); return; }
        setSaving(true); setError('');
        try {
            await onSave({
                title: title.trim(),
                description: desc.trim() || undefined,
                priority,
                dueDate: dueDate ? new Date(dueDate + 'T12:00:00').toISOString() : null,
                categoryId: categoryId || undefined,
            });
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to save task.');
        } finally {
            setSaving(false);
        }
    };

    /* glass tokens */
    const sheetBg = isDark ? 'rgba(10,10,14,0.98)' : 'rgba(250,250,255,0.98)';
    const sheetBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
    const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
    const inputBord = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)';
    const textMuted = isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.32)';
    const textColor = theme.text ?? '#fff';
    const placeholder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.20)';

    return (
        <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.avoidView}
                    >
                        <Animated.View style={[
                            styles.sheet,
                            {
                                backgroundColor: sheetBg,
                                borderColor: sheetBord,
                                paddingBottom: insets.bottom + 16,
                                transform: [{ translateY: slideY }],
                                ...Platform.select({
                                    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.22, shadowRadius: 24 },
                                    android: { elevation: 20 },
                                }),
                            },
                        ]}>
                            {/* Handle */}
                            <View style={[styles.handle, {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)',
                            }]} />

                            {/* Header */}
                            <View style={styles.header}>
                                <View>
                                    <Text style={[styles.sheetTitle, { color: textColor }]}>
                                        {taskToEdit ? 'Edit Task' : 'New Task'}
                                    </Text>
                                    <Text style={[styles.sheetSub, { color: textMuted }]}>
                                        {taskToEdit ? 'Update task details' : 'Add a new task'}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={[styles.closeBtn, { backgroundColor: glassBg, borderColor: glassBord }]}
                                >
                                    <Icon name="close" size={17} color={textMuted} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">

                                {/* Error */}
                                {error ? (
                                    <View style={[styles.errorBox, { backgroundColor: 'rgba(255,68,68,0.10)', borderColor: 'rgba(255,68,68,0.28)' }]}>
                                        <Icon name="alert-circle-outline" size={14} color="#ff4444" style={{ marginRight: 8 }} />
                                        <Text style={{ color: '#ff4444', fontSize: 12, fontWeight: '600', flex: 1 }}>{error}</Text>
                                    </View>
                                ) : null}

                                {/* ── TITLE ── */}
                                <View style={styles.section}>
                                    <Label text="TITLE" isDark={isDark} />
                                    <View style={[styles.inputWrap, { backgroundColor: inputBg, borderColor: inputBord }]}>
                                        <Icon name="format-title" size={15} color={textMuted} style={{ marginLeft: 14 }} />
                                        <TextInput
                                            value={title}
                                            onChangeText={setTitle}
                                            placeholder="What needs to be done?"
                                            placeholderTextColor={placeholder}
                                            style={[styles.input, { color: textColor }]}
                                            returnKeyType="next"
                                            autoFocus={visible && !taskToEdit}
                                        />
                                        {title.length > 0 && (
                                            <TouchableOpacity onPress={() => setTitle('')} style={{ marginRight: 12 }}>
                                                <Icon name="close-circle" size={16} color={textMuted} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {/* ── DESCRIPTION ── */}
                                <View style={styles.section}>
                                    <Label text="DESCRIPTION (OPTIONAL)" isDark={isDark} />
                                    <TextInput
                                        value={desc}
                                        onChangeText={setDesc}
                                        placeholder="Add details or context..."
                                        placeholderTextColor={placeholder}
                                        multiline
                                        style={[styles.textArea, {
                                            color: textColor,
                                            backgroundColor: inputBg,
                                            borderColor: inputBord,
                                        }]}
                                    />
                                </View>

                                {/* ── PRIORITY ── */}
                                <View style={styles.section}>
                                    <Label text="PRIORITY" isDark={isDark} />
                                    <View style={styles.priRow}>
                                        {PRIORITIES.map(p => (
                                            <PriorityPill
                                                key={p.value}
                                                item={p}
                                                selected={priority === p.value}
                                                onPress={() => setPriority(p.value)}
                                                isDark={isDark}
                                            />
                                        ))}
                                    </View>
                                </View>

                                {/* ── DUE DATE ── */}
                                <View style={styles.section}>
                                    <Label text="DUE DATE" isDark={isDark} />
                                    <DateRow
                                        value={dueDate}
                                        onChange={setDueDate}
                                        isDark={isDark}
                                        glassBg={glassBg}
                                        glassBord={glassBord}
                                        textColor={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.50)'}
                                    />
                                </View>

                                {/* ── CATEGORY ── */}
                                {categories.length > 0 && (
                                    <View style={styles.section}>
                                        <Label text="CATEGORY" isDark={isDark} />
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={{ gap: 8 }}
                                        >
                                            {/* None */}
                                            <TouchableOpacity
                                                onPress={() => setCategoryId('')}
                                                style={[styles.catPill, {
                                                    backgroundColor: !categoryId ? (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)') : glassBg,
                                                    borderColor: !categoryId ? (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.20)') : glassBord,
                                                }]}
                                            >
                                                <Text style={[styles.catPillTxt, {
                                                    color: !categoryId
                                                        ? (isDark ? '#fff' : '#000')
                                                        : textMuted,
                                                    fontWeight: !categoryId ? '900' : '700',
                                                }]}>
                                                    None
                                                </Text>
                                            </TouchableOpacity>
                                            {categories.map(cat => (
                                                <TouchableOpacity
                                                    key={cat.id}
                                                    onPress={() => setCategoryId(categoryId === cat.id ? '' : cat.id)}
                                                    style={[styles.catPill, {
                                                        backgroundColor: categoryId === cat.id
                                                            ? (isDark ? 'rgba(0,212,255,0.14)' : 'rgba(0,212,255,0.10)')
                                                            : glassBg,
                                                        borderColor: categoryId === cat.id
                                                            ? 'rgba(0,212,255,0.40)'
                                                            : glassBord,
                                                    }]}
                                                >
                                                    <Text style={[styles.catPillTxt, {
                                                        color: categoryId === cat.id ? cyan : textMuted,
                                                        fontWeight: categoryId === cat.id ? '900' : '700',
                                                    }]}>
                                                        {cat.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                {/* ── ACTIONS ── */}
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        onPress={onClose}
                                        style={[styles.cancelBtn, { backgroundColor: glassBg, borderColor: glassBord }]}
                                    >
                                        <Text style={[styles.cancelTxt, { color: textMuted }]}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={handleSave}
                                        disabled={saving || !title.trim()}
                                        style={[styles.saveBtn, {
                                            backgroundColor: saving || !title.trim() ? cyan + '66' : cyan,
                                            ...Platform.select({
                                                ios: !saving && title.trim() ? {
                                                    shadowColor: cyan, shadowOffset: { width: 0, height: 5 },
                                                    shadowOpacity: 0.35, shadowRadius: 12,
                                                } : {},
                                            }),
                                        }]}
                                    >
                                        <View style={styles.saveBtnShimmer} />
                                        <Icon name={saving ? 'loading' : (taskToEdit ? 'check' : 'plus')}
                                            size={16} color="#000" style={{ marginRight: 6 }} />
                                        <Text style={styles.saveTxt}>
                                            {saving ? 'Saving…' : taskToEdit ? 'Save Changes' : 'Create Task'}
                                        </Text>
                                    </TouchableOpacity>
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
    avoidView: { width: '100%' },
    sheet: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        paddingHorizontal: 22,
        paddingTop: 8,
        maxHeight: '94%',
    },
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

    /* sections */
    section: { marginBottom: 20 },
    label: {
        fontSize: 9, fontWeight: '900',
        letterSpacing: 2, marginBottom: 10,
    },

    /* text input */
    inputWrap: {
        height: 54,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1, height: '100%',
        fontSize: 15, fontWeight: '500',
        paddingHorizontal: 12,
    },
    textArea: {
        minHeight: 90,
        borderRadius: 18,
        borderWidth: 1,
        padding: 14,
        fontSize: 14,
        fontWeight: '500',
        textAlignVertical: 'top',
        lineHeight: 20,
    },

    /* priority */
    priRow: { flexDirection: 'row', gap: 8 },
    priPill: {
        flex: 1,
        height: 46,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    priPillTxt: { fontSize: 11, letterSpacing: 0.5 },

    /* date */
    datePickRow: { flexDirection: 'row', gap: 8 },
    datePick: {
        flex: 1,
        height: 38,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    datePickTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
    dateDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 14,
        marginTop: 10,
        gap: 8,
    },
    dateDisplayTxt: { fontSize: 13, fontWeight: '700', flex: 1 },

    /* category */
    catPill: {
        height: 36,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    catPillTxt: { fontSize: 11, letterSpacing: 0.5 },

    /* actions */
    actions: { flexDirection: 'row', gap: 12, marginBottom: 8 },
    cancelBtn: {
        flex: 1, height: 54,
        borderRadius: 18, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center',
    },
    cancelTxt: { fontSize: 14, fontWeight: '700' },
    saveBtn: {
        flex: 2, height: 54,
        borderRadius: 18,
        flexDirection: 'row',
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
    saveTxt: { color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: 0.2 },

    /* error */
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14, borderWidth: 1,
        padding: 12, marginBottom: 16,
    },
});