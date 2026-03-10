import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import PriorityBadge from '../components/PriorityBadge';

export default function TaskDetailScreen({ route, navigation }) {
    const { task } = route.params || {};
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';
    const textColor = theme.text ?? '#fff';

    if (!task) {
        return (
            <View style={[styles.root, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: textColor }}>Task not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: cyan }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const {
        title,
        description,
        priority,
        status,
        category,
        schedule,
        dueDate
    } = task;

    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';

    return (
        <View style={[styles.root, { backgroundColor: theme.bg ?? '#0a0a0a' }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.bg }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backBtn, { backgroundColor: glassBg, borderColor: glassBord }]}
                >
                    <Icon name="chevron-left" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Task Details</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('CreateTask', { task })}
                    style={[styles.editBtn, { backgroundColor: cyan + '18', borderColor: cyan + '33' }]}
                >
                    <Icon name="pencil" size={18} color={cyan} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
            >
                {/* Status & Priority */}
                <View style={styles.statusRow}>
                    <View style={[styles.statusBadge, {
                        backgroundColor: status === 'COMPLETED' ? '#00cc8822' : cyan + '18',
                        borderColor: status === 'COMPLETED' ? '#00cc8844' : cyan + '33'
                    }]}>
                        <Icon
                            name={status === 'COMPLETED' ? 'check-circle' : 'clock-outline'}
                            size={12}
                            color={status === 'COMPLETED' ? '#00cc88' : cyan}
                        />
                        <Text style={[styles.statusTxt, { color: status === 'COMPLETED' ? '#00cc88' : cyan }]}>
                            {status === 'COMPLETED' ? 'COMPLETED' : 'IN PROGRESS'}
                        </Text>
                    </View>
                    <PriorityBadge priority={priority} />
                </View>

                {/* Title */}
                <Text style={[styles.title, { color: textColor }]}>{title}</Text>

                {/* Category */}
                {category && (
                    <View style={[styles.categoryInfo, { backgroundColor: glassBg, borderColor: glassBord }]}>
                        <Icon name="tag-outline" size={14} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} />
                        <Text style={[styles.categoryTxt, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>
                            {category.name}
                        </Text>
                    </View>
                )}

                {/* Description */}
                {description && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }]}>
                            DESCRIPTION
                        </Text>
                        <View style={[styles.descBox, { backgroundColor: glassBg, borderColor: glassBord }]}>
                            <Text style={[styles.descTxt, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }]}>
                                {description}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Integration / Schedule info could go here if available */}
                {schedule && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }]}>
                            EVENT
                        </Text>
                        <View style={[styles.infoBox, { backgroundColor: glassBg, borderColor: glassBord }]}>
                            <Icon name="calendar-clock" size={18} color={cyan} />
                            <Text style={[styles.infoTxt, { color: textColor }]}>
                                {schedule.type} • {schedule.time}
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    scroll: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        gap: 6,
    },
    statusTxt: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        lineHeight: 36,
        marginBottom: 12,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
        marginBottom: 30,
    },
    categoryTxt: {
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        marginBottom: 25,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 10,
    },
    descBox: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
    },
    descTxt: {
        fontSize: 15,
        lineHeight: 24,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        gap: 15,
    },
    infoTxt: {
        fontSize: 14,
        fontWeight: '600',
    }
});
