/**
 * TaskCard -- TASKTIME
 * Premium glass task card with swipe-to-reveal edit/delete actions.
 * Tapping the card body navigates to TaskDetailScreen.
 */

import React, { useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Animated, PanResponder, Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import PriorityBadge from './PriorityBadge';

const SWIPE_THRESHOLD = 40;
const ACTION_WIDTH = 80;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDueDate(raw) {
    if (!raw) return null;
    const due = new Date(raw);
    if (isNaN(due)) return null;
    const now = new Date();
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueLocal = new Date(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
    const diff = Math.round((dueLocal - todayLocal) / 86400000);

    if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, overdue: true };
    if (diff === 0) return { label: 'TODAY', today: true };
    if (diff === 1) return { label: 'TOMORROW' };
    if (diff <= 7) return { label: `${diff}d left` };
    return { label: `${dueLocal.getDate()} ${MONTHS[dueLocal.getMonth()]}` };
}

export default function TaskCard({ item, onEdit, onDelete, onPress }) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';

    const translateX = useRef(new Animated.Value(0)).current;
    const rowScale = useRef(new Animated.Value(1)).current;

    const isCompleted = item.status === 'COMPLETED';
    const isMissed = item.status === 'MISSED';
    const isArchived = item.isArchived || item.archived;
    const hasSchedule = !!item.schedule;
    const due = formatDueDate(item.dueDate);
    const category = item.category?.name || item.category;

    /* glass tokens */
    const cardBg = isMissed
        ? (isDark ? 'rgba(255,68,68,0.07)' : 'rgba(255,68,68,0.04)')
        : isCompleted
            ? (isDark ? 'rgba(0,204,136,0.06)' : 'rgba(0,204,136,0.03)')
            : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)');
    const cardBord = isMissed
        ? 'rgba(255,68,68,0.22)'
        : isCompleted
            ? 'rgba(0,204,136,0.18)'
            : (isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)');

    /* swipe */
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
                Animated.spring(translateX, {
                    toValue: ACTION_WIDTH, useNativeDriver: true, speed: 18, bounciness: 3,
                }).start();
            } else if (g.dx < -SWIPE_THRESHOLD) {
                Animated.spring(translateX, {
                    toValue: -ACTION_WIDTH, useNativeDriver: true, speed: 18, bounciness: 3,
                }).start();
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
            {/* ── Back: action buttons ── */}
            {/* ── Back: action buttons ── */}
            <Animated.View style={[styles.leftActions, {
                opacity: translateX.interpolate({
                    inputRange: [0, 20],
                    outputRange: [0, 1],
                    extrapolate: 'clamp'
                })
            }]}>
                <TouchableOpacity
                    onPress={() => { close(); setTimeout(() => onDelete?.(item), 150); }}
                    activeOpacity={0.8}
                    style={[styles.actionBtn, {
                        backgroundColor: 'rgba(255,68,68,0.14)',
                        borderColor: 'rgba(255,68,68,0.32)',
                        width: ACTION_WIDTH,
                    }]}
                >
                    <Icon name="trash-can-outline" size={17} color="#ff4444" />
                    <Text style={[styles.actionTxt, { color: '#ff4444' }]}>DELETE</Text>
                </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[styles.rightActions, {
                opacity: translateX.interpolate({
                    inputRange: [-20, 0],
                    outputRange: [1, 0],
                    extrapolate: 'clamp'
                })
            }]}>
                <TouchableOpacity
                    onPress={() => { close(); setTimeout(() => onEdit?.(item), 150); }}
                    activeOpacity={0.8}
                    style={[styles.actionBtn, {
                        backgroundColor: cyan + '1E',
                        borderColor: cyan + '44',
                        width: ACTION_WIDTH,
                    }]}
                >
                    <Icon name="pencil-outline" size={17} color={cyan} />
                    <Text style={[styles.actionTxt, { color: cyan }]}>EDIT</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* ── Front: card ── */}
            <Animated.View
                style={{ transform: [{ translateX }, { scale: rowScale }] }}
                {...panResponder.panHandlers}
            >
                <TouchableOpacity
                    onPress={handlePress}
                    activeOpacity={0.88}
                    style={[
                        styles.card,
                        { backgroundColor: cardBg, borderColor: cardBord },
                        Platform.select({
                            ios: {
                                shadowColor: isMissed ? '#ff4444' : isCompleted ? '#00cc88' : '#000',
                                shadowOffset: { width: 0, height: 3 },
                                shadowOpacity: 0.08,
                                shadowRadius: 10,
                            },
                            android: { elevation: 2 },
                        }),
                    ]}
                >

                    <View style={styles.inner}>
                        {/* Title row */}
                        <View style={styles.titleRow}>
                            <Text
                                style={[
                                    styles.title,
                                    { color: theme.text ?? '#fff' },
                                    (isCompleted || isMissed) && styles.titleDone,
                                    (isCompleted || isMissed) && {
                                        color: isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.28)',
                                    },
                                ]}
                                numberOfLines={2}
                            >
                                {item.title}
                            </Text>

                            {/* Status icon */}
                            <View style={{ paddingTop: 1 }}>
                                {isCompleted ? (
                                    <Icon name="check-circle" size={19} color="#00cc88" />
                                ) : isMissed ? (
                                    <Icon name="close-circle" size={19} color="#ff4444" />
                                ) : isArchived ? (
                                    <Icon name="archive-outline" size={18}
                                        color={isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.20)'} />
                                ) : (
                                    <Icon name="circle-outline" size={19}
                                        color={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.16)'} />
                                )}
                            </View>
                        </View>

                        {/* Description */}
                        {item.description ? (
                            <Text
                                style={[styles.desc, {
                                    color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.30)',
                                }]}
                                numberOfLines={1}
                            >
                                {item.description}
                            </Text>
                        ) : null}

                        {/* Meta row */}
                        <View style={styles.meta}>
                            {/* Left badges */}
                            <View style={styles.metaLeft}>
                                <PriorityBadge priority={item.priority} size="sm" />

                                {due && (
                                    <View style={[styles.chip, {
                                        backgroundColor: due.overdue
                                            ? 'rgba(255,68,68,0.12)'
                                            : due.today
                                                ? 'rgba(0,204,136,0.12)'
                                                : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                                        borderColor: due.overdue
                                            ? 'rgba(255,68,68,0.30)'
                                            : due.today
                                                ? 'rgba(0,204,136,0.30)'
                                                : (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)'),
                                    }]}>
                                        <Icon
                                            name="calendar-outline"
                                            size={8}
                                            color={due.overdue ? '#ff4444' : due.today ? '#00cc88'
                                                : (isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.36)')}
                                        />
                                        <Text style={[styles.chipTxt, {
                                            color: due.overdue ? '#ff4444' : due.today ? '#00cc88'
                                                : (isDark ? 'rgba(255,255,255,0.48)' : 'rgba(0,0,0,0.44)'),
                                        }]}>
                                            {due.label}
                                        </Text>
                                    </View>
                                )}

                                {hasSchedule && (
                                    <View style={[styles.chip, {
                                        backgroundColor: isDark ? 'rgba(168,85,247,0.10)' : 'rgba(168,85,247,0.07)',
                                        borderColor: 'rgba(168,85,247,0.26)',
                                    }]}>
                                        <Icon name="calendar-clock" size={8} color="#a855f7" />
                                        <Text style={[styles.chipTxt, { color: '#a855f7' }]}>EVENT</Text>
                                    </View>
                                )}
                            </View>

                            {/* Right: category */}
                            {category ? (
                                <View style={[styles.chip, {
                                    backgroundColor: isDark ? 'rgba(0,212,255,0.09)' : 'rgba(0,212,255,0.06)',
                                    borderColor: 'rgba(0,212,255,0.22)',
                                }]}>
                                    <Icon name="tag-outline" size={8} color={cyan} />
                                    <Text style={[styles.chipTxt, { color: cyan }]} numberOfLines={1}>
                                        {category}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}


const styles = StyleSheet.create({
    wrap: { marginBottom: 8 },

    /* actions */
    leftActions: {
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        justifyContent: 'center',
        paddingVertical: 1,
    },
    rightActions: {
        position: 'absolute',
        right: 0, top: 0, bottom: 0,
        justifyContent: 'center',
        paddingVertical: 1,
    },
    actionBtn: {
        flex: 1,
        height: '100%',
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    actionTxt: {
        fontSize: 7,
        fontWeight: '900',
        letterSpacing: 0.8,
    },

    /* card */
    card: {
        borderRadius: 18,
        borderWidth: 1,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    inner: {
        flex: 1,
        padding: 14,
        paddingLeft: 16,
    },

    /* title */
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 8,
    },
    title: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 20,
    },
    titleDone: { textDecorationLine: 'line-through' },
    desc: {
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 15,
        marginBottom: 10,
        marginTop: -4,
    },

    /* meta */
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
    },
    metaLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 5,
        flex: 1,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1,
    },
    chipTxt: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});