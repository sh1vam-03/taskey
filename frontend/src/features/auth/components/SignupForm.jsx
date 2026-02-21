"use client";
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Button from "@/components/ui/Button"

export default function SignupForm() {
    const [timer, setTimer] = useState(30)
    const [canResend, setCanResend] = useState(false)

    const { requestOtp, verifyOtp, signup, login } = useAuth()
    const router = useRouter()

    const [step, setStep] = useState("form") // form | otp
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [otp, setOtp] = useState("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleContinue = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!name.trim()) return setError("Please enter your name")
        if (!emailRegex.test(email)) return setError("Please enter a valid email address")

        if (password.length < 8) return setError("Password must be at least 8 characters long")
        if (!/[A-Z]/.test(password) && !/[0-9]/.test(password)) return setError("Password must include at least one uppercase letter or number")

        if (password !== confirmPassword) return setError("Passwords do not match")

        try {
            setLoading(true)
            await signup(name, email, password)
            setStep("otp")
            setSuccess("We've sent a verification code to your email.")
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSignup = async (e) => {
        e.preventDefault()
        setError("")

        if (!otp) return setError("Please enter the verification code")

        try {
            setLoading(true)
            await verifyOtp(email, otp)
            setSuccess("Email verified. Signing you in...")

            // Auto login
            await login(email, password)
            router.push("/dashboard")
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    useEffect(() => {
        if (step !== "otp") return

        setTimer(30)
        setCanResend(false)

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    setCanResend(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [step])

    const handleResendOtp = async () => {
        try {
            setLoading(true)
            await requestOtp(email)
            setTimer(30)
            setCanResend(false)
            setSuccess("Verification code sent successfully.")
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center w-full bg-[var(--bg)] text-[var(--text)]">
            <div className="flex flex-col gap-6 p-8 border border-[var(--border)] bg-[var(--card)] w-full max-w-md rounded-md shadow-md">
                <h1 className="text-2xl font-bold text-center text-[var(--heading)]">
                    {step === "form" ? "Create Your Account" : "Verify your email"}
                </h1>

                <p className="text-center opacity-80">
                    {step === "form"
                        ? "Sign up to start organizing your life with TASKTIME"
                        : "Enter the 6-digit code sent to your email address."}
                </p>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}

                {step === "form" && (
                    <form onSubmit={handleContinue} className="flex flex-col gap-5">
                        {/* Name */}
                        <input
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            suppressHydrationWarning
                            className="bg-zinc-950 border border-white/10 w-full px-4 py-3 text-sm sm:text-base rounded-sm outline-none text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                        />

                        {/* Email */}
                        <input
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            suppressHydrationWarning
                            className="bg-zinc-950 border border-white/10 w-full px-4 py-3 text-sm sm:text-base rounded-sm outline-none text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                        />

                        {/* Password */}
                        <div className="flex items-stretch gap-3">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                suppressHydrationWarning
                                className="bg-zinc-950 border border-white/10 flex-grow px-4 py-3 text-sm sm:text-base rounded-sm outline-none text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
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

                        {/* Confirm Password */}
                        <div className="flex items-stretch gap-3">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                suppressHydrationWarning
                                className="bg-zinc-950 border border-white/10 flex-grow px-4 py-3 text-sm sm:text-base rounded-sm outline-none text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="h-auto px-4 border border-white/10 font-mono text-cyan-500 hover:text-white"
                            >
                                {showConfirmPassword ? "Hide" : "Show"}
                            </Button>
                        </div>
                        <span className="text-xs text-gray-500">
                            By signing up, you agree to our <Link href="/terms" className="text-cyan-500 hover:text-cyan-200">Terms of Service</Link> and <Link href="/privacy" className="text-cyan-500 hover:text-cyan-200">Privacy Policy</Link>.
                        </span>

                        <Button
                            className="w-full sm:w-auto mt-4"
                            disabled={loading}
                            isLoading={loading}
                            variant="scanline"
                        >
                            {loading ? "Creating account..." : "Create account"}
                        </Button>
                    </form>
                )}

                {step === "otp" && (
                    <form onSubmit={handleSignup} className="flex flex-col gap-5">
                        <input
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            suppressHydrationWarning
                            className="bg-zinc-950 border border-white/10 w-full text-center tracking-[1em] px-4 py-3 text-lg rounded-sm outline-none text-white placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                        />

                        <Button
                            className="w-full sm:w-auto"
                            disabled={loading}
                            isLoading={loading}
                            variant="scanline"
                        >
                            {loading ? "Verifying..." : "Verify email"}
                        </Button>

                        <div className="text-sm text-center opacity-80 font-mono text-gray-500">
                            {canResend ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResendOtp}
                                    className="underline decoration-cyan-500 underline-offset-4"
                                >
                                    Resend code
                                </Button>
                            ) : (
                                <span>Resend available in {timer}s</span>
                            )}
                        </div>
                    </form>
                )}

                <p className="text-sm text-center opacity-80">
                    Already have an account?
                    <Link href="/login" className="ml-2 underline font-medium">
                        Log In
                    </Link>
                </p>
            </div>
        </div >
    )
}
