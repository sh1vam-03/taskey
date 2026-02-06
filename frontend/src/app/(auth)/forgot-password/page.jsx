"use client";
import Link from "next/link"
import { useState } from "react"
import api from "@/services/api"
import Button from "@/components/ui/Button"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage("")
        setError("")

        if (!email.includes("@")) return setError("Please enter a valid email")

        try {
            setLoading(true)
            // Call real API
            await api.post("/auth/forgot-password", { email })
            setMessage("If an account exists, a reset link has been sent.")
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send reset link")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center w-full" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
            <div className="flex flex-col gap-6 p-8 border w-full max-w-md rounded-md shadow-md"
                style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                }}
            >
                <h1 className="text-2xl font-bold text-center mb-2" style={{ color: "var(--heading)" }}>
                    Forgot Password
                </h1>

                <p className="text-center opacity-80 mb-8">
                    Enter your email and we’ll send you a reset link.
                </p>

                {message && <p className="text-green-500 text-sm text-center">{message}</p>}
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="block mb-1 text-sm font-medium"
                        >
                            Email
                        </label>

                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 text-sm sm:text-base border rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
                            style={{
                                backgroundColor: "var(--bg)",
                                borderColor: "var(--border)",
                                color: "var(--text)",
                            }}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        isLoading={loading}
                        className="w-full sm:w-auto font-medium"
                    >
                        Send Reset Link
                    </Button>
                </form>

                <p className="text-center text-sm mt-6">
                    <Link
                        href="/login"
                        className="font-medium hover:underline"
                    >
                        ← Back to Login
                    </Link>
                </p>

            </div>
        </div>
    )
}
