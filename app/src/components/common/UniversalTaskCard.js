import React, { useRef, useCallback, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Animated, PanResponder, Platform, Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { format } from 'date-fns';
import PriorityBadge from './PriorityBadge';

const SWIPE_THRESHOLD = 40;
const ACTION_WIDTH = 80;
const { width: W } = Dimensions.get('window');

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function UniversalTaskCard({
    item,
    type = 'TASK',
    onComplete,
    onEdit,
    onDelete,
    onPress,
    isToday = false,
    hideActions = false
}) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';
    const textColor = theme.text ?? '#fff';

    const translateX = useRef(new Animated.Value(0)).current;
    const rowScale = useRef(new Animated.Value(1)).current;

    const isCompleted = item.status === 'COMPLETED' || item.isCompleted;
    const isMissed = item.status === 'MISSED';

    // Extract data following web logic
    const schedule = item.schedule || {};
    const startTime = schedule.time || item.startTime;
    const endTime = schedule.endTime || item.endTime;
    const recurrence = schedule.type || item.recurrence;
    const repeatDays = schedule.days || item.repeatOnDays;
    const title = item.title || item.task?.title || 'Untitled';
    const description = item.notes || item.description || item.task?.description;
    const category = item.category || item.task?.category;
    const priority = (item.priority || 'MEDIUM').toUpperCase();

    const isScheduleType = type === 'SCHEDULE' || item.type === 'SCHEDULED' || !!item.schedule?.type || !!item.recurrence;

    // Time formatting
    const fmt = (t) => {
        if (!t) return null;
        try {
            if (typeof t === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(t)) {
                const parts = t.split(':');
                const hours = parseInt(parts[0], 10);
                const minutes = parseInt(parts[1], 10);
                const period = hours >= 12 ? 'pm' : 'am';
                const h12 = hours % 12 || 12;
                return { time: `${h12}:${String(minutes).padStart(2, '0')}`, period };
            }
            const d = new Date(t);
            if (isNaN(d.getTime())) return null;
            const hours = d.getHours();
            const minutes = d.getMinutes();
            const period = hours >= 12 ? 'pm' : 'am';
            const h12 = hours % 12 || 12;
            return { time: `${h12}:${String(minutes).padStart(2, '0')}`, period };
        } catch {
            return null;
        }
    };

    const fmtStart = fmt(startTime);
    const fmtEnd = fmt(endTime);

    const TimeDisplay = ({ data, size = 'lg' }) => {
        if (!data) return null;
        const isLg = size === 'lg';
        return (
            <View style={styles.timeWrap}>
                <Text style={[
                    isLg ? styles.timeTextLg : styles.timeTextSm,
                    { color: isLg ? cyan : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)') }
                ]}>
                    {data.time}
                </Text>
                <Text style={[
                    isLg ? styles.periodTextLg : styles.periodTextSm,
                    { color: isLg ? cyan : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') }
                ]}>
                    {data.period}
                </Text>
            </View>
        );
    };

    // Recurrence Label
    const recText = (() => {
        if (!isScheduleType) return null;
        if (!recurrence || recurrence === 'NONE') return 'ONETIME';
        if (recurrence === 'DAILY') return 'DAILY';
        if (recurrence === 'WEEKLY') {
            if (!repeatDays?.length) return 'WEEKLY';
            return `WEEKLY - ${[...repeatDays].sort((a, b) => a - b).map(d => DAY_NAMES[d]).join(', ')}`;
        }
        if (recurrence === 'MONTHLY') {
            return 'MONTHLY';
        }
        return recurrence;
    })();

    // Due Date Label
    const dueDateLabel = (() => {
        if (isScheduleType) return null;
        const raw = item.dueDate;
        if (!raw) return 'TODAY';
        try {
            const due = new Date(raw);
            if (isNaN(due.getTime())) return 'TODAY';
            const now = new Date();
            const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const dueLocal = new Date(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());

            if (dueLocal.getTime() === todayLocal.getTime()) return 'TODAY';
            const diff = Math.round((dueLocal - todayLocal) / 86400000);
            if (diff < 0) return `${Math.abs(diff)}d overdue`;

            const dueDay = dueLocal.getDate();
            const dueMonth = MONTH_NAMES[dueLocal.getMonth()];
            if (dueLocal.getFullYear() === now.getFullYear()) {
                return `END at ${dueDay} ${dueMonth}`;
            }
            return `END at ${dueDay} ${dueMonth} ${String(dueLocal.getFullYear()).slice(-2)}`;
        } catch {
            return 'TODAY';
        }
    })();

    /* glass styling */
    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';

    const cardBg = isMissed
        ? (isDark ? 'rgba(255,68,68,0.07)' : 'rgba(255,68,68,0.04)')
        : isCompleted
            ? (isDark ? 'rgba(0,204,136,0.06)' : 'rgba(0,204,136,0.03)')
            : glassBg;

    const cardBord = isMissed
        ? 'rgba(255,68,68,0.22)'
        : isCompleted
            ? 'rgba(0,204,136,0.18)'
            : (isToday ? cyan + '44' : glassBord);

    /* swipe handlers */
    const close = useCallback(() => {
        Animated.spring(translateX, {
            toValue: 0, useNativeDriver: true, speed: 22, bounciness: 4,
        }).start();
    }, [translateX]);

    const panResponder = useRef(PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
            Math.abs(g.dx) > 8 && Math.abs(g.dy) < 14,
        onPanResponderGrant: () => {
            Animated.spring(rowScale, { toValue: 0.985, useNativeDriver: true, speed: 40 }).start();
        },
        onPanResponderMove: (_, g) => {
            translateX.setValue(Math.max(-ACTION_WIDTH - 10, Math.min(ACTION_WIDTH + 10, g.dx)));
        },
        onPanResponderRelease: (_, g) => {
            Animated.spring(rowScale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
            if (g.dx > SWIPE_THRESHOLD) {
                Animated.spring(translateX, { toValue: ACTION_WIDTH, useNativeDriver: true, speed: 18, bounciness: 3 }).start();
            } else if (g.dx < -SWIPE_THRESHOLD) {
                Animated.spring(translateX, { toValue: -ACTION_WIDTH, useNativeDriver: true, speed: 18, bounciness: 3 }).start();
            } else {
                close();
            }
        },
    })).current;

    const handlePress = () => {
        if (translateX._value !== 0) { close(); return; }
        onPress?.(item);
    };

    return (
        <View style={styles.wrap}>
            {/* Action Buttons Background */}
            <Animated.View style={[styles.leftActions, {
                opacity: translateX.interpolate({ inputRange: [0, 20], outputRange: [0, 1], extrapolate: 'clamp' })
            }]}>
                <TouchableOpacity
                    onPress={() => { close(); setTimeout(() => onDelete?.(item), 150); }}
                    style={[styles.actionBtn, { backgroundColor: 'rgba(255,68,68,0.14)', borderColor: 'rgba(255,68,68,0.32)', width: ACTION_WIDTH }]}
                >
                    <Icon name="trash-can-outline" size={18} color="#ff4444" />
                    <Text style={[styles.actionTxt, { color: '#ff4444' }]}>DELETE</Text>
                </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[styles.rightActions, {
                opacity: translateX.interpolate({ inputRange: [-20, 0], outputRange: [1, 0], extrapolate: 'clamp' })
            }]}>
                <TouchableOpacity
                    onPress={() => { close(); setTimeout(() => onEdit?.(item), 150); }}
                    style={[styles.actionBtn, { backgroundColor: cyan + '1E', borderColor: cyan + '44', width: ACTION_WIDTH }]}
                >
                    <Icon name="pencil-outline" size={18} color={cyan} />
                    <Text style={[styles.actionTxt, { color: cyan }]}>EDIT</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Foreground Card */}
            <Animated.View
                style={{ transform: [{ translateX }, { scale: rowScale }] }}
                {...panResponder.panHandlers}
            >
                <TouchableOpacity
                    onPress={handlePress}
                    activeOpacity={0.88}
                    style={[
                        styles.card,
                        { backgroundColor: cardBg, borderColor: cardBord, opacity: (isCompleted || isMissed) ? 0.6 : 1 }
                    ]}
                >
                    {/* Main Row: Time | Content | Action */}
                    <View style={styles.mainRow}>
                        {/* Zone 1: Time */}
                        <View style={styles.timeZone}>
                            {fmtStart ? (
                                <TimeDisplay data={fmtStart} size="lg" />
                            ) : (
                                <Text style={styles.anytimeText}>ANYTIME</Text>
                            )}
                            {fmtEnd && <TimeDisplay data={fmtEnd} size="sm" />}
                        </View>

                        {/* Zone 2: Content */}
                        <View style={styles.contentZone}>
                            <Text
                                style={[
                                    styles.title,
                                    { color: textColor },
                                    isCompleted && styles.completedText
                                ]}
                                numberOfLines={1}
                            >
                                {title}
                            </Text>
                            {description ? (
                                <Text
                                    style={[
                                        styles.desc,
                                        { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' },
                                        isCompleted && styles.completedText
                                    ]}
                                    numberOfLines={1}
                                >
                                    {description}
                                </Text>
                            ) : null}
                        </View>

                        {/* Zone 3: Action */}
                        {!hideActions && onComplete && (
                            <TouchableOpacity
                                onPress={() => onComplete(item)}
                                style={styles.checkZone}
                            >
                                <Icon
                                    name={isCompleted ? "check-circle" : "circle-outline"}
                                    size={22}
                                    color={isCompleted ? "#00cc88" : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')}
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Bottom Meta Row */}
                    <View style={[styles.metaRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <View style={styles.metaLeft}>
                            {recText && (
                                <View style={[styles.badge, styles.recBadge]}>
                                    <Text style={styles.recBadgeText}>{recText}</Text>
                                </View>
                            )}
                            {dueDateLabel && (
                                <View style={[
                                    styles.badge,
                                    dueDateLabel === 'TODAY' ? styles.todayBadge : styles.dueBadge
                                ]}>
                                    <Text style={dueDateLabel === 'TODAY' ? styles.todayBadgeText : styles.dueBadgeText}>
                                        {dueDateLabel}
                                    </Text>
                                </View>
                            )}
                            {isMissed && (
                                <View style={[styles.badge, styles.missedBadge]}>
                                    <Text style={styles.missedBadgeText}>MISSED</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.metaRight}>
                            <PriorityBadge priority={priority} size="sm" />

                            <View style={[styles.badge, styles.typeBadge]}>
                                <Text style={styles.typeBadgeText}>{isScheduleType ? "EVENT" : "TASK"}</Text>
                            </View>

                            {category && (
                                <View style={[styles.badge, styles.catBadge]}>
                                    <Text style={styles.catBadgeText}>{category.name || category}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { marginBottom: 12 },
    /* actions */
    leftActions: {
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        justifyContent: 'center',
    },
    rightActions: {
        position: 'absolute',
        right: 0, top: 0, bottom: 0,
        justifyContent: 'center',
    },
    actionBtn: {
        flex: 1,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    actionTxt: {
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    /* card */
    card: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 14,
        overflow: 'hidden',
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    timeZone: {
        width: 85,
        justifyContent: 'center',
    },
    timeWrap: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
    },
    timeTextLg: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -1,
    },
    periodTextLg: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    timeTextSm: {
        fontSize: 14,
        fontWeight: '600',
    },
    periodTextSm: {
        fontSize: 9,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    anytimeText: {
        fontSize: 11,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.25)',
        letterSpacing: 1,
    },
    contentZone: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    desc: {
        fontSize: 11,
        fontWeight: '500',
    },
    completedText: {
        textDecorationLine: 'line-through',
        opacity: 0.5,
    },
    checkZone: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    /* bottom row */
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
    },
    metaLeft: {
        flexDirection: 'row',
        gap: 6,
        flex: 1,
        flexWrap: 'wrap',
    },
    metaRight: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    /* variants */
    recBadge: { backgroundColor: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.2)' },
    recBadgeText: { color: '#a855f7', fontSize: 8, fontWeight: '800' },
    todayBadge: { backgroundColor: 'rgba(0,204,136,0.1)', borderColor: 'rgba(0,204,136,0.2)' },
    todayBadgeText: { color: '#00cc88', fontSize: 8, fontWeight: '800' },
    dueBadge: { backgroundColor: 'rgba(249,115,22,0.1)', borderColor: 'rgba(249,115,22,0.2)' },
    dueBadgeText: { color: '#f97316', fontSize: 8, fontWeight: '800' },
    missedBadge: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)' },
    missedBadgeText: { color: '#ef4444', fontSize: 8, fontWeight: '800' },
    typeBadge: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
    typeBadgeText: { color: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: '800' },
    catBadge: { backgroundColor: 'rgba(0,212,255,0.1)', borderColor: 'rgba(0,212,255,0.2)' },
    catBadgeText: { color: '#00d4ff', fontSize: 8, fontWeight: '800' },
});
