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
        const response = await authActions.loginUser(email, password)
        const { accessToken, user } = response.data
        localStorage.setItem("token", accessToken)
        setUser(user)
        return user
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

    const signup = async (name, email, password) => {
        await authActions.signupUser(name, email, password)
        return true
    }

    const requestOtp = async (email) => {
        await authActions.requestOtp(email)
        return true
    }

    const verifyOtp = async (email, otp) => {
        await authActions.verifyOtp({ email, otp })
        return true
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                login,
                logout,
                signup,
                requestOtp,
                verifyOtp,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
