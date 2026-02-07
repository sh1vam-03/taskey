import { motion } from "framer-motion";

export default function StatCard({ label, value, subtext, icon: Icon, trend }) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-zinc-900/50 border border-white/5 p-5 rounded-xl backdrop-blur-sm"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-cyan-950/30 rounded-lg">
                    <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? "text-green-400 bg-green-950/30" : "text-red-400 bg-red-950/30"
                        }`}>
                        {trend > 0 ? "+" : ""}{trend}%
                    </span>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white font-mono">{value}</h3>
                <p className="text-sm text-gray-400">{label}</p>
            </div>

            {subtext && (
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-500">
                    {subtext}
                </div>
            )}
        </motion.div>
    );
}
