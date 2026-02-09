"use client"

import ResetPassword from "@/features/auth/components/ResetPassword"
import { Suspense } from "react"

export default function ResetPasswordPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPassword />
            </Suspense>
        </div>
    )
}
