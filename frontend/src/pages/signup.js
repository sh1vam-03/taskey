import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/common/Navbar"

export default function Signup() {
  const [timer, setTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)

  const { requestOtp, verifyOtp } = useAuth()
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

    if (!name) return setError("Name is required")
    if (!email.includes("@")) return setError("Invalid email")
    if (password.length < 6 || password.length > 8)
      return setError("Password must be between 6 to 8 characters")
    if (password !== confirmPassword)
      return setError("Passwords do not match")

    try {
      setLoading(true)
      await requestOtp(email)
      setStep("otp")
      setSuccess("OTP sent to your email")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError("")

    if (!otp) return setError("OTP is required")

    try {
      setLoading(true)
      await verifyOtp({ name, email, password, otp })
      // verifyOtp handles redirect
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
      setSuccess("OTP resent successfully")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div
        className="flex justify-center items-center"
        style={{ minHeight: "calc(100vh - 64px)", backgroundColor: "var(--bg)", color: "var(--text)" }}
      >
        <div
          className="flex flex-col gap-6 p-8 border w-full max-w-md rounded-md shadow-md"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <h1 className="text-2xl font-bold text-center" style={{ color: "var(--heading)" }}>
            {step === "form" ? "Create Your Account" : "Verify OTP"}
          </h1>

          <p className="text-center opacity-80">
            {step === "form"
              ? "Sign up to start organizing your life with Taskey"
              : "Enter the OTP sent to your email"}
          </p>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          {step === "form" && (
            <form onSubmit={handleContinue} className="flex flex-col gap-5">
              {/* Name */}
              <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border w-full px-4 py-3 text-sm sm:text-base rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                style={{
                  backgroundColor: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              />

              {/* Email */}
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border w-full px-4 py-3 text-sm sm:text-base rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                style={{
                  backgroundColor: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              />

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border w-full px-4 py-3 text-sm sm:text-base rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  style={{
                    backgroundColor: "var(--bg)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 opacity-70 cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border w-full px-4 py-3 text-sm sm:text-base rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  style={{
                    backgroundColor: "var(--bg)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4 opacity-70 cursor-pointer"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button className="bg-black w-full sm:w-auto text-white dark:bg-white dark:text-black py-3 rounded-lg cursor-pointer transition hover:opacity-90">
                {loading ? "Sending OTP..." : "Continue"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleSignup} className="flex flex-col gap-5">
              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="border w-full px-4 py-3 text-sm sm:text-base rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                style={{
                  backgroundColor: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              />

              <button className="bg-black w-full sm:w-auto text-white dark:bg-white dark:text-black py-3 rounded-lg cursor-pointer transition hover:opacity-90">
                {loading ? "Verifying..." : "Create Account"}
              </button>

              <div className="text-sm text-center opacity-80">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="underline w-full sm:w-auto cursor-pointer"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span>Resend OTP in {timer}s</span>
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
      </div>
    </>
  )
}
