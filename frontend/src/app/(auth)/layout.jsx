"use client";
import AiEnergySphere from "@/components/ui/AiEnergySphere";

export default function AuthLayout({
    children,
}) {
    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden font-mono text-white">

            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0">
                {/* Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

                {/* Orb far background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 scale-[2] pointer-events-none">
                    <AiEnergySphere size={800} speed={0.2} particleCount={40} />
                </div>
            </div>

            {/* Auth Container */}
            <div className="z-10 w-full max-w-md relative">
                {/* Tech Decorators */}
                <div className="absolute -top-12 left-0 text-xs text-gray-500">SERVER: SECURE_01</div>
                <div className="absolute -top-12 right-0 text-xs text-cyan-500 animate-pulse">● ENCRYPTED_CONN</div>

                <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-8 rounded-sm relative shadow-2xl">
                    {/* Corner Brackets */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-500/50" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-500/50" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyan-500/50" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-500/50" />

                    {children}
                </div>

                <div className="mt-8 text-center text-[10px] text-gray-600">
                    // UNAUTHORIZED_ACCESS_IS_PROHIBITED
                </div>
            </div>
        </main>
    )
}
