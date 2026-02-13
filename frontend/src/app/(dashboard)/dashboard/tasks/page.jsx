"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import taskService from '@/services/task.service';
import usageService from '@/services/usage.service';
import categoryService from '@/services/category.service';
// Categories are now fetched from the API
import {
    Plus,
    Filter,
    MoreVertical,
    Trash2,
    Edit2,
    CheckCircle2,
    Circle,
    ListTodo,
    Search,
    X
} from 'lucide-react';
import TaskModal from './TaskModal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';

export default function TasksPage() {
    const { success, error } = useToast();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [usage, setUsage] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, taskId: null });

    // New State for Filters & Search
    const [searchQuery, setSearchQuery] = useState("");
    const [filterPriority, setFilterPriority] = useState('ALL');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [showCompleted, setShowCompleted] = useState(false);
    const [categories, setCategories] = useState([]);

    // Pagination State
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);
    const [isMoreLoading, setIsMoreLoading] = useState(false);

    const fetchTasks = useCallback(async (reset = false) => {
        if (reset) {
            setLoading(true);
            setPage(1);
        } else {
            setIsMoreLoading(true);
        }

        try {

            const currentPage = reset ? 1 : page;
            const [taskResponse, usageData, categoriesData] = await Promise.all([
                taskService.getTasks({ page: currentPage, limit: 10 }), // Pass pagination
                reset ? usageService.getMyUsage() : Promise.resolve(null),
                reset ? categoryService.getCategories() : Promise.resolve(null)
            ]);

            const processTasks = (tasksRaw) => {
                return tasksRaw.map(t => ({
                    ...t,
                    isCompleted: t.dailyCompletions && t.dailyCompletions.length > 0
                }));
            };

            if (reset) {
                setTasks(processTasks(taskResponse.tasks));
                if (usageData) setUsage(usageData);
                if (categoriesData) setCategories(categoriesData);
            } else {
                setTasks(prev => [...prev, ...processTasks(taskResponse.tasks)]);
            }

            setMeta(taskResponse.meta);

            // No longer enforcing inference, relying on API
            // if (reset && taskResponse.tasks) { ... }

        } catch (err) {
            console.error("Failed to fetch tasks", err);
            error("Failed to load tasks");
        } finally {
            setLoading(false);
            setIsMoreLoading(false);
        }
    }, [page, error]);

    useEffect(() => {
        fetchTasks(true); // Initial load
    }, []); // Run once on mount

    // Load More Handler
    const handleLoadMore = () => {
        setPage(prev => prev + 1);
        // Effect will trigger fetch due to page dependency? 
        // No, fetchTasks depends on page, but we need to trigger it.
        // Actually, better to just call fetchTasks with new page logic or specific logic.
        // Let's rely on a separate effect or call explicitly.
        // Simpler: Just update page, and have an effect watch page?
        // Or cleaner: handleLoadMore calls fetchTasks specifically.
    };

    // Trigger fetch on page change (skip first render handled by mount effect)
    useEffect(() => {
        if (page > 1) {
            fetchTasks(false);
        }
    }, [page]); // Dependencies cleaned up

    const handleCreate = () => {
        setTaskToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (task) => {
        setTaskToEdit(task);
        setIsModalOpen(true);
    };

    const confirmDelete = (task) => {
        setDeleteModal({ isOpen: true, taskId: task.id });
    };

    const handleDelete = async () => {
        try {
            await taskService.deleteTask(deleteModal.taskId);
            setDeleteModal({ isOpen: false, taskId: null });
            // Refresh list (reset to page 1 to ensure consistency)
            fetchTasks(true);
            success("Objective deleted successfully");
        } catch (err) {
            console.error("Delete failed", err);
            error("Failed to delete objective");
        }
    };

    const handleToggleComplete = async (task) => {
        const today = new Date().toISOString().split('T')[0];

        // Optimistic Update
        const previousTasks = [...tasks];
        const updatedTasks = tasks.map(t =>
            t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
        );
        setTasks(updatedTasks);

        try {
            if (task.isCompleted) {
                await taskService.undoCompleteTask(task.id, today);
            } else {
                await taskService.completeTask(task.id, today);
            }
            // Background refresh to ensure sync
            // fetchTasks(); 
            // Actually, usually redundant if optimistic worked, but good for consistency. 
            // To avoid flickering, maybe skip full refetch if successful?
        } catch (err) {
            console.error("Completion toggle error", err);
            setTasks(previousTasks); // Revert
            error("Failed to update status");
        }
    };

    const canCreate = !usage || usage.taskCount < (usage.limits?.task || Infinity);

    // Filtering Logic
    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;
            const matchesCategory = selectedCategory === 'ALL' || (t.category && t.category.id === selectedCategory);
            const matchesCompletion = showCompleted ? true : !t.isCompleted;

            return matchesSearch && matchesPriority && matchesCategory && matchesCompletion;
        });
    }, [tasks, searchQuery, filterPriority, selectedCategory, showCompleted]);

    const completedCount = tasks.filter(t => t.isCompleted).length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
                        <ListTodo className="h-8 w-8 text-cyan-500" />
                        Task Command
                    </h1>
                    <p className="text-gray-400 font-mono text-sm max-w-xl">
                        Prioritize and execute operational objectives.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full md:w-64 bg-black/50 border-white/10 focus:border-cyan-500/50"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>

                    <Button
                        onClick={handleCreate}
                        disabled={!canCreate}
                        variant="scanline"
                        className="shrink-0"
                    >
                        <Plus className="h-4 w-4" /> Initialize Task
                    </Button>
                </div>
            </div>

            <Card className="min-h-[600px] border-white/10 bg-black/50">
                {/* Filters */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        <Filter className="h-4 w-4 text-gray-500 mr-2 shrink-0" />
                        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilterPriority(f)}
                                className={`
                                    px-3 py-1 text-xs font-mono tracking-wider transition-all border rounded
                                    ${filterPriority === f
                                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                                        : 'bg-white/5 text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/10'
                                    }
                                `}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-white/10 hidden md:block"></div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        <span className="text-xs text-gray-500 uppercase font-mono">Cat:</span>
                        <button
                            onClick={() => setSelectedCategory('ALL')}
                            className={`px-3 py-1 text-xs font-mono transition-all border rounded ${selectedCategory === 'ALL' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50' : 'bg-white/5 text-gray-500 border-transparent'}`}
                        >
                            ALL
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-3 py-1 text-xs font-mono transition-all border rounded ${selectedCategory === cat.id ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50' : 'bg-white/5 text-gray-500 border-transparent'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-white transition-colors">
                            <input
                                type="checkbox"
                                checked={showCompleted}
                                onChange={(e) => setShowCompleted(e.target.checked)}
                                className="rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0"
                            />
                            Show Completed ({completedCount})
                        </label>
                        <div className="text-xs font-mono text-gray-600 hidden md:block">
                            Total: {tasks.length}
                        </div>
                    </div>
                </div>

                {/* Task List */}
                <div className="space-y-1 mt-6">
                    {loading ? (
                        <SkeletonLoader type="list" />
                    ) : filteredTasks.length > 0 ? (
                        filteredTasks.map(task => (
                            <div
                                key={task.id}
                                className="group flex items-center justify-between p-4 rounded-lg border border-transparent hover:bg-white/5 hover:border-white/10 transition-all duration-200"
                            >
                                <div className="flex items-start gap-4">
                                    <button
                                        onClick={() => handleToggleComplete(task)}
                                        className={`mt-1 transition-colors ${task.isCompleted ? 'text-green-500' : 'text-gray-600 hover:text-cyan-500'}`}
                                    >
                                        {task.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                    </button>

                                    <div>
                                        <h3 className={`font-medium text-white group-hover:text-cyan-400 transition-colors ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                                            {task.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <Badge variant={
                                                task.priority === 'HIGH' ? 'danger' :
                                                    task.priority === 'MEDIUM' ? 'warning' : 'info'
                                            }>
                                                {task.priority}
                                            </Badge>

                                            {task.category && (
                                                <span className="text-[10px] uppercase font-mono text-gray-500 border border-white/10 px-1.5 py-0.5 rounded">
                                                    {task.category.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                                    <button
                                        onClick={() => handleEdit(task)}
                                        className="p-2 hover:bg-white/10 rounded-md text-gray-500 hover:text-cyan-400 transition-colors"
                                        title="Edit Task"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(task)}
                                        className="p-2 hover:bg-red-500/10 rounded-md text-gray-500 hover:text-red-400 transition-colors"
                                        title="Delete Task"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-xl">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <ListTodo className="h-8 w-8 text-gray-700" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1">No Objectives Found</h3>
                            <p className="text-gray-500 text-sm max-w-sm mb-6">
                                {searchQuery ? "No matches found for your search." : "The queue is currently empty. Initialize a new task to begin tracking."}
                            </p>
                            <Button onClick={handleCreate} variant="secondary" size="sm">
                                Create Task
                            </Button>
                        </div>
                    )}
                </div>


                {/* Pagination / Load More */}
                {
                    meta && meta.page < meta.totalPages && (
                        <div className="p-4 border-t border-white/5 flex justify-center">
                            <Button
                                variant="ghost"
                                onClick={handleLoadMore}
                                disabled={isMoreLoading}
                                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30"
                            >
                                {isMoreLoading ? "Loading Coordinates..." : "Load Extended Objectives"}
                            </Button>
                        </div>
                    )
                }
            </Card >

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                taskToEdit={taskToEdit}
                onTaskSaved={() => {
                    fetchTasks(true); // Reset to page 1 to see new/updated task
                    success(taskToEdit ? "Objective updated" : "Objective initialized");
                }}
                categories={categories} // Pass fetched categories
                onCategoryCreated={() => fetchTasks(true)} // Refresh categories if created
            />

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, taskId: null })}
                onConfirm={handleDelete}
                title="Delete Objective"
                message="Are you sure you want to delete this task? This action cannot be undone."
                confirmText="Delete Task"
                variant="danger"
            />
        </div >
    );
}

