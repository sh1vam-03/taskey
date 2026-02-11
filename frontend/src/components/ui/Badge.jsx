import React from "react";

const variants = {
    default: "bg-white/10 text-white border-white/20",
    success: "bg-green-500/10 text-green-500 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    danger: "bg-red-500/10 text-red-500 border-red-500/20",
    info: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    outline: "bg-transparent border-white/20 text-gray-400",
};

export default function Badge({ children, variant = "default", className = "" }) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
}
