import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';

export default function TaskDetailScreen({ route, navigation }) {
    // Basic placeholder for now, as UI wasn't strictly defined
    const { taskId } = route.params || {};
    const { theme } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="chevron-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Task Details</Text>
            </View>

            <View style={styles.content}>
                <Text style={{ color: theme.textDim }}>Task ID: {taskId}</Text>
                <Text style={{ color: theme.text, marginTop: 16 }}>Details will go here.</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    backBtn: { paddingRight: 16 },
    headerTitle: { fontSize: typography.fontSizes.lg, fontWeight: 'bold' },
    content: { padding: 16 },
});
