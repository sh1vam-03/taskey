import { Navigate } from "react-router-dom"
import { useAuth } from "../context/Authcontext"

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/auth" />

  return children
}

export default ProtectedRoute
