import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';
import { getBehavior, logBehavior } from '../../api/behavior.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const MOODS = [
    { id: 'SAD', emoji: '😔', label: 'Sad' },
    { id: 'NEUTRAL', emoji: '😐', label: 'Neutral' },
    { id: 'HAPPY', emoji: '😊', label: 'Happy' }
];

export default function BehaviorScreen() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [mood, setMood] = useState('NEUTRAL');
    const [sleep, setSleep] = useState(7);
    const [exercise, setExercise] = useState(false);
    const [notes, setNotes] = useState('');

    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

    const handlePrevDay = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 1);
        setSelectedDate(d);
    };

    const handleNextDay = () => {
        if (isToday) return;
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 1);
        setSelectedDate(d);
    };


    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [history, setHistory] = useState([]); // array of past 7 days logic

    useEffect(() => {
        fetchData();
    }, [selectedDate, fetchData]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const reqDate = format(selectedDate, 'yyyy-MM-dd');

            // Fetch selected day
            const { data } = await getBehavior(reqDate);
            if (data) {
                setMood(data.mood || 'NEUTRAL');
                setSleep(data.sleepHours || 7);
                setExercise(data.exercise || false);
                setNotes(data.notes || '');
            } else {
                setMood('NEUTRAL');
                setSleep(7);
                setExercise(false);
                setNotes('');
            }

            // Fetch last 7 days for history relative to TODAY
            const today = new Date();
            const historyPromises = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(today);
                d.setDate(d.getDate() - (6 - i));
                return getBehavior(format(d, 'yyyy-MM-dd')).catch(() => ({ data: null }));
            });

            const historyResults = await Promise.all(historyPromises);
            const recentHistory = historyResults.map((res, i) => {
                const d = new Date(today);
                d.setDate(d.getDate() - (6 - i));

                // Colors mapping based on mood
                let color = colors.border;
                if (res.data) {
                    if (res.data.mood === 'HAPPY') color = colors.success;
                    else if (res.data.mood === 'SAD') color = colors.error;
                    else color = colors.warning; // NEUTRAL
                }

                return {
                    id: i,
                    day: format(d, 'EEE'),
                    color
                };
            });
            setHistory(recentHistory);

        } catch (err) {
            console.log('No behavior data or fetch failed');
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    const onRefresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async () => {
        try {
            setSaving(true);
            const reqDate = format(selectedDate, 'yyyy-MM-dd');
            await logBehavior({ date: reqDate, mood, sleepHours: sleep, exercise, notes });
            alert('Saved successfully!');
        } catch (err) {
            alert('Failed to save behavior');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Text style={styles.headerTitle}>Daily Log</Text>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.cyan} />}
            >
                <Card style={styles.card}>
                    <View style={styles.dateSelector}>
                        <TouchableOpacity onPress={handlePrevDay} style={styles.dateNavBtn}>
                            <Icon name="chevron-left" size={24} color={colors.text} />
                        </TouchableOpacity>

                        <Text style={styles.dateText}>
                            {format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                                ? `Today, ${format(selectedDate, 'MMM d')}`
                                : format(selectedDate, 'EEE, MMM d')}
                        </Text>

                        <TouchableOpacity
                            onPress={handleNextDay}
                            style={[styles.dateNavBtn, isToday && { opacity: 0.3 }]}
                            disabled={isToday}
                        >
                            <Icon name="chevron-right" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>How are you feeling?</Text>
                    <View style={styles.moodRow}>
                        {MOODS.map(m => (
                            <TouchableOpacity
                                key={m.id}
                                style={[styles.moodBtn, mood === m.id && styles.moodBtnSelected]}
                                onPress={() => setMood(m.id)}
                            >
                                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                                <Text style={[styles.moodLabel, mood === m.id && styles.moodLabelSelected]}>{m.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Sleep ({sleep} hrs)</Text>
                    <View style={styles.sleepRow}>
                        <TouchableOpacity onPress={() => setSleep(Math.max(0, sleep - 0.5))} style={styles.sleepBtn}>
                            <Icon name="minus" size={20} color={colors.text} />
                        </TouchableOpacity>
                        <View style={styles.sleepBar}>
                            <View style={[styles.sleepFill, { width: `${(sleep / 12) * 100}%` }]} />
                        </View>
                        <TouchableOpacity onPress={() => setSleep(Math.min(24, sleep + 0.5))} style={styles.sleepBtn}>
                            <Icon name="plus" size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.exerciseRow}>
                        <Text style={styles.label}>Did you exercise today?</Text>
                        <Switch
                            value={exercise}
                            onValueChange={setExercise}
                            trackColor={{ false: colors.border, true: colors.cyan }}
                            thumbColor={colors.text}
                        />
                    </View>

                    <Input
                        label="Notes"
                        placeholder="Any reflections for today?"
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={4}
                        style={styles.notesInput}
                    />

                    <Button
                        title="Save Log"
                        onPress={handleSave}
                        loading={saving}
                        style={{ marginTop: 16 }}
                    />
                </Card>

                <Text style={styles.historyTitle}>Past 7 Days</Text>
                <Card style={styles.historyCard}>
                    <View style={styles.historyRow}>
                        {history.map(item => (
                            <View key={item.id} style={styles.historyDay}>
                                <View style={[styles.historyDot, { backgroundColor: item.color }]} />
                                <Text style={styles.historyDayText}>{item.day[0]}</Text>
                            </View>
                        ))}
                    </View>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    headerTitle: { color: colors.text, fontSize: typography.fontSizes.xl, fontWeight: 'bold', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    scrollContent: { padding: 16, paddingBottom: 40 },
    card: { padding: 24 },
    dateSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    dateText: { color: colors.cyan, fontSize: typography.fontSizes.lg, fontWeight: 'bold' },
    dateNavBtn: { padding: 8 },
    label: { color: colors.text, fontSize: typography.fontSizes.md, fontWeight: '600', marginBottom: 16 },
    moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
    moodBtn: { flex: 1, alignItems: 'center', padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginHorizontal: 4 },
    moodBtnSelected: { backgroundColor: colors.cyanDim, borderColor: colors.cyan },
    moodEmoji: { fontSize: 32, marginBottom: 8 },
    moodLabel: { color: colors.textDim, fontSize: typography.fontSizes.sm, fontWeight: 'bold' },
    moodLabelSelected: { color: colors.cyan },
    sleepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
    sleepBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
    sleepBar: { flex: 1, height: 8, backgroundColor: colors.border, borderRadius: 4, marginHorizontal: 16, overflow: 'hidden' },
    sleepFill: { height: '100%', backgroundColor: colors.cyan },
    exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    notesInput: { minHeight: 100, textAlignVertical: 'top' },
    historyTitle: { color: colors.textMuted, fontSize: typography.fontSizes.sm, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 32, marginBottom: 12, marginLeft: 4 },
    historyCard: { padding: 16 },
    historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
    historyDay: { alignItems: 'center' },
    historyDot: { width: 16, height: 16, borderRadius: 8, marginBottom: 8 },
    historyDayText: { color: colors.textDim, fontSize: typography.fontSizes.xs, fontWeight: 'bold' }
});
