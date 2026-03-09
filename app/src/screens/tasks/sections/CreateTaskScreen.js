import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createTask, updateTask } from '../../../api/task.api';
import { createCategory, getCategories } from '../../../api/category.api';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';
import Icon from 'react-native-vector-icons/Feather';

export default function CreateTaskScreen({ navigation, route }) {
    const { onCreated, onCategoryCreated } = route.params || {};
    const { theme } = useTheme();

    const [categories, setCategories] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM'); // LOW, MEDIUM, HIGH
    const [categoryId, setCategoryId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
        if (route.params?.task) {
            const t = route.params.task;
            setTitle(t.title || '');
            setDescription(t.description || '');
            setPriority(t.priority || 'MEDIUM');
            setCategoryId(t.categoryId || t.category?.id || t.category?._id || '');
            setDueDate(t.dueDate ? t.dueDate.split('T')[0] : '');
        }
    }, [route.params?.task]);

    const fetchCategories = async () => {
        try {
            const response = await getCategories();
            setCategories(response.data?.data || response.data || []);
        } catch (e) {
            console.error('Failed to fetch categories:', e);
        }
    };

    const handleSave = async () => {
        if (!title) {
            setError('Title is required'); return;
        }
        setLoading(true);
        setError('');
        try {
            const payload = { title, description, priority };
            if (categoryId) payload.categoryId = categoryId;
            if (dueDate) payload.dueDate = dueDate;

            if (route.params?.task) {
                await updateTask(route.params.task.id, payload);
            } else {
                await createTask(payload);
            }
            onCreated?.();
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${route.params?.task ? 'update' : 'create'} task`);
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
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={handleClose}
            />
            <View style={[styles.sheetContainer, { backgroundColor: theme.surface }]}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>
                        {route.params?.task ? 'Update Objective' : 'New Objective'}
                    </Text>
                    <TouchableOpacity onPress={handleClose}>
                        <Icon name="x" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Input
                        label="Task Title *"
                        placeholder="e.g. Redesign landing page"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Input
                        label="Description"
                        placeholder="Add details..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        style={{ minHeight: 80, textAlignVertical: 'top', color: theme.text }}
                        placeholderTextColor={theme.textDim}
                    />

                    <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                    {!isCreatingCategory ? (
                        <View style={{ marginBottom: 16 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                <TouchableOpacity
                                    style={[styles.categoryChip, { borderColor: theme.border }, !categoryId && { backgroundColor: theme.cyanDim, borderColor: theme.cyan }]}
                                    onPress={() => setCategoryId('')}
                                >
                                    <Text style={[styles.categoryText, { color: theme.textDim }, !categoryId && { color: theme.cyan, fontWeight: 'bold' }]}>None</Text>
                                </TouchableOpacity>
                                {categories.map(c => (
                                    <TouchableOpacity
                                        key={c.id || c._id}
                                        style={[styles.categoryChip, { borderColor: theme.border }, categoryId === (c.id || c._id) && { backgroundColor: theme.cyanDim, borderColor: theme.cyan }]}
                                        onPress={() => setCategoryId(c.id || c._id)}
                                    >
                                        <Text style={[styles.categoryText, { color: theme.textDim }, categoryId === (c.id || c._id) && { color: theme.cyan, fontWeight: 'bold' }]}>{c.name}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={[styles.categoryAddBtn, { borderColor: theme.border }]}
                                    onPress={() => setIsCreatingCategory(true)}
                                >
                                    <Icon name="plus" size={16} color={theme.text} />
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    ) : (
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                            <Input
                                containerStyle={{ flex: 1, marginBottom: 0 }}
                                placeholder="New Category Name..."
                                value={newCategoryName}
                                onChangeText={setNewCategoryName}
                                autoFocus
                            />
                            <Button
                                title={isCategoryLoading ? "..." : "Add"}
                                onPress={async () => {
                                    if (!newCategoryName.trim()) return;
                                    setIsCategoryLoading(true);
                                    try {
                                        const response = await createCategory({
                                            name: newCategoryName,
                                            color: "#06b6d4",
                                            icon: "circle"
                                        });
                                        if (onCategoryCreated) await onCategoryCreated?.();
                                        const newCat = response.data?.data || response.data;
                                        setCategoryId(newCat.id || newCat._id);
                                        setIsCreatingCategory(false);
                                        setNewCategoryName('');
                                    } catch (e) {
                                        setError(e.response?.data?.message || "Failed to create category");
                                    } finally {
                                        setIsCategoryLoading(false);
                                    }
                                }}
                                disabled={isCategoryLoading}
                                style={{ paddingHorizontal: 16 }}
                            />
                            <Button
                                title="X"
                                onPress={() => setIsCreatingCategory(false)}
                                style={{ backgroundColor: 'transparent', paddingHorizontal: 12 }}
                                textStyle={{ color: theme.textDim }}
                            />
                        </View>
                    )}

                    <Input
                        label="Due Date (YYYY-MM-DD)"
                        placeholder="Optional due date"
                        value={dueDate}
                        onChangeText={setDueDate}
                    />

                    <Text style={[styles.label, { color: theme.text }]}>Priority</Text>
                    <View style={styles.priorityRow}>
                        {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                            <TouchableOpacity
                                key={p}
                                style={[styles.priorityChip, { borderColor: theme.border }, priority === p && { backgroundColor: theme.cyanDim, borderColor: theme.cyan }]}
                                onPress={() => setPriority(p)}
                            >
                                <Text style={[styles.priorityText, { color: theme.textDim }, priority === p && { color: theme.cyan, fontWeight: 'bold' }]}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Button
                        title="Save Task"
                        onPress={handleSave}
                        loading={loading}
                        style={{ marginTop: 24 }}
                    />
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'flex-end' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheetContainer: { borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingVertical: 24, minHeight: '75%', paddingBottom: 40 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: typography.fontSizes.xl,
        fontWeight: 'bold',
    },
    label: {
        fontSize: typography.fontSizes.sm,
        marginBottom: 8,
        fontWeight: '500',
    },
    priorityRow: {
        flexDirection: 'row',
        gap: 12,
    },
    priorityChip: {
        flex: 1,
        paddingVertical: 12,
        borderWidth: 1,
        borderRadius: 8,
        alignItems: 'center',
    },
    priorityText: {},
    errorText: {
        color: '#ef4444',
        marginBottom: 16,
        paddingHorizontal: 24,
    },
    categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderRadius: 16 },
    categoryText: {},
    categoryAddBtn: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderRadius: 16, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
});
