"use client";
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import authService from "@/services/auth.service"
import Button from "@/components/ui/Button"

function ResetPasswordContent() {
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
            setError("This password reset link is invalid or has expired.")
        }
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        if (!token) return setError("This reset link is invalid or has expired.")
        if (password.length < 8) return setError("Password must be at least 8 characters long")
        if (password !== confirmPassword) return setError("Passwords do not match")

        try {
            setLoading(true)
            await authService.resetPassword(token, password)
            setSuccess("Your password has been updated. Redirecting to login...")
            setTimeout(() => {
                router.push("/login")
            }, 2000)
        } catch (err) {
            setError(err.message || "We couldn’t reset your password. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="flex justify-center items-center w-full bg-(--bg) text-(--text)">
                <div className="flex flex-col gap-6 p-5 sm:p-8 border border-(--border) bg-(--card) w-full max-w-md rounded-md shadow-md text-center">
                    <h1 className="text-xl font-bold text-red-500">Invalid or expired link</h1>
                    <p>This password reset link is no longer valid.</p>
                    <Link href="/forgot-password" className="text-cyan-500 hover:underline">Request a new reset link</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center w-full bg-(--bg) text-(--text)">
            <div className="flex flex-col gap-6 p-5 sm:p-8 border border-(--border) bg-(--card) w-full max-w-md rounded-md shadow-md">
                <h1 className="text-2xl font-bold text-center text-(--heading)">
                    Create a new password
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
                        {loading ? "Updating password..." : "Update password"}
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default function ResetPasswordForm() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-screen w-full bg-black text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-mono text-sm tracking-widest animate-pulse text-cyan-500">Verifying link...</span>
                </div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    )
}
