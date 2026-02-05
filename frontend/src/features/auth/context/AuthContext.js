"use client";
import { createContext, useContext, useEffect, useState } from "react"
import * as authActions from "../auth.actions"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token")
            if (!token) {
                setLoading(false)
                return
            }

            try {
                const data = await authActions.fetchCurrentUser()
                setUser(data.user)
            } catch (error) {
                localStorage.removeItem("token")
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [])

    const login = async (email, password) => {
        const data = await authActions.loginUser(email, password)
        localStorage.setItem("token", data.token)
        setUser(data.user)
        return data.user
    }

    const logout = async () => {
        try {
            await authActions.logoutUser()
        } catch (error) {
            // ignore
        }
        localStorage.removeItem("token")
        setUser(null)
    }

    const requestOtp = async (email) => {
        await authActions.requestOtp(email)
        return true
    }

    const verifyOtp = async (payload) => {
        const data = await authActions.verifyOtp(payload)
        if (data.token) {
            localStorage.setItem("token", data.token)
            setUser(data.user)
            return data.user
        }
        return null
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
