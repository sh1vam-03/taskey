"use client";
import { useState } from "react"
import Link from "next/link"
import authService from "@/services/auth.service"
import Button from "@/components/ui/Button"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setMessage("")

        if (!email) return setError("Email is required")

        try {
            setLoading(true)
            await authService.forgotPassword(email)
            setMessage("If an account exists, a reset link has been sent.")
        } catch (err) {
            setError(err.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center w-full bg-[var(--bg)] text-[var(--text)]">
            <div className="flex flex-col gap-6 p-8 border border-[var(--border)] bg-[var(--card)] w-full max-w-md rounded-md shadow-md">
                <h1 className="text-2xl font-bold text-center text-[var(--heading)]">
                    Reset Password
                </h1>

                <p className="text-center opacity-80">
                    Enter your email to receive a reset link
                </p>

                {error && <p className="text-red-500 text-sm font-mono">{error}</p>}
                {message && <p className="text-green-500 text-sm font-mono">{message}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block mb-1 text-xs font-mono font-bold tracking-widest text-gray-500 uppercase">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            suppressHydrationWarning
                            className="bg-zinc-950 border border-white/10 w-full px-4 py-3 text-sm rounded-sm outline-none text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                        />
                    </div>

                    <Button
                        disabled={loading}
                        isLoading={loading}
                        variant="scanline"
                        className="w-full sm:w-auto mt-4"
                    >
                        {loading ? "Sending..." : "Send_Reset_Link"}
                    </Button>
                </form>

                <p className="text-sm text-center opacity-80">
                    Remember your password?
                    <Link href="/login" className="ml-2 underline font-medium hover:text-cyan-400 decoration-cyan-500/50">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    )
}
