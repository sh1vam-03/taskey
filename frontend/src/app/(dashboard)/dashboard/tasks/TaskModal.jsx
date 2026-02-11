'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal'; // Ensure this component handles dark mode or uses a portal
import { useForm } from 'react-hook-form';
import taskService from '@/services/task.service';
import Button from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, taskToEdit, onTaskSaved, categories = [] }) {
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            if (taskToEdit) {
                setValue('title', taskToEdit.title);
                setValue('description', taskToEdit.description);
                setValue('priority', taskToEdit.priority);
                setValue('categoryId', taskToEdit.categoryId || '');
            } else {
                reset({
                    title: '',
                    description: '',
                    priority: 'MEDIUM',
                    categoryId: ''
                });
            }
            setError(null);
        }
    }, [isOpen, taskToEdit, reset, setValue]);

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);
        try {
            if (taskToEdit) {
                await taskService.updateTask(taskToEdit.id, data);
            } else {
                await taskService.createTask(data);
            }
            onTaskSaved();
            onClose();
        } catch (err) {
            console.error("Task Save Error:", err);
            setError(err.response?.data?.message || "Failed to save task objective.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={taskToEdit ? "UPDATE OBJECTIVE" : "INITIALIZE OBJECTIVE"}
            className="border-white/10 bg-black/90 backdrop-blur-xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Objective Directive</label>
                    <input
                        {...register('title', { required: "Title is required" })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                        placeholder="Enter task operation name..."
                        autoFocus
                    />
                    {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Operational Details</label>
                    <textarea
                        {...register('description')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm min-h-[100px] resize-none"
                        placeholder="Add specific execution details..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Priority Class</label>
                        <select
                            {...register('priority')}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm appearance-none"
                        >
                            <option value="LOW" className="bg-black text-white">LOW PRIORITY</option>
                            <option value="MEDIUM" className="bg-black text-white">MEDIUM PRIORITY</option>
                            <option value="HIGH" className="bg-black text-white">HIGH PRIORITY</option>
                        </select>
                    </div>

                    {categories.length > 0 && (
                        <div className="space-y-2">
                            <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Category</label>
                            <select
                                {...register('categoryId')}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm appearance-none"
                            >
                                <option value="" className="bg-black text-gray-500">UNCLASSIFIED</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id} className="bg-black text-white">{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                    >
                        ABORT
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="min-w-[120px]"
                    >
                        {loading ? 'PROCESSING...' : (taskToEdit ? 'UPDATE OBJECTIVE' : 'INITIATE')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
