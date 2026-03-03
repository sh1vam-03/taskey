"use client";
import React from "react";

// ─── Style injection ──────────────────────────────────────────────────────────
const STYLE_ID = "__card-system__";
const STYLE = `
  :root {
    --color-primary:        #06b6d4;
    --color-primary-glow:   rgba(6, 182, 212, 0.14);
    --color-primary-muted:  rgba(6, 182, 212, 0.08);
    --color-primary-border: rgba(6, 182, 212, 0.18);
  }
  @keyframes card-shimmer {
    0%   { transform: translateX(-100%); }
    60%  { transform: translateX(100%);  }
    100% { transform: translateX(100%);  }
  }
`;

function injectStyles() {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;
    const tag = document.createElement("style");
    tag.id = STYLE_ID;
    tag.textContent = STYLE;
    document.head.appendChild(tag);
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ className = "" }) {
    return (
        <svg className={`animate-spin h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
            <path fill="currentColor" className="opacity-80" d="M4 12a8 8 0 018-8v3.5a4.5 4.5 0 00-4.5 4.5H4z" />
        </svg>
    );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export default function Card({
    children,
    className = "",
    variant = "default",
    title,
    description,
    icon: Icon,
    action,
    shimmer = false,
    noPadding = false,
}) {
    if (typeof window !== "undefined") injectStyles();

    const variants = {
        default: [
            "bg-[#0a0e10]",
            "border border-white/[0.07]",
            "shadow-[0_1px_3px_rgba(0,0,0,0.4)]",
            // ← glow spread reduced: 0_4px_16px (was 0_8px_32px), no ring
            "hover:border-[var(--color-primary-border)]",
            "hover:shadow-[0_4px_16px_var(--color-primary-glow)]",
        ].join(" "),

        outline: [
            "bg-transparent",
            "border border-[var(--color-primary-border)]",
            "hover:bg-[var(--color-primary-muted)]",
            "hover:border-[var(--color-primary)]",
            // ← spread reduced: 0_4px_12px (was 0_4px_24px)
            "hover:shadow-[0_4px_12px_var(--color-primary-glow)]",
        ].join(" "),

        filled: [
            "bg-[var(--color-primary-muted)]",
            "border border-[var(--color-primary-border)]",
            "hover:bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]",
            "hover:border-[var(--color-primary)]",
            "hover:shadow-[0_4px_12px_var(--color-primary-glow)]",
        ].join(" "),

        ghost: [
            "bg-transparent border border-transparent",
            "hover:bg-[#0a0e10]",
            "hover:border-[var(--color-primary-border)]",
            "hover:shadow-[0_4px_12px_var(--color-primary-glow)]",
        ].join(" "),
    };

    const base = [
        "relative group flex flex-col overflow-hidden rounded-xl",
        "transition-all duration-300 ease-out",
        noPadding ? "" : "p-6",
        variants[variant] ?? variants.default,
    ].join(" ");

    return (
        <div className={`${base} ${className}`}>

            {/* Ambient glow — opacity reduced from 0.08 → 0.04 */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-12 -left-12 w-32 h-32 rounded-full
                           bg-[var(--color-primary)] opacity-0 blur-3xl
                           transition-opacity duration-500
                           group-hover:opacity-[0.04]"
            />

            {/* Shimmer */}
            {shimmer && (
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full z-10
                               bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
                    style={{ animation: "card-shimmer 3s ease-in-out infinite" }}
                />
            )}



            {/* Header */}
            {(title || Icon || action) && (
                <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {Icon && (
                            <div className="flex-shrink-0 flex items-center justify-center
                                            w-8 h-8 rounded-md
                                            bg-[var(--color-primary-muted)]
                                            border border-[var(--color-primary-border)]
                                            text-[var(--color-primary)]
                                            transition-colors duration-300
                                            group-hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]
                                            group-hover:border-[var(--color-primary)]">
                                <Icon className="w-4 h-4" />
                            </div>
                        )}
                        <div className="space-y-0.5 min-w-0">
                            {title && (
                                <h3 className="font-semibold text-white tracking-tight leading-snug
                                               group-hover:text-[var(--color-primary)]
                                               transition-colors duration-300">
                                    {title}
                                </h3>
                            )}
                            {description && (
                                <p className="text-sm text-white/30 font-mono leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    {action && <div className="flex-shrink-0 ml-4">{action}</div>}
                </div>
            )}

            {/* Body */}
            <div className="relative z-10 flex-1 flex flex-col min-h-0">
                {children}
            </div>
        </div>
    );
}