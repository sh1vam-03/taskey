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
                <h1 className="text-3xl font-bold tracking-tighter text-white text-center mb-2">
                    Recover_Access
                </h1>

                <p className="text-center text-gray-400 text-sm font-mono mb-8 max-w-sm mx-auto">
                    // ENTER_ID_TO_INITIATE_RESET_PROTOCOL
                </p>

                {message && <p className="text-green-500 text-sm text-center font-mono mb-4 border border-green-500/20 bg-green-500/10 p-2 rounded">{message}</p>}
                {error && <p className="text-red-500 text-sm text-center font-mono mb-4 border border-red-500/20 bg-red-500/10 p-2 rounded">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block mb-1 text-xs font-mono font-bold tracking-widest text-gray-500 uppercase"
                        >
                            Registered_Email
                        </label>

                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            suppressHydrationWarning
                            className="bg-zinc-950 border border-white/10 w-full px-4 py-3 text-sm rounded-sm outline-none text-white placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        isLoading={loading}
                        variant="scanline"
                        className="w-full sm:w-auto mt-2"
                    >
                        Transmit_Reset_Link
                    </Button>
                </form>

                <p className="text-center text-xs font-mono mt-8 text-gray-500">
                    // RECALL_CREDENTIALS?
                    <Link
                        href="/login"
                        className="ml-2 text-cyan-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        ABORT_RESET
                    </Link>
                </p>

            </div>
        </div>
    )
}
