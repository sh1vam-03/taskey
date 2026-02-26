import { motion } from "framer-motion";
import { FaCheck, FaClock, FaExclamationCircle } from "react-icons/fa";

export default function TaskItem({ task, onComplete }) {
    // Priority Colors
    const priorityColor = {
        HIGH: "text-red-400 border-red-500/20 bg-red-950/10",
        MEDIUM: "text-amber-400 border-amber-500/20 bg-amber-950/10",
        LOW: "text-blue-400 border-blue-500/20 bg-blue-950/10",
    }[task.priority] || "text-gray-400 border-gray-500/20 bg-gray-950/10";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex items-center gap-3 p-3 rounded-lg bg-zinc-900/30 border border-white/5 hover:bg-zinc-800/50 hover:border-white/10 transition-all cursor-pointer"
        >
            {/* Status Checkbox */}
            <button
                onClick={() => onComplete && onComplete(task.id)}
                className="w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center hover:border-cyan-400 hover:bg-cyan-950/30 transition-colors"
                title="Mark as Complete"
            >
                {task.status === 'COMPLETED' && <FaCheck className="w-3 h-3 text-cyan-400" />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium truncate ${task.status === 'COMPLETED' ? 'text-gray-500 line-through' : 'text-gray-200 group-hover:text-white'}`}>
                    {task.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <FaClock className="w-3 h-3" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "No due time"}
                    </span>
                    {task.category && <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] uppercase tracking-wider">{task.category}</span>}
                </div>
            </div>

            {/* Priority Badge */}
            <div className={`px-2 py-1 rounded text-[10px] font-bold border ${priorityColor}`}>
                {task.priority || "NORMAL"}
            </div>
        </motion.div>
    );
}
