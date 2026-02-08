"use client";
import { createContext, useContext, useEffect, useState } from "react"
import Cookies from "js-cookie"
import * as authActions from "../auth.actions"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await authActions.fetchCurrentUser()
                setUser(data.user)
            } catch (error) {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [])

    const login = async (email, password) => {
        const response = await authActions.loginUser(email, password)
        const { user } = response.data.data

        setUser(user)
        return user
    }

    const logout = async () => {
        try {
            await authActions.logoutUser()
        } catch (error) {
            // ignore
        }
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
