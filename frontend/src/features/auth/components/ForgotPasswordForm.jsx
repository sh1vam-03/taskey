"use client";
import { useState } from "react"
import Link from "next/link"
import authService from "@/services/auth.service"
import Button from "@/components/ui/Button"

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setMessage("")

        if (!email) return setError("Please enter your email address")

        try {
            setLoading(true)
            const data = await authService.forgotPassword(email)
            setMessage(data.message)
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center w-full bg-(--bg) text-(--text)">
            <div className="flex flex-col gap-6 p-5 sm:p-8 border border-(--border) bg-(--card) w-full max-w-md rounded-md shadow-md">
                <h1 className="text-2xl font-bold text-center text-(--heading)">
                    Forgot your password?
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
                        {loading ? "Sending reset link..." : "Send reset link"}
                    </Button>
                </form>

                <p className="text-xs text-center text-gray-500 font-mono mt-4">
                    Remember your password?
                    <Link href="/login" className="ml-2 text-cyan-500 hover:text-white transition-colors uppercase tracking-widest font-medium">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    )
}
