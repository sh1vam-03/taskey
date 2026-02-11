import React from "react";
import { cn } from "@/lib/utils";

export default function Input({ className, ...props }) {
    return (
        <div className="relative group">
            {/* Tech Corners */}
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-cyan-500 transition-colors duration-300" />
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/20 group-focus-within:border-cyan-500 transition-colors duration-300" />

            <input
                className={cn(
                    "flex h-10 w-full bg-black/40 border border-white/10 px-4 py-2 text-sm text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-950/10 transition-all",
                    className
                )}
                {...props}
            />
        </div>
    );
}
