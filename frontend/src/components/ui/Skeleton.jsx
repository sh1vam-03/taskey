"use client";

/**
 * Skeleton — themed loading placeholder.
 *
 * Props:
 *   className — pass w-*, h-*, rounded-* etc. to shape it
 *   variant   — "default" | "shimmer"
 *               default  → simple pulse
 *               shimmer  → sweeping light across the surface (more premium)
 */
export default function Skeleton({ className = "", variant = "shimmer" }) {
    if (variant === "shimmer") {
        return (
            <div
                className={`relative overflow-hidden rounded-[3px]
                            bg-white/[0.04] border border-white/[0.05]
                            ${className}`}
            >
                {/* Sweeping shimmer line */}
                <div
                    className="absolute inset-0 -translate-x-full
                               bg-gradient-to-r
                               from-transparent
                               via-white/[0.06]
                               to-transparent"
                    style={{ animation: "skeleton-sweep 1.8s ease-in-out infinite" }}
                />
                <style>{`
                    @keyframes skeleton-sweep {
                        0%   { transform: translateX(-100%); }
                        100% { transform: translateX(200%);  }
                    }
                `}</style>
            </div>
        );
    }

    // default — pulse only
    return (
        <div
            className={`animate-pulse rounded-[3px]
                        bg-white/[0.05] border border-white/[0.04]
                        ${className}`}
        />
    );
}