import { motion } from "framer-motion";

export const BentoGrid = ({ className, children }) => {
    return (
        <div
            className={`grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 bg-white/5 border border-white/10 gap-px rounded-sm overflow-hidden max-w-7xl mx-auto ${className}`}
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
        <div
            className={`row-span-1 group/bento p-8 bg-black hover:bg-neutral-900/30 transition-colors duration-300 flex flex-col justify-between relative ${span} ${className}`}
        >
            {/* Tech Decorators (Corner +) */}
            <div className="absolute top-2 left-2 text-[10px] text-white/20 font-mono">+</div>
            <div className="absolute top-2 right-2 text-[10px] text-white/20 font-mono">+</div>
            <div className="absolute bottom-2 left-2 text-[10px] text-white/20 font-mono">+</div>
            <div className="absolute bottom-2 right-2 text-[10px] text-white/20 font-mono">+</div>

            <div className="flex justify-between items-start">
                <div className="text-2xl text-white group-hover/bento:text-cyan-500 transition-colors">
                    {icon}
                </div>
                {/* Optional ID label if needed, or keeping it clean for Bento */}
            </div>

            <div className="mt-4">
                <h3 className="font-bold text-white mb-2 group-hover/bento:text-cyan-400 transition-colors leading-none tracking-tight text-xl">
                    {title}
                </h3>
                {/* DetailedFeatures style Line separator */}
                <div className="h-px w-8 bg-white/20 my-3 group-hover/bento:w-full group-hover/bento:bg-cyan-500/50 transition-all duration-500" />

                <p className="font-mono text-sm text-gray-500 group-hover/bento:text-gray-400 transition-colors leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
};
