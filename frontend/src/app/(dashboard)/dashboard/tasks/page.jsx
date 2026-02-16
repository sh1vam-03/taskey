"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import taskService from '@/services/task.service';
import usageService from '@/services/usage.service';
import categoryService from '@/services/category.service';
import {
    Plus,
    Filter,
    ListTodo,
    Search,
    X,
    CalendarClock,
    Inbox
} from 'lucide-react';
import UniversalTaskCard from '@/components/dashboard/UniversalTaskCard';
import TaskModal from '@/components/dashboard/TaskModal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
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

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [filterPriority, setFilterPriority] = useState('ALL');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [showArchived, setShowArchived] = useState(false);

    // Data
    const [categories, setCategories] = useState([]);

    // Pagination
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);
    const [isMoreLoading, setIsMoreLoading] = useState(false);

    const fetchTasks = useCallback(async (reset = false) => {
        setLoading(true);

        if (reset) {
            setPage(1);
        }

        try {
            const currentPage = reset ? 1 : page;

            // Prepare filters - Pure Entity Filtering
            const filters = {
                page: currentPage,
                limit: 10,
                search: searchQuery,
                priority: filterPriority,
                categoryId: selectedCategory,
                includeArchived: showArchived ? 'true' : 'false'
            };

            const [taskResponse, usageData, categoriesData] = await Promise.all([
                taskService.getTasks(filters),
                reset ? usageService.getMyUsage() : Promise.resolve(null),
                reset ? categoryService.getCategories() : Promise.resolve(null)
            ]);

            const processTasks = (tasksRaw) => {
                return tasksRaw.map(t => ({
                    ...t,
                    isCompleted: t.status === 'COMPLETED'
                }));
            };

            // Standard Pagination: Always Replace
            setTasks(processTasks(taskResponse.tasks));

            if (reset) {
                if (usageData) setUsage(usageData);
                if (categoriesData) setCategories(categoriesData);
            }

            setMeta(taskResponse.meta);

        } catch (err) {
            console.error("Failed to fetch tasks", err);
            error("Failed to load tasks");
        } finally {
            setLoading(false);
            setIsMoreLoading(false);
        }
    }, [page, searchQuery, filterPriority, selectedCategory, showArchived, error]);

    // Main data fetch effect – triggers whenever fetchTasks changes
    // (fetchTasks changes when page, searchQuery, filterPriority, selectedCategory, or showArchived change)
    const isInitialMount = useRef(true);

    useEffect(() => {
        fetchTasks(isInitialMount.current);
        isInitialMount.current = false;
    }, [fetchTasks]);

    // Search Effect (Debounced) – reset to page 1 after typing stops
    useEffect(() => {
        if (isInitialMount.current) return; // Skip on mount
        const timeoutId = setTimeout(() => {
            setPage(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Filter Effect (Immediate) – reset to page 1
    useEffect(() => {
        if (isInitialMount.current) return; // Skip on mount
        setPage(1);
    }, [filterPriority, selectedCategory, showArchived]);

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
            fetchTasks(true);
            success("Objective deleted successfully");
        } catch (err) {
            console.error("Delete failed", err);
            error("Failed to delete objective");
        }
    };

    const handleToggleComplete = async (task) => {
        // For Master List, "Complete" might mean "Archive" now that status is mostly ACTIVE.
        // User didn't specify what the checkbox DOES in Master Mode, only that it shouldn't hide items based on daily completion.
        // But the previous code toggled daily completion. 
        // If I click the checkbox on a Master List item, and it is "ACTIVE", should it become "COMPLETED (Today)"?
        // User said: "Tasks page ... must not use dailyCompletions to decide completion."
        // And: "If you want permanent complete: Add isCompleted field. But DO NOT use dailyCompletions."
        // Since we don't have isCompleted field yet, and User didn't ask to create it, 
        // I will keep the existing behavior: toggling it creates a daily completion. 
        // BUT, since the list REFRESHES and `getTasks` returns 'ACTIVE', the checkbox will UNCHECK immediately after updates.
        // This is a UX issue. 
        // However, User asked ONLY to fix the VIEW logic.
        // "Tasks page ... must not use dailyCompletions to decide completion."
        // So I will leave handleToggleComplete as is for now, but maybe I should warn the user or just let it be.
        // Actually, if I toggle complete, it creates a daily completion. 
        // The list refreshes. `getTasks` returns ACTIVE. Item shows as PENDING (unchecked). 
        // User might think: "I clicked it, it didn't work."
        // But this is what the user asked for: "Recurring tasks are never permanently completed."

        const completionDate = new Date().toLocaleDateString('en-CA');

        // Optimistic Update
        const previousTasks = [...tasks];
        const updatedTasks = tasks.map(t =>
            t.id === task.id ? { ...t, isCompleted: !t.isCompleted, status: !t.isCompleted ? 'COMPLETED' : 'PENDING' } : t
        );
        setTasks(updatedTasks);

        try {
            if (task.isCompleted) {
                await taskService.undoCompleteTask(task.id, completionDate);
            } else {
                await taskService.completeTask(task.id, completionDate);
            }
        } catch (err) {
            console.error("Completion toggle error", err);
            setTasks(previousTasks);
            error("Failed to update status");
        }
    };

    const canCreate = !usage || usage.taskCount < (usage.limits?.task || Infinity);

    // Group Tasks for Display
    const scheduledTasks = tasks.filter(t => t.schedule);
    const unscheduledTasks = tasks.filter(t => !t.schedule);

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
                        Master list of all operational objectives.
                    </p>
                </div>

                <div className="flex items-center gap-3">
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
                {/* Filter Bar - Simplified */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Filter className="h-4 w-4" />
                            <span className="text-xs font-mono uppercase tracking-wider">Filters:</span>
                        </div>

                        {/* Priority */}
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

                        {/* Category */}
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

                    {/* Show Archived Toggle */}
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-white transition-colors">
                            <input
                                type="checkbox"
                                checked={showArchived}
                                onChange={(e) => setShowArchived(e.target.checked)}
                                className="rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0"
                            />
                            Show Archived
                        </label>
                        <div className="h-4 w-px bg-white/10 hidden md:block"></div>
                        <div className="text-xs font-mono text-gray-500">
                            Total: <span className="text-white">{tasks.length}</span>
                        </div>
                    </div>
                </div>

                {/* Task List Content */}
                <div className="mt-6 space-y-8">
                    {loading ? (
                        <SkeletonLoader type="list" />
                    ) : tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-xl">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <ListTodo className="h-8 w-8 text-gray-700" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1">No Objectives Found</h3>
                            <p className="text-gray-500 text-sm max-w-sm mb-6">
                                {searchQuery ? "No matches found for your search." : "The queue is currently empty."}
                            </p>
                            <Button onClick={handleCreate} variant="secondary" size="sm">
                                Initialize Task
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Section 1: Scheduled */}
                            {scheduledTasks.length > 0 && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                                    <h3 className="flex items-center gap-2 text-xs font-mono text-cyan-500 mb-3 uppercase tracking-wider opacity-80 pl-1">
                                        <CalendarClock className="h-3 w-3" />
                                        Scheduled Operations
                                    </h3>
                                    <div className="space-y-1">
                                        {scheduledTasks.map(task => (
                                            <UniversalTaskCard
                                                key={task.id}
                                                item={task}
                                                type="TASK"
                                                // onComplete removed
                                                onEdit={() => handleEdit(task)}
                                                onDelete={() => confirmDelete(task)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Section 2: Unscheduled */}
                            {unscheduledTasks.length > 0 && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                                    <h3 className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-3 uppercase tracking-wider opacity-80 pl-1">
                                        <Inbox className="h-3 w-3" />
                                        Inbox / Backlog
                                    </h3>
                                    <div className="space-y-1">
                                        {unscheduledTasks.map(task => (
                                            <UniversalTaskCard
                                                key={task.id}
                                                item={task}
                                                type="TASK"
                                                // onComplete removed
                                                onEdit={() => handleEdit(task)}
                                                onDelete={() => confirmDelete(task)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                    <div className="p-4 border-t border-white/5 flex items-center justify-center gap-2 mt-6">
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
                                .filter(p => p === 1 || p === meta.totalPages || Math.abs(page - p) <= 1)
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
            </Card>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                taskToEdit={taskToEdit}
                onTaskSaved={() => {
                    fetchTasks(true);
                    success(taskToEdit ? "Objective updated" : "Objective initialized");
                }}
                categories={categories}
                onCategoryCreated={() => fetchTasks(true)}
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
        </div>
    );
}

