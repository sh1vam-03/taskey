import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';
import { format } from 'date-fns';

export default function ScheduleCard({ schedule, onToggleComplete, isToday = false }) {
    const isCompleted = schedule.status === 'COMPLETED';
    const { theme } = useTheme();

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        try {
            const d = new Date(timeStr);
            return isNaN(d) ? timeStr : format(d, 'h:mm a');
        } catch {
            return timeStr;
        }
    };

    return (
        <View style={[
            styles.cardContainer,
            { backgroundColor: theme.surface, borderColor: theme.border },
            isToday && { borderColor: theme.cyan, borderWidth: 2 }
        ]}>
            <View style={[styles.timeSection, { borderRightColor: theme.border }]}>
                <Text style={[styles.startTime, { color: theme.text }]}>{formatTime(schedule.startTime)}</Text>
                <View style={[styles.timeLine, { backgroundColor: theme.border }]} />
                <Text style={[styles.endTime, { color: theme.textDim }]}>{formatTime(schedule.endTime)}</Text>
            </View>

            <View style={styles.mainContent}>
                <View style={styles.titleRow}>
                    <Text style={[styles.title, { color: theme.text }, isCompleted && styles.completedTitle]} numberOfLines={1}>
                        {schedule.task?.title || 'Unknown Task'}
                    </Text>
                    <TouchableOpacity onPress={onToggleComplete} style={styles.checkbox}>
                        <View style={[
                            styles.checkboxInner,
                            { borderColor: isCompleted ? theme.success : theme.border },
                            isCompleted && { backgroundColor: theme.success }
                        ]}>
                            {isCompleted && <Icon name="check" size={12} color="#000" />}
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.metaRow}>
                    <View style={[
                        isToday ? styles.todayBadge : styles.categoryBadge,
                        { backgroundColor: isToday ? theme.cyanDim : theme.border }
                    ]}>
                        <Text style={[
                            isToday ? styles.todayBadgeText : styles.categoryText,
                            { color: isToday ? theme.cyan : theme.textDim }
                        ]}>
                            {isToday ? 'LIVE' : (schedule.task?.category?.name || 'Schedule')}
                        </Text>
                    </View>
                    {schedule.recurrence !== 'NONE' && (
                        <Icon name="repeat" size={12} color={theme.textDim} style={{ marginLeft: 8 }} />
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        borderRadius: 20,
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
    },
    timeSection: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 16,
        borderRightWidth: 1,
    },
    startTime: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    endTime: {
        fontSize: 10,
        marginTop: 4,
    },
    timeLine: {
        width: 2,
        height: 12,
        marginVertical: 4,
    },
    mainContent: {
        flex: 1,
        paddingLeft: 16,
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
        fontSize: 15,
        fontWeight: '600',
    },
    completedTitle: {
        textDecorationLine: 'line-through',
    },
    checkbox: {
        marginLeft: 8,
    },
    checkboxInner: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    todayBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    todayBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
});
