import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Feather';
import PriorityBadge from './PriorityBadge';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';
import { format } from 'date-fns';

export default function TaskCard({ task, onToggleComplete, onDelete }) {
    const isCompleted = task.status === 'COMPLETED';
    const { theme } = useTheme();

    const renderRightActions = () => {
        return (
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: onDelete }
                    ]);
                }}
            >
                <Icon name="trash-2" size={24} color="#fff" />
            </TouchableOpacity>
        );
    };

    return (
        <Swipeable renderRightActions={renderRightActions} containerStyle={styles.swipeableContainer}>
            <View style={[
                styles.cardContainer,
                { backgroundColor: theme.surface, borderColor: theme.border },
                isCompleted && styles.completedCard
            ]}>
                <TouchableOpacity onPress={onToggleComplete} style={styles.checkbox}>
                    <View style={[
                        styles.checkboxInner,
                        { borderColor: isCompleted ? theme.success : theme.border },
                        isCompleted && { backgroundColor: theme.success }
                    ]}>
                        {isCompleted && <Icon name="check" size={14} color="#000" />}
                    </View>
                </TouchableOpacity>

                <View style={styles.content}>
                    <Text style={[styles.title, { color: theme.text }, isCompleted && styles.completedTitle]} numberOfLines={2}>
                        {task.title}
                    </Text>

                    <View style={styles.metaRow}>
                        {task.priority && <PriorityBadge priority={task.priority} />}
                        {task.category && (
                            <View style={[styles.categoryChip, { backgroundColor: theme.border }]}>
                                <Text style={[styles.categoryText, { color: theme.textDim }]}>
                                    {typeof task.category === 'object' ? task.category.name : task.category}
                                </Text>
                            </View>
                        )}
                        {task.dueDate && (
                            <View style={styles.dateChip}>
                                <Icon name="calendar" size={12} color={theme.textDim} style={{ marginRight: 4 }} />
                                <Text style={[styles.dateText, { color: theme.textDim }]}>
                                    {format(new Date(task.dueDate), 'MMM d')}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <TouchableOpacity style={styles.moreBtn}>
                    <Icon name="more-horizontal" size={20} color={theme.textDim} />
                </TouchableOpacity>
            </View>
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    swipeableContainer: {
        marginBottom: 12,
    },
    deleteButton: {
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        borderRadius: 20,
        marginLeft: 8,
    },
    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        padding: 16,
        paddingVertical: 18,
        borderWidth: 1,
    },
    completedCard: {
        opacity: 0.6,
    },
    checkbox: {
        marginRight: 16,
    },
    checkboxInner: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        lineHeight: 22,
    },
    completedTitle: {
        textDecorationLine: 'line-through',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '600',
    },
    dateChip: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4,
    },
    dateText: {
        fontSize: 11,
    },
    moreBtn: {
        padding: 8,
        marginLeft: 8,
    },
});
