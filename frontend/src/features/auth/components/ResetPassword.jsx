// import { useState, useEffect } from "react"
// import { useSearchParams, useRouter } from "next/navigation"
// import { useForm } from "react-hook-form"
// import Link from "next/link"
// import * as authActions from "../auth.actions"

// const ResetPassword = () => {
//     const searchParams = useSearchParams()
//     const router = useRouter()
//     const token = searchParams.get("token")

//     const { register, handleSubmit, watch, formState: { errors } } = useForm()
//     const [isLoading, setIsLoading] = useState(false)
//     const [message, setMessage] = useState(null)
//     const [error, setError] = useState(null)
//     const [isSuccess, setIsSuccess] = useState(false)

//     useEffect(() => {
//         if (!token) {
//             setError("This password reset link is invalid or has expired.")
//         }
//     }, [token])

//     const onSubmit = async (data) => {
//         if (!token) return

//         setIsLoading(true)
//         setError(null)
//         setMessage(null)

//         try {
//             await authActions.resetPassword(token, data.password)
//             setIsSuccess(true)
//             setMessage("Your password has been updated. Redirecting to login...")
//             setTimeout(() => {
//                 router.push("/login")
//             }, 3000)
//         } catch (err) {
//             setError(
//                 err.response?.data?.message ||
//                 "We couldn’t reset your password. The link may have expired. Please request a new one."
//             )
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     const password = watch("password")

//     if (isSuccess) {
//         return (
//             <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
//                 <div className="mb-4 text-green-500">
//                     <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                     </svg>
//                 </div>
//                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Password updated successfully</h2>
//                 <p className="text-gray-600 mb-6">{message}</p>
//                 <Link href="/login" className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
//                     Back to Login
//                 </Link>
//             </div>
//         )
//     }

//     return (
//         <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
//             <div className="text-center">
//                 <h1 className="text-3xl font-bold text-gray-900">Create a new password</h1>
//                 <p className="mt-2 text-gray-600">Please enter and confirm your new password below</p>
//             </div>

//             {error && (
//                 <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
//                     {error}
//                 </div>
//             )}

//             {!token ? (
//                 <div className="text-center">
//                     <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-500 font-medium">
//                         Request a new password reset link
//                     </Link>
//                 </div>
//             ) : (
//                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">New Password</label>
//                         <input
//                             type="password"
//                             {...register("password", {
//                                 required: "Please enter a new password",
//                                 minLength: { value: 8, message: "Password must be at least 8 characters long" }
//                             })}
//                             className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
//                         />
//                         {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
//                     </div>

//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
//                         <input
//                             type="password"
//                             {...register("confirmPassword", {
//                                 required: "Please re-enter your password",
//                                 validate: (val) => val === password || "The passwords do not match"
//                             })}
//                             className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
//                         />
//                         {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={isLoading}
//                         className="w-full py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 transition-all font-semibold"
//                     >
//                         {isLoading ? "Updating password..." : "Update password"}
//                     </button>
//                 </form>
//             )}
//         </div>
//     )
// }

// export default ResetPassword
