import React from "react";

export default function Card({ children, className = "", title, description, icon: Icon, action }) {
    return (
        <div
            className={`bg-black border border-white/10 rounded-xl p-6 shadow-sm hover:border-white/20 transition-all duration-300 relative group flex flex-col ${className}`}
        >
            {/* Tech Decorators (Corner +) similar to Bento */}
            <div className="absolute top-2 left-2 text-[8px] text-white/10 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300">+</div>
            <div className="absolute top-2 right-2 text-[8px] text-white/10 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300">+</div>

            {(title || Icon) && (
                <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                        {title && (
                            <h3 className="font-semibold text-white tracking-tight flex items-center gap-2">
                                {Icon && <Icon className="w-4 h-4 text-cyan-500" />}
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p className="text-sm text-gray-500 font-mono leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}

            <div className="relative z-10 flex-1 flex flex-col">
                {children}
            </div>
        </div>
    );
}
