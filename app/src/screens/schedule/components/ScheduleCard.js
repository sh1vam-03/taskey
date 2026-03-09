import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { format } from 'date-fns';

export default function ScheduleCard({ schedule, onToggleComplete, isToday = false }) {
    const isCompleted = schedule.status === 'COMPLETED';
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        try {
            const d = new Date(timeStr);
            return isNaN(d) ? timeStr : format(d, 'hh:mm a');
        } catch {
            return timeStr;
        }
    };

    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
    const textColor = theme.text ?? '#fff';

    return (
        <View style={[
            styles.cardContainer,
            {
                backgroundColor: glassBg,
                borderColor: isToday ? cyan + '44' : glassBord,
                borderWidth: isToday ? 1.5 : 1
            }
        ]}>
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
                            }
                        ]}
                        numberOfLines={1}
                    >
                        {schedule.task?.title || 'Unknown Objective'}
                    </Text>
                    <TouchableOpacity
                        onPress={onToggleComplete}
                        style={styles.checkbox}
                        activeOpacity={0.7}
                    >
                        <View style={[
                            styles.checkboxInner,
                            {
                                borderColor: isCompleted ? '#00cc88' : glassBord,
                                backgroundColor: isCompleted ? '#00cc8822' : 'transparent'
                            }
                        ]}>
                            {isCompleted && <Icon name="check" size={12} color="#00cc88" />}
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
                            {isToday ? 'LIVE' : (schedule.task?.category?.name || 'TEMPORAL')}
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
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        borderRadius: 22,
        marginBottom: 12,
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
