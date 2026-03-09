import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { createSchedule } from '../../../api/schedule.api';
import { getTasks } from '../../../api/task.api';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';

// Simple mockup for Time/Date selection inputs for React Native
export default function CreateScheduleScreen({ visible, onClose, onCreated }) {
    const [tasks, setTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [date, setDate] = useState('2026-03-08'); // mockup value
    const [startTime, setStartTime] = useState('09:00:00'); // mockup value
    const [endTime, setEndTime] = useState('10:00:00'); // mockup value
    const [recurrence, setRecurrence] = useState('NONE');
    const [repeatUntil, setRepeatUntil] = useState('');
    const [weeklyDays, setWeeklyDays] = useState([]); // 0-6 array
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { theme } = useTheme();

    useEffect(() => {
        if (visible) {
            fetchTasks();
        }
    }, [visible]);

    const fetchTasks = async () => {
        try {
            const { data } = await getTasks();
            setTasks(data.filter(t => !t.dueDate)); // plan says task with dueDate = null
        } catch (err) {
            console.log(err);
        }
    };

    const handleSave = async () => {
        if (!selectedTaskId || !date || !startTime || !endTime) {
            setError('Please fill all required fields'); return;
        }
        setLoading(true);
        setError('');
        try {
            const data = {
                taskId: selectedTaskId,
                scheduleDate: date,
                startTime,
                endTime,
                recurrence
            };
            if (recurrence === 'WEEKLY') {
                data.repeatOnDays = weeklyDays;
            }
            if (recurrence !== 'NONE' && repeatUntil) {
                data.repeatUntil = repeatUntil;
            }
            await createSchedule(data);
            onCreated();
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create schedule');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedTaskId('');
        setRecurrence('NONE');
        setWeeklyDays([]);
        setRepeatUntil('');
        setError('');
        onClose();
    };

    const toggleDay = (d) => {
        setWeeklyDays(prev =>
            prev.includes(d) ? prev.filter(day => day !== d) : [...prev, d]
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={[styles.sheetContainer, { backgroundColor: theme.surface }]}>
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Schedule Task</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Icon name="x" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView>
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Text style={[styles.label, { color: theme.text }]}>Select Task (Inbox ONLY)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.taskScroll}>
                            {tasks.length > 0 ? tasks.map(t => (
                                <TouchableOpacity
                                    key={t._id}
                                    style={[styles.taskChip, { borderColor: theme.border }, selectedTaskId === t._id && { backgroundColor: theme.cyanDim, borderColor: theme.cyan }]}
                                    onPress={() => setSelectedTaskId(t._id)}
                                >
                                    <Text style={[styles.taskText, { color: theme.textDim }, selectedTaskId === t._id && { color: theme.cyan, fontWeight: 'bold' }]}>
                                        {t.title}
                                    </Text>
                                </TouchableOpacity>
                            )) : (
                                <Text style={[styles.emptyTasksText, { color: theme.textDim }]}>No inbox tasks available.</Text>
                            )}
                        </ScrollView>

                        {/* Simplistic implementations. In a real app, use DateTimePicker */}
                        <Input label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
                        <Input label="Start Time (HH:MM)" value={startTime} onChangeText={setStartTime} />
                        <Input label="End Time (HH:MM)" value={endTime} onChangeText={setEndTime} />

                        <Text style={[styles.label, { color: theme.text }]}>Recurrence</Text>
                        <View style={styles.recurrenceRow}>
                            {['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'].map(r => (
                                <TouchableOpacity
                                    key={r}
                                    style={[styles.recChip, { borderColor: theme.border }, recurrence === r && { backgroundColor: theme.cyanDim, borderColor: theme.cyan }]}
                                    onPress={() => setRecurrence(r)}
                                >
                                    <Text style={[styles.recText, { color: theme.textDim }, recurrence === r && { color: theme.cyan, fontWeight: 'bold' }]}>{r}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {recurrence === 'WEEKLY' && (
                            <View style={{ marginTop: 12 }}>
                                <Text style={[styles.label, { color: theme.text }]}>Repeat on</Text>
                                <View style={styles.daysRow}>
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayChar, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={[styles.dayCircle, { borderColor: theme.border }, weeklyDays.includes(i) && { backgroundColor: theme.cyan, borderColor: theme.cyan }]}
                                            onPress={() => toggleDay(i)}
                                        >
                                            <Text style={[styles.dayText, { color: theme.textDim }, weeklyDays.includes(i) && { color: '#000' }]}>{dayChar}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {recurrence !== 'NONE' && (
                            <Input label="Repeat Until (YYYY-MM-DD)" value={repeatUntil} onChangeText={setRepeatUntil} />
                        )}

                        <Button
                            title="Save Schedule"
                            onPress={handleSave}
                            loading={loading}
                            style={{ marginTop: 24 }}
                        />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    sheetContainer: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24, minHeight: '75%', paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    headerTitle: { fontSize: typography.fontSizes.xl, fontWeight: 'bold' },
    label: { fontSize: typography.fontSizes.sm, marginBottom: 8, fontWeight: '500' },
    taskScroll: { flexDirection: 'row', marginBottom: 16 },
    taskChip: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderRadius: 8, marginRight: 8 },
    taskText: {},
    emptyTasksText: { fontStyle: 'italic', marginBottom: 12 },
    recurrenceRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
    recChip: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 8 },
    recText: {},
    daysRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    dayCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    dayText: { fontWeight: 'bold' },
    errorText: { color: '#ef4444', marginBottom: 16 },
});
