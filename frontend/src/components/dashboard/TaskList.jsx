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
        <div className="space-y-3">
            {/* Simple Header is handled by parent container now, but if we want it self-contained: */}
            {/* We can keep it minimal */}

            <div className="space-y-2">
                {displayTasks.map(task => (
                    <div
                        key={task.id}
                        className="group flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-white/5 hover:border-cyan-500/30 hover:bg-zinc-900/60 transition-all cursor-default"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'HIGH' ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`} />
                            <div>
                                <h4 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors line-clamp-1">{task.title}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase">
                                    <span>{task.category || 'General'}</span>
                                    {task.dueDate && <span>• Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                                </div>
                            </div>
                        </div>
                        {/* Status Indicator or minimal action */}
                        <div className={`text-[10px] px-2 py-0.5 rounded border ${task.status === 'COMPLETED'
                            ? "border-green-500/30 text-green-500 bg-green-500/10"
                            : "border-white/10 text-gray-500"
                            }`}>
                            {task.status || 'ACTIVE'}
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && link && (
                <Link href={link} className="block w-full py-2 text-center text-xs text-gray-500 hover:text-cyan-400 font-mono border-t border-dashed border-white/10 mt-2 transition-colors">
                    // VIEW_ALL_TARGETS
                </Link>
            )}
        </div>
    );
}
