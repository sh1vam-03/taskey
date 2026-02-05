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
            whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.2)" }}
            className={`row-span-1 rounded-3xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 bg-black border border-white/10 justify-between flex flex-col space-y-4 ${span} ${className}`}
        >
            {header}
            <div className="group-hover/bento:translate-x-2 transition duration-200">
                <div className="text-cyan-500 mb-2 mt-2 text-2xl">
                    {icon}
                </div>
                <div className="font-sans font-bold text-neutral-200 mb-2 mt-2">
                    {title}
                </div>
                <div className="font-sans font-normal text-neutral-400 text-xs text-pretty">
                    {description}
                </div>
            </div>
        </motion.div>
    );
};
