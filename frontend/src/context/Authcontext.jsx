import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const token = localStorage.getItem("token")

    if (token) {

      setUser({ token })
    } else {
      setUser(null)
    }

    setLoading(false)
  }, [])

  const login = async (email, password) => {
   
    const fakeToken = "jwt-token-from-backend"

    localStorage.setItem("token", fakeToken)
    setUser({ email })
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
