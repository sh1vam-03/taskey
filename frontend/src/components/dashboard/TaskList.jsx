import Link from "next/link";
import { FaArrowRight, FaPlus } from "react-icons/fa";
import TaskItem from "./TaskItem";

export default function TaskList({ tasks, title = "Tasks", link = "/dashboard/tasks", limit }) {
    const displayTasks = limit ? tasks.slice(0, limit) : tasks;
    const hasMore = tasks.length > displayTasks.length;

    if (!tasks || tasks.length === 0) {
        return (
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 text-center">
                <h3 className="text-gray-200 font-medium mb-1">{title}</h3>
                <p className="text-sm text-gray-500 mb-4">No active tasks found.</p>
                <button className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/20 hover:bg-cyan-950/40 px-3 py-2 rounded-lg transition-colors">
                    <FaPlus /> CREATE TASK
                </button>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="font-mono text-sm font-bold text-gray-300 uppercase tracking-wider">{title}</h3>
                {link && (
                    <Link href={link} className="flex items-center gap-1 text-xs text-gray-500 hover:text-cyan-400 transition-colors">
                        VIEW ALL <FaArrowRight className="w-3 h-3" />
                    </Link>
                )}
            </div>

            {/* List */}
            <div className="p-2 space-y-1">
                {displayTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                ))}
            </div>

            {/* Footer if clamped */}
            {hasMore && (
                <div className="px-4 py-2 text-center border-t border-white/5">
                    <span className="text-xs text-gray-600">And {tasks.length - displayTasks.length} more...</span>
                </div>
            )}
        </div>
    );
}
