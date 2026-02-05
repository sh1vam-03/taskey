import { useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/Authcontext"
import AuthNavbar from "./authnavbar"

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

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
      navigate("/")
    } catch (err) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      

      <div
        className="flex justify-center items-center"
  style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <div
          className="flex flex-col gap-6 p-8 border w-full max-w-md rounded-md shadow-md"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <h1 className="text-2xl font-bold text-center mb-2">
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
                className="w-full text-sm sm:text-base border rounded-lg px-4 py-3 outline-none"
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
                  className="w-full text-sm sm:text-base border rounded-lg px-4 py-3 outline-none"
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
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" />
                Remember me
              </label>
              <Link to="/forgotpassword" className="hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Button */}
            <button
              disabled={loading}
              className=" w-full sm:w-auto bg-black text-white py-3 rounded-lg"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            {/* Switch */}
            <p className="text-sm text-center opacity-80">
              Don’t have an account?
              <Link to="/signup" className="ml-2 underline">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}

export default Login
