export default function AuthLayout({
    children,
}) {
    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-[var(--bg)] relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(circle at 50% 50%, var(--border) 1px, transparent 1px)",
                    backgroundSize: "24px 24px"
                }}
            />
            <div className="z-10 w-full max-w-md p-6 relative animate-in">
                {children}
            </div>
        </main>
    )
}
