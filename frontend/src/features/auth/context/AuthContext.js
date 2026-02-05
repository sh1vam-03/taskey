"use client";
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/services/api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token")
            if (!token) {
                setLoading(false)
                return
            }

            try {
                // Verify token and get user details
                const { data } = await api.get("/auth/me")
                // Assumption: specific mount point /auth/me or /api/auth/me depending on index.js
                // I will adjust the path below if grep shows different mount.
                // Defaulting to /auth if mounted under /api in index.js
                setUser(data.user)
            } catch (error) {
                // console.error("Auth check failed:", error)
                localStorage.removeItem("token")
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [])

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password })
        localStorage.setItem("token", data.token) // Assuming backend returns { token, user }
        setUser(data.user)
        router.push("/dashboard")
    }

    const logout = async () => {
        try {
            await api.post("/auth/logout")
        } catch (error) {
            // console.error("Logout failed", error)
        }
        localStorage.removeItem("token")
        setUser(null)
        router.push("/login")
    }

    const requestOtp = async (email) => {
        await api.post("/auth/otp-request", { email })
        return true
    }

    const verifyOtp = async ({ name, email, password, otp }) => {
        const { data } = await api.post("/auth/verify-otp", {
            name,
            email,
            password,
            otp
        })
        // Usually verify-otp might return a token or just success. 
        // If it returns token, we log them in. 
        // Based on auth.controller, verifyOtp usually completes signup/login.
        if (data.token) {
            localStorage.setItem("token", data.token)
            setUser(data.user)
            router.push("/dashboard")
        } else {
            // If manual login required after verification
            router.push("/login")
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                login,
                logout,
                requestOtp,
                verifyOtp,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
