import { motion } from "framer-motion";

export const BentoGrid = ({ className, children }) => {
    return (
        <div
            className={`grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ${className}`}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
    span = "md:col-span-1"
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`row-span-1 rounded-sm group/bento hover:bg-neutral-900/40 hover:border-cyan-500/30 transition duration-300 shadow-none p-6 bg-black border border-white/10 justify-between flex flex-col space-y-4 relative ${span} ${className}`}
        >
            {/* Tech Decorators (Corner +) */}
            <div className="absolute top-2 left-2 text-[8px] text-white/10 font-mono">+</div>
            <div className="absolute top-2 right-2 text-[8px] text-white/10 font-mono">+</div>
            <div className="absolute bottom-2 left-2 text-[8px] text-white/10 font-mono">+</div>
            <div className="absolute bottom-2 right-2 text-[8px] text-white/10 font-mono">+</div>

            {header}
            <div className="group-hover/bento:translate-x-1 transition duration-200">
                <div className="text-cyan-500 mb-3 mt-2 text-2xl group-hover/bento:text-cyan-400">
                    {icon}
                </div>
                <div className="font-sans font-bold text-neutral-200 mb-2 mt-2 group-hover/bento:text-white">
                    {title}
                </div>
                <div className="font-sans font-normal text-neutral-400 text-sm text-pretty leading-relaxed">
                    {description}
                </div>
                {/* Tech Label in Bottom Right Hover */}
                <div className="flex justify-end opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300 mt-2">
                    <span className="text-[10px] text-cyan-900 bg-cyan-500/10 px-1 py-0.5 rounded font-mono">SYS.NODE</span>
                </div>
            </div>
        </motion.div>
    );
};
