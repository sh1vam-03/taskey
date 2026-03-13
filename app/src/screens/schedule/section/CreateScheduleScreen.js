import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parse } from 'date-fns';
import { createSchedule, updateSchedule } from '../../../api/schedule.api';
import { getTasks } from '../../../api/task.api';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';

// Simple mockup for Time/Date selection inputs for React Native
export default function CreateScheduleScreen({ visible, onClose, onCreated, preselectedTaskId, scheduleToEdit, initialDate }) {
    const [tasks, setTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState(preselectedTaskId || '');
    const [date, setDate] = useState(initialDate || format(new Date(), 'yyyy-MM-dd'));
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [recurrence, setRecurrence] = useState('NONE');
    const [repeatUntil, setRepeatUntil] = useState('');
    const [weeklyDays, setWeeklyDays] = useState([]); // 0-6 array
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pickerMode, setPickerMode] = useState(null); // 'date' | 'start' | 'end' | 'repeatUntil'
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';

    /* glass tokens */
    const sheetBg = isDark ? 'rgba(10,10,14,0.98)' : 'rgba(250,250,255,0.98)';
    const sheetBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
    const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
    const inputBord = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)';

    useEffect(() => {
        if (preselectedTaskId) {
            setSelectedTaskId(preselectedTaskId);
        }
    }, [preselectedTaskId]);

    useEffect(() => {
        if (initialDate && !scheduleToEdit) {
            setDate(initialDate);
        }
    }, [initialDate, scheduleToEdit]);

    useEffect(() => {
        if (scheduleToEdit) {
            setSelectedTaskId(scheduleToEdit.taskId || scheduleToEdit.task?.id || '');
            setDate(scheduleToEdit.scheduleDate ? scheduleToEdit.scheduleDate.split('T')[0] : (initialDate || format(new Date(), 'yyyy-MM-dd')));
            setStartTime(scheduleToEdit.startTime || '09:00');
            setEndTime(scheduleToEdit.endTime || '10:00');
            setRecurrence(scheduleToEdit.recurrence || 'NONE');
            setRepeatUntil(scheduleToEdit.repeatUntil ? scheduleToEdit.repeatUntil.split('T')[0] : '');
            setWeeklyDays(scheduleToEdit.repeatOnDays || []);
        } else {
            // Reset for new creation
            setSelectedTaskId(preselectedTaskId || '');
            setDate(initialDate || format(new Date(), 'yyyy-MM-dd'));
            setStartTime('09:00');
            setEndTime('10:00');
            setRecurrence('NONE');
            setRepeatUntil('');
            setWeeklyDays([]);
        }
    }, [scheduleToEdit, visible, preselectedTaskId, initialDate]);

    useEffect(() => {
        if (visible) {
            fetchTasks();
        }
    }, [visible]);

    const fetchTasks = async () => {
        try {
            const response = await getTasks();
            // Backend returns { tasks: [], meta: {} }
            const tasksList = response.data.tasks || [];
            setTasks(tasksList.filter(t => !t.dueDate)); // plan says task with dueDate = null
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
            if (scheduleToEdit) {
                await updateSchedule(scheduleToEdit.id, data);
            } else {
                await createSchedule(data);
            }
            onCreated();
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${scheduleToEdit ? 'update' : 'create'} schedule`);
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
                    <View style={[
                        styles.sheetContainer,
                        {
                            backgroundColor: sheetBg,
                            borderColor: sheetBord,
                            paddingBottom: insets.bottom + 10,
                        }
                    ]}>
                        <View style={[styles.handle, { backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)' }]} />
                        <View style={styles.header}>
                            <Text style={[styles.headerTitle, { color: theme.text }]}>
                                {scheduleToEdit ? 'Edit Event' : 'Create Event'}
                            </Text>
                            <TouchableOpacity
                                onPress={handleClose}
                                activeOpacity={0.75}
                                style={[styles.closeBtn, { backgroundColor: glassBg, borderColor: glassBord }]}
                            >
                                <Icon name="close" size={18} color={isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.45)'} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                            {error ? <Text style={styles.errorText}>{error}</Text> : null}

                            <Text style={[styles.label, { color: theme.text }]}>Select a Task</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.taskScroll}>
                                {tasks.length > 0 ? tasks.map(t => (
                                    <TouchableOpacity
                                        key={t.id}
                                        style={[
                                            styles.taskChip,
                                            {
                                                backgroundColor: selectedTaskId === t.id ? cyan + (isDark ? '1E' : '14') : glassBg,
                                                borderColor: selectedTaskId === t.id ? cyan + '55' : glassBord
                                            }
                                        ]}
                                        onPress={() => setSelectedTaskId(t.id)}
                                    >
                                        <Text style={[styles.taskText, { color: selectedTaskId === t.id ? cyan : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.32)') }, selectedTaskId === t.id && { fontWeight: 'bold' }]}>
                                            {t.title}
                                        </Text>
                                    </TouchableOpacity>
                                )) : (
                                    <Text style={[styles.emptyTasksText, { color: theme.textDim }]}>No tasks available to schedule.</Text>
                                )}
                            </ScrollView>

                            {/* Native Pickers triggers */}
                            <View style={{ gap: 12, marginBottom: 20 }}>
                                <View>
                                    <Text style={[styles.label, { color: theme.text }]}>DATE</Text>
                                    <TouchableOpacity
                                        onPress={() => setPickerMode('date')}
                                        activeOpacity={0.7}
                                        style={[styles.pickerTrigger, { backgroundColor: inputBg, borderColor: inputBord }]}
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
                                            style={[styles.pickerTrigger, { backgroundColor: inputBg, borderColor: inputBord }]}
                                        >
                                            <Icon name="clock-outline" size={18} color={cyan} style={{ marginRight: 12 }} />
                                            <Text style={{ color: theme.text, fontWeight: '600' }}>
                                                {format(parse(startTime, 'HH:mm', new Date()), 'hh:mm a')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.label, { color: theme.text }]}>END TIME</Text>
                                        <TouchableOpacity
                                            onPress={() => setPickerMode('end')}
                                            activeOpacity={0.7}
                                            style={[styles.pickerTrigger, { backgroundColor: inputBg, borderColor: inputBord }]}
                                        >
                                            <Icon name="clock-outline" size={18} color={cyan} style={{ marginRight: 12 }} />
                                            <Text style={{ color: theme.text, fontWeight: '600' }}>
                                                {format(parse(endTime, 'HH:mm', new Date()), 'hh:mm a')}
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
                                                pickerMode === 'start' ? parse(startTime, 'HH:mm', new Date()) :
                                                    parse(endTime, 'HH:mm', new Date())
                                    }
                                    mode={(pickerMode === 'date' || pickerMode === 'repeatUntil') ? 'date' : 'time'}
                                    is24Hour={false}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        setPickerMode(null);
                                        if (selectedDate) {
                                            if (pickerMode === 'date') setDate(format(selectedDate, 'yyyy-MM-dd'));
                                            else if (pickerMode === 'repeatUntil') setRepeatUntil(format(selectedDate, 'yyyy-MM-dd'));
                                            else if (pickerMode === 'start') setStartTime(format(selectedDate, 'HH:mm'));
                                            else setEndTime(format(selectedDate, 'HH:mm'));
                                        }
                                    }}
                                />
                            )}

                            <Text style={[styles.label, { color: theme.text }]}>Recurrence</Text>
                            <View style={styles.recurrenceRow}>
                                {['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'].map(r => (
                                    <TouchableOpacity
                                        key={r}
                                        style={[
                                            styles.recChip,
                                            {
                                                backgroundColor: recurrence === r ? cyan + (isDark ? '1E' : '14') : glassBg,
                                                borderColor: recurrence === r ? cyan + '55' : glassBord
                                            }
                                        ]}
                                        onPress={() => setRecurrence(r)}
                                    >
                                        <Text style={[styles.recText, { color: recurrence === r ? cyan : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.32)') }, recurrence === r && { fontWeight: '900' }]}>{r}</Text>
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
                                                style={[
                                                    styles.dayCircle,
                                                    {
                                                        backgroundColor: weeklyDays.includes(i) ? cyan : glassBg,
                                                        borderColor: weeklyDays.includes(i) ? cyan : glassBord
                                                    }
                                                ]}
                                                onPress={() => toggleDay(i)}
                                            >
                                                <Text style={[styles.dayText, { color: weeklyDays.includes(i) ? '#000' : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.32)') }]}>{dayChar}</Text>
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
                                        style={[styles.pickerTrigger, { backgroundColor: inputBg, borderColor: inputBord }]}
                                    >
                                        <Icon name="calendar-range" size={18} color={repeatUntil ? cyan : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)')} style={{ marginRight: 12 }} />
                                        <Text style={{ color: repeatUntil ? theme.text : (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.25)'), fontWeight: '600' }}>
                                            {repeatUntil ? format(new Date(repeatUntil), 'PPP') : 'Optional end date'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <Button
                                title={scheduleToEdit ? "Update Event" : "Save Event"}
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
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    sheetContainer: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        paddingHorizontal: 22,
        paddingTop: 8,
        maxHeight: '92%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.3,
    },
    handle: {
        width: 36, height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 10, marginBottom: 22,
    },
    closeBtn: {
        width: 34, height: 34,
        borderRadius: 11,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: { fontSize: 9, marginBottom: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
    pickerTrigger: {
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    taskScroll: { flexDirection: 'row', marginBottom: 16 },
    taskChip: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderRadius: 14, marginRight: 8 },
    taskText: {},
    emptyTasksText: { fontStyle: 'italic', marginBottom: 12 },
    recurrenceRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
    recChip: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderRadius: 12 },
    recText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    daysRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    dayCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    dayText: { fontWeight: 'bold' },
    errorText: { color: '#ef4444', marginBottom: 16 },
});
