import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Modal, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { createTask, updateTask } from '../../../api/task.api';
import { createCategory, getCategories } from '../../../api/category.api';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export default function CreateTaskScreen({ navigation, route, visible, onClose, onCreated, hideDueDate, onScheduleRequested }) {
    // Props-based if used as component, route-based if used as screen
    const effectiveOnCreated = onCreated || route?.params?.onCreated;
    const effectiveOnClose = onClose || (() => navigation?.goBack());

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

    const [categories, setCategories] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [categoryId, setCategoryId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        fetchCategories();
        if (route?.params?.task) {
            const t = route.params.task;
            setTitle(t.title || '');
            setDescription(t.description || '');
            setPriority(t.priority || 'MEDIUM');
            setCategoryId(t.categoryId || t.category?.id || t.category?._id || '');
            setDueDate(t.dueDate ? t.dueDate.split('T')[0] : '');
        }
    }, [route?.params?.task]);

    const fetchCategories = async () => {
        try {
            const response = await getCategories();
            setCategories(response.data?.data || response.data || []);
        } catch (e) {
            console.error('Failed to fetch categories:', e);
        }
    };

    const handleSave = async (shouldSchedule = false) => {
        if (!title.trim()) {
            setError('Title is required'); return;
        }
        setLoading(true);
        setError('');
        try {
            const payload = { title, description, priority };
            if (categoryId) payload.categoryId = categoryId;
            if (dueDate && !hideDueDate) payload.dueDate = dueDate;
            if (hideDueDate) payload.dueDate = null;

            let result;
            if (route?.params?.task) {
                result = await updateTask(route.params.task.id, payload);
            } else {
                result = await createTask(payload);
            }

            const newTask = result.data?.data || result.data;

            if (shouldSchedule && onScheduleRequested) {
                onScheduleRequested(newTask);
            } else {
                effectiveOnCreated?.();
            }
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${route?.params?.task ? 'update' : 'create'} task`);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setCategoryId('');
        setDueDate('');
        setError('');
        setIsCreatingCategory(false);
        setNewCategoryName('');
        effectiveOnClose();
    };

    const content = (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={handleClose}
            />
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
                        <Text style={[styles.headerTitle, { color: theme.text, fontWeight: '900', letterSpacing: -0.3 }]}>
                            {route?.params?.task ? 'Update Objective' : 'New Objective'}
                        </Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            activeOpacity={0.75}
                            style={[styles.closeBtn, { backgroundColor: glassBg, borderColor: glassBord }]}
                        >
                            <Icon name="close" size={18} color={isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.45)'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Input
                            label="Objective Title *"
                            placeholder="e.g. System Audit"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Input
                            label="Description"
                            placeholder="Add tactical details..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={2}
                        />

                        {/* Category logic remains same */}
                        <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                        {!isCreatingCategory ? (
                            <View style={{ marginBottom: 16 }}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                    <TouchableOpacity
                                        style={[
                                            styles.categoryChip,
                                            {
                                                backgroundColor: !categoryId ? cyan + (isDark ? '1E' : '14') : glassBg,
                                                borderColor: !categoryId ? cyan + '55' : glassBord
                                            }
                                        ]}
                                        onPress={() => setCategoryId('')}
                                    >
                                        <Text style={[styles.categoryText, { color: !categoryId ? cyan : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.32)') }, !categoryId && { fontWeight: 'bold' }]}>None</Text>
                                    </TouchableOpacity>
                                    {categories.map(c => (
                                        <TouchableOpacity
                                            key={c.id || c._id}
                                            style={[
                                                styles.categoryChip,
                                                {
                                                    backgroundColor: categoryId === (c.id || c._id) ? cyan + (isDark ? '1E' : '14') : glassBg,
                                                    borderColor: categoryId === (c.id || c._id) ? cyan + '55' : glassBord
                                                }
                                            ]}
                                            onPress={() => setCategoryId(c.id || c._id)}
                                        >
                                            <Text style={[styles.categoryText, { color: categoryId === (c.id || c._id) ? cyan : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.32)') }, categoryId === (c.id || c._id) && { fontWeight: 'bold' }]}>{c.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity
                                        style={[styles.categoryAddBtn, { borderColor: theme.border }]}
                                        onPress={() => setIsCreatingCategory(true)}
                                    >
                                        <Icon name="plus" size={18} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} />
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        ) : (
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                                <Input
                                    containerStyle={{ flex: 1, marginBottom: 0 }}
                                    placeholder="Category Name"
                                    value={newCategoryName}
                                    onChangeText={setNewCategoryName}
                                    autoFocus
                                />
                                <Button
                                    title={isCategoryLoading ? "..." : "ADD"}
                                    onPress={async () => {
                                        if (!newCategoryName.trim()) return;
                                        setIsCategoryLoading(true);
                                        try {
                                            const response = await createCategory({
                                                name: newCategoryName,
                                                color: cyan,
                                                icon: "circle"
                                            });
                                            const newCat = response.data?.data || response.data;
                                            setCategoryId(newCat.id || newCat._id);
                                            setIsCreatingCategory(false);
                                            setNewCategoryName('');
                                            fetchCategories();
                                        } catch (e) {
                                            setError("Failed to create category");
                                        } finally {
                                            setIsCategoryLoading(false);
                                        }
                                    }}
                                    disabled={isCategoryLoading}
                                    style={{ paddingHorizontal: 16 }}
                                />
                            </View>
                        )}

                        {!hideDueDate && (
                            <View style={{ marginBottom: 18 }}>
                                <Text style={[styles.label, { color: theme.text }]}>DUE DATE</Text>
                                <TouchableOpacity
                                    onPress={() => setShowDatePicker(true)}
                                    activeOpacity={0.7}
                                    style={[
                                        styles.pickerTrigger,
                                        {
                                            backgroundColor: inputBg,
                                            borderColor: inputBord,
                                        }
                                    ]}
                                >
                                    <Icon name="calendar" size={18} color={dueDate ? cyan : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')} style={{ marginRight: 12 }} />
                                    <Text style={{ color: dueDate ? cyan : (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.25)'), fontWeight: '600' }}>
                                        {dueDate ? format(new Date(dueDate), 'PPP') : 'Optional due date'}
                                    </Text>
                                </TouchableOpacity>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={dueDate ? new Date(dueDate) : new Date()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(false);
                                            if (selectedDate) {
                                                setDueDate(format(selectedDate, 'yyyy-MM-dd'));
                                            }
                                        }}
                                    />
                                )}
                            </View>
                        )}

                        <Text style={[styles.label, { color: theme.text }]}>Priority</Text>
                        <View style={styles.priorityRow}>
                            {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                                <TouchableOpacity
                                    key={p}
                                    style={[
                                        styles.priorityChip,
                                        {
                                            backgroundColor: priority === p ? cyan + (isDark ? '1E' : '14') : glassBg,
                                            borderColor: priority === p ? cyan + '55' : glassBord
                                        }
                                    ]}
                                    onPress={() => setPriority(p)}
                                >
                                    <Text style={[styles.priorityText, { color: priority === p ? cyan : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.32)') }, priority === p && { fontWeight: '900' }]}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {onScheduleRequested ? (
                            <View style={{ flexDirection: 'row', gap: 12, marginTop: 28 }}>
                                <Button
                                    title="Create Task"
                                    onPress={() => handleSave(false)}
                                    loading={loading}
                                    style={{
                                        flex: 1,
                                        backgroundColor: cyan,
                                        height: 54,
                                        borderRadius: 18,
                                        ...Platform.select({
                                            ios: {
                                                shadowColor: cyan,
                                                shadowOffset: { width: 0, height: 8 },
                                                shadowOpacity: 0.45,
                                                shadowRadius: 18,
                                            },
                                            android: { elevation: 10 }
                                        })
                                    }}
                                    textStyle={{ color: '#000', fontWeight: '900', letterSpacing: 0.6 }}
                                />
                                <Button
                                    title="Create & Schedule"
                                    onPress={() => handleSave(true)}
                                    loading={loading}
                                    style={{
                                        flex: 1.6,
                                        backgroundColor: cyan,
                                        height: 54,
                                        borderRadius: 18,
                                        ...Platform.select({
                                            ios: {
                                                shadowColor: cyan,
                                                shadowOffset: { width: 0, height: 8 },
                                                shadowOpacity: 0.45,
                                                shadowRadius: 18,
                                            },
                                            android: { elevation: 10 }
                                        })
                                    }}
                                    textStyle={{ color: '#000', fontWeight: '900', letterSpacing: 0.6 }}
                                />
                            </View>
                        ) : (
                            <Button
                                title={route?.params?.task ? "Update Task" : "Save Task"}
                                onPress={() => handleSave(false)}
                                loading={loading}
                                style={{
                                    marginTop: 28,
                                    backgroundColor: cyan,
                                    height: 54,
                                    borderRadius: 18,
                                    ...Platform.select({
                                        ios: {
                                            shadowColor: cyan,
                                            shadowOffset: { width: 0, height: 8 },
                                            shadowOpacity: 0.45,
                                            shadowRadius: 18,
                                        },
                                        android: { elevation: 10 }
                                    })
                                }}
                                textStyle={{ color: '#000', fontWeight: '900', letterSpacing: 0.6 }}
                            />
                        )}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </View>
    );

    if (visible !== undefined) {
        return (
            <Modal visible={visible} animationType="slide" transparent>
                {content}
            </Modal>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'flex-end' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
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
    label: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 10,
    },
    priorityRow: {
        flexDirection: 'row',
        gap: 12,
    },
    priorityChip: {
        flex: 1,
        paddingVertical: 14,
        borderWidth: 1,
        borderRadius: 16,
        alignItems: 'center',
    },
    priorityText: { fontSize: 10, letterSpacing: 1 },
    errorText: {
        color: '#ef4444',
        marginBottom: 16,
    },
    categoryChip: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderRadius: 14 },
    categoryText: { fontSize: 12, fontWeight: '600' },
    categoryAddBtn: { width: 40, height: 40, borderWidth: 1, borderRadius: 14, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
    pickerTrigger: {
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
});
