"use client";
import React from "react"
import Spinner from "./Spinner"

export default function Button({
    children,
    variant = "primary",
    size = "md",
    className = "",
    isLoading = false,
    disabled,
    ...props
}) {
    // VARIANT STYLES
    const variants = {
        primary: `
            bg-black text-white dark:bg-white dark:text-black 
            bg-[var(--primary)] text-[var(--primary-fg)]
            shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] 
            hover:translate-y-[-1px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] 
            active:translate-y-[1px] active:scale-[0.98]
        `,
        secondary: `
            bg-[var(--secondary)] text-[var(--secondary-fg)] border border-[var(--border)]
            hover:bg-gray-100 dark:hover:bg-zinc-800
            active:scale-[0.98]
        `,
        ghost: `
            bg-transparent text-[var(--text-secondary)]
            hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[var(--text)]
            border border-transparent hover:border-white/10
        `,
        danger: `
            bg-red-500 text-white shadow-sm
            hover:bg-red-600
            active:scale-[0.98]
        `,
        scanline: `
            bg-white text-black relative overflow-hidden group border-0
            hover:text-white transition-colors duration-300
        `
    }

    // SIZE STYLES
    const sizes = {
        sm: "h-8 px-3 text-xs font-mono font-bold uppercase tracking-wider rounded-sm",
        md: "h-10 px-5 text-sm font-mono font-bold uppercase tracking-wider rounded-sm",
        lg: "h-14 px-10 text-base font-mono font-bold uppercase tracking-widest rounded-sm"
    }

    // BASE STYLES
    const baseStyles = `
        inline-flex items-center justify-center gap-2
        transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)]
        whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent)]
        disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none
    `

    return (
        <button
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Spinner size="sm" className="border-current border-t-transparent opacity-80 relative z-20" />}

            {variant === 'scanline' ? (
                <>
                    <span className="relative z-10 transition-colors duration-300 group-hover:text-white">{children}</span>
                    {/* Scanline Fill */}
                    <div className="absolute inset-0 bg-cyan-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                    {/* Tech Corners */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-black group-hover:border-white transition-colors z-20" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-black group-hover:border-white transition-colors z-20" />
                </>
            ) : (
                children
            )}
        </button>
    )
}
