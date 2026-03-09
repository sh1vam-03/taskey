import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parse } from 'date-fns';
import { createSchedule } from '../../../api/schedule.api';
import { getTasks } from '../../../api/task.api';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';

// Simple mockup for Time/Date selection inputs for React Native
export default function CreateScheduleScreen({ visible, onClose, onCreated, preselectedTaskId }) {
    const [tasks, setTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState(preselectedTaskId || '');
    const [date, setDate] = useState('2026-03-09'); // mockup value
    const [startTime, setStartTime] = useState('09:00:00'); // mockup value
    const [endTime, setEndTime] = useState('10:00:00'); // mockup value
    const [recurrence, setRecurrence] = useState('NONE');
    const [repeatUntil, setRepeatUntil] = useState('');
    const [weeklyDays, setWeeklyDays] = useState([]); // 0-6 array
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pickerMode, setPickerMode] = useState(null); // 'date' | 'start' | 'end' | 'repeatUntil'
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';

    useEffect(() => {
        if (preselectedTaskId) {
            setSelectedTaskId(preselectedTaskId);
        }
    }, [preselectedTaskId]);

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
                <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ width: '100%', justifyContent: 'flex-end' }}
                >
                    <View style={[styles.sheetContainer, { backgroundColor: theme.surface }]}>
                        <View style={styles.header}>
                            <Text style={[styles.headerTitle, { color: theme.text }]}>Schedule Task</Text>
                            <TouchableOpacity onPress={handleClose}>
                                <Icon name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
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

                            {/* Native Pickers triggers */}
                            <View style={{ gap: 12, marginBottom: 20 }}>
                                <View>
                                    <Text style={[styles.label, { color: theme.text }]}>DATE</Text>
                                    <TouchableOpacity
                                        onPress={() => setPickerMode('date')}
                                        activeOpacity={0.7}
                                        style={[styles.pickerTrigger, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                                    >
                                        <Icon name="calendar" size={18} color={cyan} style={{ marginRight: 12 }} />
                                        <Text style={{ color: theme.text, fontWeight: '600' }}>
                                            {format(new Date(date), 'PPP')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.label, { color: theme.text }]}>START TIME</Text>
                                        <TouchableOpacity
                                            onPress={() => setPickerMode('start')}
                                            activeOpacity={0.7}
                                            style={[styles.pickerTrigger, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                                        >
                                            <Icon name="clock-outline" size={18} color={cyan} style={{ marginRight: 12 }} />
                                            <Text style={{ color: theme.text, fontWeight: '600' }}>
                                                {format(parse(startTime, 'HH:mm:ss', new Date()), 'hh:mm a')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.label, { color: theme.text }]}>END TIME</Text>
                                        <TouchableOpacity
                                            onPress={() => setPickerMode('end')}
                                            activeOpacity={0.7}
                                            style={[styles.pickerTrigger, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                                        >
                                            <Icon name="clock-outline" size={18} color={cyan} style={{ marginRight: 12 }} />
                                            <Text style={{ color: theme.text, fontWeight: '600' }}>
                                                {format(parse(endTime, 'HH:mm:ss', new Date()), 'hh:mm a')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {pickerMode && (
                                <DateTimePicker
                                    value={
                                        pickerMode === 'date' ? new Date(date) :
                                            pickerMode === 'repeatUntil' ? (repeatUntil ? new Date(repeatUntil) : new Date()) :
                                                pickerMode === 'start' ? parse(startTime, 'HH:mm:ss', new Date()) :
                                                    parse(endTime, 'HH:mm:ss', new Date())
                                    }
                                    mode={(pickerMode === 'date' || pickerMode === 'repeatUntil') ? 'date' : 'time'}
                                    is24Hour={false}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        setPickerMode(null);
                                        if (selectedDate) {
                                            if (pickerMode === 'date') setDate(format(selectedDate, 'yyyy-MM-dd'));
                                            else if (pickerMode === 'repeatUntil') setRepeatUntil(format(selectedDate, 'yyyy-MM-dd'));
                                            else if (pickerMode === 'start') setStartTime(format(selectedDate, 'HH:mm:ss'));
                                            else setEndTime(format(selectedDate, 'HH:mm:ss'));
                                        }
                                    }}
                                />
                            )}

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
                                <View style={{ marginTop: 12, marginBottom: 18 }}>
                                    <Text style={[styles.label, { color: theme.text }]}>REPEAT UNTIL</Text>
                                    <TouchableOpacity
                                        onPress={() => setPickerMode('repeatUntil')}
                                        activeOpacity={0.7}
                                        style={[styles.pickerTrigger, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                                    >
                                        <Icon name="calendar-range" size={18} color={repeatUntil ? cyan : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)')} style={{ marginRight: 12 }} />
                                        <Text style={{ color: repeatUntil ? theme.text : (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.25)'), fontWeight: '600' }}>
                                            {repeatUntil ? format(new Date(repeatUntil), 'PPP') : 'Optional end date'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <Button
                                title="Save Schedule"
                                onPress={handleSave}
                                loading={loading}
                                style={{
                                    marginTop: 28,
                                    backgroundColor: theme.cyan ?? '#00d4ff',
                                    height: 54,
                                    borderRadius: 18,
                                    ...Platform.select({
                                        ios: {
                                            shadowColor: theme.cyan ?? '#00d4ff',
                                            shadowOffset: { width: 0, height: 8 },
                                            shadowOpacity: 0.45,
                                            shadowRadius: 18,
                                        },
                                        android: { elevation: 10 }
                                    })
                                }}
                                textStyle={{ color: '#000', fontWeight: '900', letterSpacing: 0.6 }}
                            />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    sheetContainer: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24, paddingBottom: 20, maxHeight: '90%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    headerTitle: { fontSize: typography.fontSizes.xl, fontWeight: 'bold' },
    label: { fontSize: typography.fontSizes.sm, marginBottom: 8, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
    pickerTrigger: {
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
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
