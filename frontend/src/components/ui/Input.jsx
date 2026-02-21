"use client";
import React from "react";
import { cn } from "@/lib/utils";

// ─── Style injection (matches Button/Card token system) ───────────────────────
const STYLE_ID = "__input-system__";
const STYLE = `
  :root {
    --color-primary:        #06b6d4;
    --color-primary-glow:   rgba(6, 182, 212, 0.13);
    --color-primary-muted:  rgba(6, 182, 212, 0.08);
    --color-primary-border: rgba(6, 182, 212, 0.18);
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

// ─── Input ────────────────────────────────────────────────────────────────────
/**
 * Props:
 *   label       — string, rendered above the input
 *   error       — string, renders an error message below + red border state
 *   hint        — string, renders a subtle hint below (hidden when error shown)
 *   leftIcon    — ReactNode, rendered inside left edge
 *   rightIcon   — ReactNode, rendered inside right edge
 *   All native <input> props are forwarded.
 */
export default function Input({
    className,
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    id,
    ...props
}) {
    if (typeof window !== "undefined") injectStyles();

    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
        <div className="flex flex-col gap-1.5 w-full">

            {/* ── Label ─────────────────────────────────────────────────── */}
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-[11px] font-mono uppercase tracking-[0.15em] text-white/35
                               group-focus-within:text-[var(--color-primary)] transition-colors duration-200"
                >
                    {label}
                </label>
            )}

            {/* ── Input wrapper ─────────────────────────────────────────── */}
            <div className="relative group">

                {/* Corner brackets — top-left, top-right, bottom-left, bottom-right */}
                <span className={`absolute top-0 left-0 w-2 h-2
                                  border-t border-l
                                  ${error
                        ? "border-rose-500/50"
                        : "border-white/15 group-focus-within:border-[var(--color-primary)]"
                    }
                                  transition-colors duration-250 pointer-events-none z-10`}
                />
                <span className={`absolute top-0 right-0 w-2 h-2
                                  border-t border-r
                                  ${error
                        ? "border-rose-500/50"
                        : "border-white/15 group-focus-within:border-[var(--color-primary)]"
                    }
                                  transition-colors duration-250 pointer-events-none z-10`}
                />
                <span className={`absolute bottom-0 left-0 w-2 h-2
                                  border-b border-l
                                  ${error
                        ? "border-rose-500/50"
                        : "border-white/15 group-focus-within:border-[var(--color-primary)]"
                    }
                                  transition-colors duration-250 pointer-events-none z-10`}
                />
                <span className={`absolute bottom-0 right-0 w-2 h-2
                                  border-b border-r
                                  ${error
                        ? "border-rose-500/50"
                        : "border-white/15 group-focus-within:border-[var(--color-primary)]"
                    }
                                  transition-colors duration-250 pointer-events-none z-10`}
                />

                {/* Left icon */}
                {leftIcon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2
                                     text-white/25 group-focus-within:text-[var(--color-primary)]
                                     transition-colors duration-200 pointer-events-none z-10">
                        {leftIcon}
                    </span>
                )}

                {/* Input */}
                <input
                    id={inputId}
                    className={cn(
                        // Layout
                        "flex h-10 w-full",
                        // Spacing — shift if icons present
                        leftIcon ? "pl-9  pr-4" : "px-4",
                        rightIcon ? "pr-9" : "",
                        // Typography
                        "text-sm text-white font-mono",
                        "placeholder:text-white/20",
                        // Surface
                        "bg-[#0a0e10] rounded-[3px]",
                        // Border — error vs normal
                        error
                            ? "border border-rose-500/40 focus:border-rose-500/70 focus:bg-rose-500/[0.04]"
                            : "border border-white/[0.08] focus:border-[var(--color-primary-border)] focus:bg-[var(--color-primary-muted)]",
                        // Focus shadow glow
                        error
                            ? "focus:shadow-[0_0_0_3px_rgba(244,63,94,0.08)]"
                            : "focus:shadow-[0_0_0_3px_var(--color-primary-glow)]",
                        // Transitions
                        "transition-all duration-200 ease-out",
                        "outline-none",
                        // Disabled
                        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
                        className
                    )}
                    {...props}
                />

                {/* Right icon */}
                {rightIcon && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2
                                     text-white/25 group-focus-within:text-[var(--color-primary)]
                                     transition-colors duration-200 pointer-events-none z-10">
                        {rightIcon}
                    </span>
                )}

            </div>

            {/* ── Helper text ───────────────────────────────────────────── */}
            {error ? (
                <p className="text-[11px] font-mono text-rose-400/80 leading-relaxed">
                    {error}
                </p>
            ) : hint ? (
                <p className="text-[11px] font-mono text-white/25 leading-relaxed">
                    {hint}
                </p>
            ) : null}

        </div>
    );
}