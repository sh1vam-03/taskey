import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import * as authActions from "../auth.actions"

const ForgotPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const [error, setError] = useState(null)

    const onSubmit = async (data) => {
        setIsLoading(true)
        setError(null)
        setMessage(null)
        try {
            const response = await authActions.forgotPassword(data.email)
            setMessage(response.message || "If an account exists, a reset link has been sent.")
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
                <p className="mt-2 text-gray-600">Enter your email to receive a reset link.</p>
            </div>

            {message && (
                <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg">
                    {message}
                </div>
            )}

            {error && (
                <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address"
                            }
                        })}
                        className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="you@example.com"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 transition-all font-semibold"
                >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>

            <div className="text-center">
                <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Back to Login
                </Link>
            </div>
        </div>
    )
}

export default ForgotPassword
