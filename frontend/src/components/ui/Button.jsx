"use client";
import React from "react";

// ─── Keyframe + CSS variable injection ───────────────────────────────────────
// Injected once into <head> so Button works with zero global CSS setup.
// Override any variable in your globals.css :root to re-theme instantly.
const STYLE_ID = "__btn-system__";
const STYLE = `
  :root {
    --color-primary:        #06b6d4;
    --color-primary-glow:   rgba(6, 182, 212, 0.38);
    --color-primary-muted:  rgba(6, 182, 212, 0.10);
    --color-primary-border: rgba(6, 182, 212, 0.30);
    --color-primary-fg:     #000;
    --bg:                   #000;
  }
  @keyframes btn-shimmer {
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

// ─── Spinner ─────────────────────────────────────────────────────────────────
function Spinner({ className = "" }) {
    return (
        <svg
            className={`animate-spin h-4 w-4 ${className}`}
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="3"
                className="opacity-20"
            />
            <path
                fill="currentColor"
                className="opacity-80"
                d="M4 12a8 8 0 018-8v3.5a4.5 4.5 0 00-4.5 4.5H4z"
            />
        </svg>
    );
}

// ─── Button ───────────────────────────────────────────────────────────────────
/**
 * Variants: primary | outline | ghost | secondary | scanline | danger
 * Sizes:    sm | md | lg
 *
 * Optional props:
 *   leftIcon  — ReactNode rendered before label
 *   rightIcon — ReactNode rendered after label
 *   isLoading — shows spinner, disables button
 */
export default function Button({
    children,
    variant = "primary",
    size = "md",
    className = "",
    isLoading = false,
    disabled,
    leftIcon,
    rightIcon,
    ...props
}) {
    // Inject styles once on first render (client only)
    if (typeof window !== "undefined") injectStyles();

    // ── Sizes ─────────────────────────────────────────────────────────────────
    const sizes = {
        sm: "h-8  px-4 text-[11px] gap-1.5",
        md: "h-10 px-5 text-[12px] gap-2",
        lg: "h-12 px-7 text-[13px] gap-2.5",
    };

    // ── Base ──────────────────────────────────────────────────────────────────
    const base = [
        "relative inline-flex items-center justify-center",
        "font-semibold uppercase tracking-[0.1em] rounded-[4px]",
        "whitespace-nowrap select-none cursor-pointer overflow-hidden",
        "transition-all duration-200 ease-out",
        "outline-none",
        "focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg,#000)]",
        "disabled:opacity-40 disabled:pointer-events-none",
    ].join(" ");

    // ── Variants ──────────────────────────────────────────────────────────────
    const V = {
        /**
         * PRIMARY — solid cyan, glow on hover, shimmer sweep.
         * Use for the single most important action (CTA).
         */
        primary: {
            cls: [
                "bg-[var(--color-primary)] text-[var(--color-primary-fg,#000)]",
                "border border-[color-mix(in_srgb,var(--color-primary)_80%,white)]",
                "shadow-[0_1px_2px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.18)_inset]",
                "hover:brightness-[1.12] hover:-translate-y-px",
                "hover:shadow-[0_8px_32px_var(--color-primary-glow),0_0_0_1px_rgba(255,255,255,0.25)_inset]",
                "active:translate-y-0 active:brightness-100 active:shadow-none",
            ].join(" "),
            shimmer: true,
        },

        /**
         * OUTLINE — transparent with cyan border.
         * Use for secondary actions alongside a primary.
         */
        outline: {
            cls: [
                "bg-transparent text-[var(--color-primary)]",
                "border border-[var(--color-primary-border)]",
                "hover:bg-[var(--color-primary-muted)]",
                "hover:border-[var(--color-primary)]",
                "hover:-translate-y-px",
                "hover:shadow-[0_4px_20px_var(--color-primary-glow)]",
                "active:translate-y-0 active:shadow-none",
            ].join(" "),
        },

        /**
         * GHOST — no background, no border at rest.
         * Use for tertiary / nav-style actions.
         */
        ghost: {
            cls: [
                "bg-transparent",
                "text-[color-mix(in_srgb,var(--color-primary)_70%,rgba(255,255,255,0.5))]",
                "border border-transparent",
                "hover:bg-[var(--color-primary-muted)]",
                "hover:border-[var(--color-primary-border)]",
                "hover:text-[var(--color-primary)]",
                "hover:-translate-y-px active:translate-y-0",
            ].join(" "),
        },

        /**
         * SECONDARY — frosted glass, neutral tone.
         * Use for cancel / dismiss / back actions.
         */
        secondary: {
            cls: [
                "bg-white/[0.05] text-white/60",
                "border border-white/10 backdrop-blur-sm",
                "hover:bg-white/[0.09] hover:text-white hover:border-white/20",
                "hover:-translate-y-px active:translate-y-0",
            ].join(" "),
        },

        /**
         * SCANLINE — dark surface, cyan fill sweeps up on hover.
         * Use for confirm / submit actions where you want dramatic motion.
         */
        scanline: {
            cls: [
                "bg-[#0b0f11] text-[var(--color-primary)]",
                "border border-[var(--color-primary-border)]",
                "hover:text-[var(--color-primary-fg,#000)]",
                "hover:-translate-y-px active:translate-y-0",
                "group",
            ].join(" "),
            sweep: [
                "bg-[var(--color-primary)]",
                "translate-y-full group-hover:translate-y-0",
                "transition-transform duration-[260ms] ease-out",
            ].join(" "),
        },

        /**
         * DANGER — rose red, use for destructive actions only.
         */
        danger: {
            cls: [
                "bg-rose-600 text-white",
                "border border-rose-500/30",
                "shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
                "hover:bg-rose-500 hover:-translate-y-px",
                "hover:shadow-[0_6px_24px_rgba(244,63,94,0.38)]",
                "active:translate-y-0 active:shadow-none",
            ].join(" "),
        },
    };

    const v = V[variant] ?? V.primary;

    return (
        <button
            className={`${base} ${sizes[size]} ${v.cls} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {/* Shimmer sweep — primary only */}
            {v.shimmer && (
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full
                               bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    style={{ animation: "btn-shimmer 2.6s ease-in-out infinite" }}
                />
            )}

            {/* Scanline fill sweep */}
            {v.sweep && (
                <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 z-0 ${v.sweep}`}
                />
            )}

            {/* Label / loading */}
            {isLoading ? (
                <Spinner className="relative z-10" />
            ) : (
                <>
                    {leftIcon && <span className="relative z-10 flex-shrink-0">{leftIcon}</span>}
                    <span className="relative z-10 flex items-center justify-center gap-2 hidden-group">{children}</span>
                    {rightIcon && <span className="relative z-10 flex-shrink-0">{rightIcon}</span>}
                </>
            )}
        </button>
    );
}