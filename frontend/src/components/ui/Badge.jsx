import React from "react";

const variants = {
    // Primary theme — cyan (matches TASKTIME brand)
    default: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25 shadow-[0_0_8px_rgba(6,182,212,0.15)]",

    // Semantic states — tinted to feel at home on dark bg
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    warning: "bg-amber-500/10  text-amber-400  border-amber-500/25",
    danger: "bg-red-500/10    text-red-400    border-red-500/25",

    // Info — brighter cyan accent for highlights / AI labels
    info: "bg-cyan-400/15 text-cyan-300 border-cyan-400/35 shadow-[0_0_10px_rgba(34,211,238,0.18)]",

    // Subtle ghost — almost invisible, just a border
    outline: "bg-transparent text-gray-500 border-white/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors duration-200",

    // Solid cyan fill — use for "ACTIVE", "LIVE", "AI" labels
    solid: "bg-cyan-500 text-black border-cyan-400 font-semibold tracking-wider",
};

export default function Badge({ children, variant = "default", className = "" }) {
    return (
        <span
            className={`
        inline-flex items-center gap-1
        px-2.5 py-0.5
        rounded-none          
        text-xs font-mono font-medium tracking-widest uppercase
        border
        ${variants[variant]}
        ${className}
      `}
        >
            {children}
        </span>
    );
}