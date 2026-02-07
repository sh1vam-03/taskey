"use client";
import { useTasks } from "@/features/tasks/useTasks";
import TaskList from "@/components/dashboard/TaskList";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import { FaPlus } from "react-icons/fa";

export default function TasksPage() {
    const { tasks, loading, error } = useTasks();

    if (error) {
        return <div className="text-red-400 p-4">Error loading tasks: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white font-mono">MY_TASKS</h1>
                    <p className="text-gray-500 text-sm">Manage your backlog and active items.</p>
                </div>
                <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm">
                    <FaPlus /> NEW TASK
                </button>
            </div>

            {loading ? (
                <SkeletonLoader type="list" />
            ) : (
                <div className="grid gap-6">
                    <TaskList title="High Priority" tasks={tasks.filter(t => t.priority === 'HIGH')} />
                    <TaskList title="All Tasks" tasks={tasks} />
                </div>
            )}
        </div>
    );
}
