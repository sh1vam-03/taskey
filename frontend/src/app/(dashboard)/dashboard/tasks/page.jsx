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
    Calendar,
    X
} from 'lucide-react';
import UniversalTaskCard from '@/components/dashboard/UniversalTaskCard';
import TaskModal from '@/components/dashboard/TaskModal';

// ...

// Inside return > list:

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
    const [filterDueDate, setFilterDueDate] = useState(new Date().toLocaleDateString('en-CA')); // Default to Today
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
            const localDate = new Date().toLocaleDateString('en-CA');

            // Prepare filters
            const filters = {
                page: currentPage,
                limit: 10,
                date: localDate,
                search: searchQuery,
                priority: filterPriority,
                categoryId: selectedCategory,
                excludeCompleted: !showCompleted ? 'true' : 'false', // Explicit string for backend
                dueDate: filterDueDate || undefined // Pass dueDate if exists
            };

            const [taskResponse, usageData, categoriesData] = await Promise.all([
                taskService.getTasks(filters),
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

        } catch (err) {
            console.error("Failed to fetch tasks", err);
            error("Failed to load tasks");
        } finally {
            setLoading(false);
            setIsMoreLoading(false);
        }
    }, [page, searchQuery, filterPriority, selectedCategory, showCompleted, filterDueDate, error]);

    // Initial Load
    useEffect(() => {
        fetchTasks(true);
    }, []);

    // Search Effect (Debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchTasks(true);
        }, 500); // 500ms debounce
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Filter Effect (Immediate)
    useEffect(() => {
        fetchTasks(true);
    }, [filterPriority, selectedCategory, showCompleted, filterDueDate]);

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
        const today = new Date().toLocaleDateString('en-CA');

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
    // const completedCount = tasks.filter(t => t.isCompleted).length; // Removed confusing count

    // Use tasks directly instead of filteredTasks
    const displayTasks = tasks;

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
                {/* Filters */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">

                    {/* Left: Filters Group */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Filter className="h-4 w-4" />
                            <span className="text-xs font-mono uppercase tracking-wider">Filters:</span>
                        </div>

                        {/* Date Filter */}
                        <div className="relative group">
                            <input
                                type="date"
                                value={filterDueDate}
                                onChange={(e) => setFilterDueDate(e.target.value)}
                                className="pl-8 pr-3 py-1.5 text-xs font-mono bg-black/40 border border-white/10 rounded flex items-center gap-2 text-gray-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all hover:bg-white/5 w-36"
                            />
                            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cyan-500 pointer-events-none" />
                            {filterDueDate && (
                                <button
                                    onClick={() => setFilterDueDate('')}
                                    className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                    title="Clear Date"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>

                        {/* Priority Dropdown */}
                        <div className="relative">
                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-1.5 text-xs font-mono bg-black/40 border border-white/10 rounded text-gray-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all hover:bg-white/5 cursor-pointer uppercase"
                            >
                                <option value="ALL">All Priorities</option>
                                <option value="HIGH">High Priority</option>
                                <option value="MEDIUM">Medium Priority</option>
                                <option value="LOW">Low Priority</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <Filter className="h-3 w-3" />
                            </div>
                        </div>

                        {/* Category Dropdown */}
                        <div className="relative">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-1.5 text-xs font-mono bg-black/40 border border-white/10 rounded text-gray-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all hover:bg-white/5 cursor-pointer"
                            >
                                <option value="ALL">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <ListTodo className="h-3 w-3" />
                            </div>
                        </div>
                    </div>

                    {/* Right: Toggle & Count */}
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-white transition-colors">
                            <input
                                type="checkbox"
                                checked={showCompleted}
                                onChange={(e) => setShowCompleted(e.target.checked)}
                                className="rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0"
                            />
                            Show Completed
                        </label>

                        <div className="h-4 w-px bg-white/10 hidden md:block"></div>

                        <div className="text-xs font-mono text-gray-500">
                            Total: <span className="text-white">{tasks.length}</span>
                        </div>
                    </div>
                </div>

                {/* Task List */}
                <div className="space-y-1 mt-6">
                    {loading ? (
                        <SkeletonLoader type="list" />
                    ) : displayTasks.length > 0 ? (
                        displayTasks.map(task => (
                            <UniversalTaskCard
                                key={task.id}
                                item={task}
                                type="TASK"
                                onComplete={() => handleToggleComplete(task)}
                                onEdit={() => handleEdit(task)}
                                onDelete={() => confirmDelete(task)}
                            />
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
                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                    <div className="p-4 border-t border-white/5 flex items-center justify-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isMoreLoading}
                            className="text-gray-400 hover:text-white"
                        >
                            &lt;
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === meta.totalPages || Math.abs(page - p) <= 1) // Show first, last, and neighbors
                                .reduce((acc, p, i, arr) => {
                                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, idx) => (
                                    p === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-600">...</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`
                                                w-8 h-8 rounded text-xs font-mono transition-colors
                                                ${page === p
                                                    ? 'bg-cyan-500 text-black font-bold'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                                }
                                            `}
                                        >
                                            {p}
                                        </button>
                                    )
                                ))
                            }
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                            disabled={page === meta.totalPages || isMoreLoading}
                            className="text-gray-400 hover:text-white"
                        >
                            &gt;
                        </Button>
                    </div>
                )}
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

