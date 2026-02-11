'use client';

import { useState, useEffect, useCallback } from 'react';
import taskService from '@/services/task.service';
import usageService from '@/services/usage.service';
import {
    Plus,
    Filter,
    MoreVertical,
    Trash2,
    Edit2,
    CheckCircle2,
    Circle,
    ListTodo,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import TaskModal from './TaskModal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [usage, setUsage] = useState(null);
    const [filter, setFilter] = useState('ALL');

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const [taskList, usageData] = await Promise.all([
                taskService.getTasks(),
                usageService.getMyUsage()
            ]);
            setTasks(taskList);
            setUsage(usageData);
        } catch (err) {
            console.error("Failed to fetch tasks", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleCreate = () => {
        setTaskToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (task) => {
        setTaskToEdit(task);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this task?")) return;
        try {
            await taskService.deleteTask(id);
            fetchTasks();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleToggleComplete = async (task) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            await taskService.completeTask(task.id, today);
            fetchTasks(); // Refresh to get updated state
        } catch (err) {
            console.error("Completion toggle error", err);
        }
    };

    const canCreate = !usage || usage.taskCount < (usage.limits?.task || Infinity);

    const filteredTasks = tasks.filter(t => filter === 'ALL' || t.priority === filter);

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

                <Button
                    onClick={handleCreate}
                    disabled={!canCreate}
                    variant="scanline"
                    className="shrink-0"
                >
                    <Plus className="h-4 w-4" /> Initialize Task
                </Button>
            </div>

            <Card className="min-h-[600px] border-white/10 bg-black/50">
                {/* Filters */}
                <div className="flex items-center gap-2 pb-6 border-b border-white/10 overflow-x-auto">
                    <Filter className="h-4 w-4 text-gray-500 mr-2 shrink-0" />
                    {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`
                                px-4 py-1.5 rounded text-xs font-mono tracking-wider transition-all border
                                ${filter === f
                                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                                    : 'bg-white/5 text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/10'
                                }
                            `}
                        >
                            {f}
                        </button>
                    ))}
                    <div className="ml-auto text-xs font-mono text-gray-600 hidden md:block">
                        Total Objectives: {tasks.length}
                    </div>
                </div>

                {/* Task List */}
                <div className="space-y-1 mt-6">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-20 rounded bg-white/5 animate-pulse border border-white/5" />
                        ))
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
                                        onClick={() => handleDelete(task.id)}
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
                                The queue is currently empty. Initialize a new task to begin tracking.
                            </p>
                            <Button onClick={handleCreate} variant="secondary" size="sm">
                                Create Task
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                taskToEdit={taskToEdit}
                onTaskSaved={fetchTasks}
                categories={[]}
            />
        </div>
    );
}
