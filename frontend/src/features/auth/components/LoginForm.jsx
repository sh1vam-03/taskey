"use client";
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/context/AuthContext"

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
            // Login handles redirect
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

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Email */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full text-sm sm:text-base border rounded-lg px-4 py-3 outline-none transition focus:ring-2 focus:ring-black dark:focus:ring-white"
                            style={{
                                backgroundColor: "var(--bg)",
                                borderColor: "var(--border)",
                                color: "var(--text)",
                            }}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full text-sm sm:text-base border rounded-lg px-4 py-3 outline-none transition focus:ring-2 focus:ring-black dark:focus:ring-white"
                                style={{
                                    backgroundColor: "var(--bg)",
                                    borderColor: "var(--border)",
                                    color: "var(--text)",
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 opacity-70 hover:opacity-100"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Remember + Forgot */}
                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" />
                            Remember me
                        </label>
                        <Link href="/forgot-password" className="hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Button */}
                    <button
                        disabled={loading}
                        className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black py-3 rounded-lg font-medium transition hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>

                    {/* Switch */}
                    <p className="text-sm text-center opacity-80">
                        Don’t have an account?
                        <Link href="/signup" className="ml-2 underline font-medium">
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
