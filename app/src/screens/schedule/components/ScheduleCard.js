import React, { useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Animated, PanResponder, Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { format } from 'date-fns';

const SWIPE_THRESHOLD = 40;
const ACTION_WIDTH = 80;

export default function ScheduleCard({ schedule, onToggleComplete, onEdit, onDelete, isToday = false }) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';

    const translateX = useRef(new Animated.Value(0)).current;
    const rowScale = useRef(new Animated.Value(1)).current;

    const isCompleted = schedule.status === 'COMPLETED';
    const isMissed = schedule.status === 'MISSED';

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        try {
            const d = new Date(timeStr);
            return isNaN(d) ? timeStr : format(d, 'hh:mm a');
        } catch {
            return timeStr;
        }
    };

    /* glass tokens */
    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
    const textColor = theme.text ?? '#fff';

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
                // Wipe left -> Delete
                Animated.spring(translateX, {
                    toValue: ACTION_WIDTH, useNativeDriver: true, speed: 18, bounciness: 3,
                }).start();
            } else if (g.dx < -SWIPE_THRESHOLD) {
                // Swipe right -> Edit
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
        // Potentially navigate details? Web version might not do this yet.
    };

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

    return (
        <View style={styles.wrap}>
            {/* ── Back: action buttons ── */}
            <Animated.View style={[styles.leftActions, {
                opacity: translateX.interpolate({
                    inputRange: [0, 20],
                    outputRange: [0, 1],
                    extrapolate: 'clamp'
                })
            }]}>
                <TouchableOpacity
                    onPress={() => { close(); setTimeout(() => onDelete?.(schedule), 150); }}
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
                    onPress={() => { close(); setTimeout(() => onEdit?.(schedule), 150); }}
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
                        styles.cardContainer,
                        {
                            backgroundColor: cardBg,
                            borderColor: cardBord,
                            borderWidth: isToday ? 1.5 : 1,
                            opacity: (isCompleted || isMissed) ? 0.6 : 1
                        }
                    ]}
                >
                    <View style={[styles.timeSection, { borderRightColor: glassBord }]}>
                        <Text style={[styles.startTime, { color: textColor }]}>
                            {formatTime(schedule.startTime)}
                        </Text>
                        <View style={[styles.timeLine, { backgroundColor: isToday ? cyan : glassBord }]} />
                        <Text style={[styles.endTime, { color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)' }]}>
                            {formatTime(schedule.endTime)}
                        </Text>
                    </View>

                    <View style={styles.mainContent}>
                        <View style={styles.titleRow}>
                            <Text
                                style={[
                                    styles.title,
                                    { color: textColor },
                                    isCompleted && {
                                        color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                                        textDecorationLine: 'line-through'
                                    },
                                    isMissed && {
                                        color: '#ff444488'
                                    }
                                ]}
                                numberOfLines={1}
                            >
                                {schedule.task?.title || 'Untitled Task'}
                            </Text>
                            <TouchableOpacity
                                onPress={onToggleComplete}
                                style={styles.checkbox}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.checkboxInner,
                                    {
                                        borderColor: isCompleted ? '#00cc88' : isMissed ? '#ff4444' : glassBord,
                                        backgroundColor: isCompleted ? '#00cc8822' : isMissed ? '#ff444411' : 'transparent'
                                    }
                                ]}>
                                    {isCompleted && <Icon name="check" size={12} color="#00cc88" />}
                                    {isMissed && <Icon name="close" size={12} color="#ff4444" />}
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.metaRow}>
                            <View style={[
                                styles.badge,
                                { backgroundColor: isToday ? cyan + '18' : glassBg }
                            ]}>
                                <Text style={[
                                    styles.badgeText,
                                    { color: isToday ? cyan : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)') }
                                ]}>
                                    {isToday ? 'NOW' : (schedule.task?.category?.name || 'GENERAL')}
                                </Text>
                            </View>

                            {schedule.recurrence && schedule.recurrence !== 'NONE' && (
                                <View style={[styles.recurrenceWrap, { backgroundColor: 'rgba(168,85,247,0.1)' }]}>
                                    <Icon name="repeat" size={10} color="#a855f7" />
                                    <Text style={styles.recurrenceTxt}>{schedule.recurrence}</Text>
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
    cardContainer: {
        flexDirection: 'row',
        borderRadius: 22,
        padding: 14,
        overflow: 'hidden',
    },
    timeSection: {
        width: 75,
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 10,
        borderRightWidth: 1,
    },
    startTime: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    endTime: {
        fontSize: 9,
        fontWeight: '700',
    },
    timeLine: {
        width: 1.5,
        height: 10,
        marginVertical: 4,
        borderRadius: 1,
    },
    mainContent: {
        flex: 1,
        paddingLeft: 14,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    title: {
        flex: 1,
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: -0.2,
    },
    checkbox: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxInner: {
        width: 20,
        height: 20,
        borderRadius: 7,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 7,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    recurrenceWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 7,
        gap: 4,
    },
    recurrenceTxt: {
        fontSize: 8,
        fontWeight: '900',
        color: '#a855f7',
        textTransform: 'uppercase',
    }
});
