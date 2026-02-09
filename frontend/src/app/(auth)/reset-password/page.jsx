"use client";
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import authService from "@/services/auth.service"
import Button from "@/components/ui/Button"

export default function ResetPassword() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token")
        }
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        if (!token) return setError("Missing reset token")
        if (password.length < 8) return setError("Password must be at least 8 characters")
        if (password !== confirmPassword) return setError("Passwords do not match")

        try {
            setLoading(true)
            await authService.resetPassword(token, password)
            setSuccess("Password reset successfully. Redirecting to login...")
            setTimeout(() => {
                router.push("/login")
            }, 2000)
        } catch (err) {
            setError(err.message || "Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="flex justify-center items-center w-full bg-[var(--bg)] text-[var(--text)]">
                <div className="flex flex-col gap-6 p-8 border border-[var(--border)] bg-[var(--card)] w-full max-w-md rounded-md shadow-md text-center">
                    <h1 className="text-xl font-bold text-red-500">Invalid Link</h1>
                    <p>This password reset link is invalid or has expired.</p>
                    <Link href="/forgot-password" className="text-cyan-500 hover:underline">Request a new one</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center w-full bg-[var(--bg)] text-[var(--text)]">
            <div className="flex flex-col gap-6 p-8 border border-[var(--border)] bg-[var(--card)] w-full max-w-md rounded-md shadow-md">
                <h1 className="text-2xl font-bold text-center text-[var(--heading)]">
                    Set New Password
                </h1>

                {error && <p className="text-red-500 text-sm font-mono">{error}</p>}
                {success && <p className="text-green-500 text-sm font-mono">{success}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block mb-1 text-xs font-mono font-bold tracking-widest text-gray-500 uppercase">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            suppressHydrationWarning
                            className="bg-zinc-950 border border-white/10 w-full px-4 py-3 text-sm rounded-sm outline-none text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-xs font-mono font-bold tracking-widest text-gray-500 uppercase">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? "Resetting..." : "Update_Password"}
                    </Button>
                </form>
            </div>
        </div>
    )
}
