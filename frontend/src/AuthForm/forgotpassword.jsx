

import React from 'react'
import { Link } from 'react-router-dom'

const ForgotPassword = () => {
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Password reset email sent")
  }

  return (
    <div className="flex justify-center items-center"
  style={{ minHeight: "calc(100vh - 64px)" }}>
      <div className="flex flex-col gap-6 p-8 border w-full max-w-md rounded-md shadow-md"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >

        <h1 className="text-2xl font-bold text-center mb-2">
          Forgot Password
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Enter your email and we’ll send you a reset link.
        </p>

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
              placeholder="you@example.com"
              className=" w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black focus:border-black"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-black w-full sm:w-auto text-white py-3 rounded-lg hover:bg-gray-800 transition cursor-pointer"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          <Link
            to="/login"
            className="font-medium hover:underline"
          >
            ← Back to Login
          </Link>
        </p>

      </div>
    </div>
  )
}

export default ForgotPassword
