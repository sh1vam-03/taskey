import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const DashboardCard = ({
    title,
    value,
    icon: Icon,
    subtext,
    trend,
    className,
    delay = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay * 0.1 }}
            className={cn(
                "group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/30 hover:bg-zinc-900/80",
                className
            )}
        >
            {/* Tech Decorators */}
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                {Icon && <Icon className="h-16 w-16 text-cyan-500 rotate-12" />}
            </div>

            <div className="absolute top-2 left-2 text-[8px] text-white/10 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                // SYSTEM_METRIC
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-cyan-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition-colors">
                        {Icon && <Icon size={16} />}
                    </div>
                    <h3 className="text-sm font-medium text-gray-400 font-mono tracking-wide uppercase">{title}</h3>
                </div>

                <div className="mt-2">
                    <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
                    {(subtext || trend) && (
                        <div className="flex items-center gap-2 mt-1">
                            {trend && (
                                <span className={cn(
                                    "text-xs font-bold px-1.5 py-0.5 rounded",
                                    trend > 0 ? "text-green-400 bg-green-950/30" : "text-red-400 bg-red-950/30"
                                )}>
                                    {trend > 0 ? "+" : ""}{trend}%
                                </span>
                            )}
                            {subtext && <span className="text-xs text-gray-500 font-mono">{subtext}</span>}
                        </div>
                    )}
                </div>
            </div>

            {/* Scanning Line Effect on Hover */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-500/5 to-transparent -translate-y-full group-hover:animate-scan pointer-events-none" />
        </motion.div>
    );
};
