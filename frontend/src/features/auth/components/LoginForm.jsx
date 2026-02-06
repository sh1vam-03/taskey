"use client";
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/context/AuthContext"
import Spinner from "@/components/ui/Spinner"
import Button from "@/components/ui/Button"

export default function LoginForm() {
    const { login } = useAuth()
    const router = useRouter()

    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!email.includes("@")) {
            return setError("Enter a valid email")
        }
        if (!password) {
            return setError("Password is required")
        }

        try {
            setLoading(true)
            await login(email, password)
            router.push("/dashboard")
        } catch (err) {
            setError(err.message || "Login failed")
            setLoading(false)
        }
    }

    return (
        <div
            className="flex justify-center items-center w-full"
            style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
        >
            <div
                className="flex flex-col gap-6 p-8 border w-full max-w-md rounded-md shadow-md"
                style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                }}
            >
                <h1 className="text-2xl font-bold text-center mb-2" style={{ color: "var(--heading)" }}>
                    Welcome Back
                </h1>

                <p className="text-center opacity-80 mb-8">
                    Log in to continue managing your tasks
                </p>

                {error && <p className="text-red-500 text-sm mb-4 font-mono">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Email */}
                    <div>
                        <label className="block mb-1 text-xs font-mono font-bold tracking-widest text-gray-500 uppercase">
                            User_ID / Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            suppressHydrationWarning
                            className="bg-zinc-950 border border-white/10 w-full px-4 py-3 text-sm rounded-sm outline-none text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block mb-1 text-xs font-mono font-bold tracking-widest text-gray-500 uppercase">
                            Passcode
                        </label>
                        <div className="flex items-stretch gap-3">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                suppressHydrationWarning
                                className="bg-zinc-950 border border-white/10 flex-grow px-4 py-3 text-sm rounded-sm outline-none text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPassword(!showPassword)}
                                className="h-auto px-4 border border-white/10 font-mono text-cyan-500 hover:text-white"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </Button>
                        </div>
                    </div>

                    {/* Remember + Forgot */}
                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-400 font-mono text-xs">
                            <input type="checkbox" className="accent-cyan-500 bg-zinc-950 border-white/10" />
                            REMEMBER_SESSION
                        </label>
                        <Link href="/forgot-password" className="hover:text-cyan-400 transition-colors font-mono text-xs uppercase tracking-wider">
                            Reset_Access?
                        </Link>
                    </div>

                    {/* Button */}
                    <Button
                        disabled={loading}
                        isLoading={loading}
                        variant="scanline"
                        className="w-full sm:w-auto mt-4"
                    >
                        {loading ? "Authenticating..." : "Initialize_Session"}
                    </Button>

                    {/* Switch */}
                    <p className="text-xs text-center text-gray-500 font-mono mt-4">
                        // NO_ACTIVE_ID?
                        <Link href="/signup" className="ml-2 text-cyan-500 hover:text-white transition-colors uppercase tracking-widest">
                            CREATE_NODE
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
