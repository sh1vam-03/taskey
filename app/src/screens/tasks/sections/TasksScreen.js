import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { getTasks, completeTask, deleteTask } from '../../../api/task.api';
import { getCategories } from '../../../api/category.api';
import TaskCard from '../components/TaskCard';
import Input from '../../../components/common/Input';
import EmptyState from '../../../components/common/EmptyState';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';
import CreateTaskScreen from './CreateTaskScreen';

const PRIORITIES = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];

export default function TasksScreen() {
    const [tasks, setTasks] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [refreshing, setRefreshing] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { theme } = useTheme();

    const [categories, setCategories] = useState([]);

    const fetchTasks = async () => {
        try {
            const { data } = await getTasks();
            setTasks(data);
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await getCategories();
            setCategories(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchCategories();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTasks();
        fetchCategories();
    }, []);

    const handleToggleComplete = async (task) => {
        try {
            await completeTask(task._id);
            fetchTasks(); // refresh lists
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (task) => {
        try {
            await deleteTask(task._id);
            fetchTasks();
        } catch (e) {
            console.error(e);
        }
    };

    const filteredTasks = tasks.filter(t => {
        if (filter !== 'ALL' && t.priority !== filter) return false;
        if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
            <View style={styles.localHeader}>
                <Text style={[styles.localHeaderTitle, { color: theme.text }]}>TASKS</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.cyan }]}
                    onPress={() => setIsCreateModalOpen(true)}
                >
                    <Icon name="plus" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={[styles.content, { borderBottomColor: theme.border }]}>
                <Input
                    placeholder="Search tasks..."
                    value={search}
                    onChangeText={setSearch}
                    leftIcon={<Icon name="search" size={20} color={theme.textDim} />}
                    containerStyle={styles.searchInput}
                />

                <View style={styles.filterRow}>
                    {PRIORITIES.map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[
                                styles.filterChip,
                                { backgroundColor: theme.surface, borderColor: theme.border },
                                filter === p && { backgroundColor: theme.cyanDim, borderColor: theme.cyan }
                            ]}
                            onPress={() => setFilter(p)}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: theme.textMuted },
                                filter === p && { color: theme.cyan }
                            ]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <FlatList
                data={filteredTasks}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.cyan} />}
                renderItem={({ item }) => (
                    <TaskCard
                        task={item}
                        onToggleComplete={() => handleToggleComplete(item)}
                        onDelete={() => handleDelete(item)}
                    />
                )}
                ListEmptyComponent={
                    <EmptyState
                        title="No tasks found"
                        description={search || filter !== 'ALL' ? "Try adjusting your filters" : "You have no tasks yet."}
                        icon={<Icon name="inbox" size={48} color={theme.textDim} />}
                    />
                }
            />

            <CreateTaskScreen
                visible={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={fetchTasks}
                categories={categories}
                onCategoryCreated={fetchCategories}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    localHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 70,
    },
    localHeaderTitle: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 4,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: { padding: 16, borderBottomWidth: 1 },
    searchInput: { marginBottom: 12 },
    filterRow: { flexDirection: 'row', gap: 8 },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
    },
    filterText: { fontSize: typography.fontSizes.sm, fontWeight: '500' },
    listContent: { padding: 16, paddingBottom: 100 },
});
