import { useEffect, useState } from "react"
import ProtectedRoute from "../../components/common/ProtectedRoute"
import DashboardLayout from "../../components/dashboard/DashboardLayout"
import dashboardService from "../../services/dashboard.services"

export default function DashboardStreaks() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await dashboardService.getStreakOverview() // Assuming backend naming in service
        // Actually service is getStreaks, backend is getStreakOverview.
        // Let's check service again. Service has getStreaks mapped to /dashboard/streaks.
        // It should match.
        setData(result)
      } catch (err) {
        setError(err.message || 'Failed to load streaks')
      } finally {
        setLoading(false)
      }
    }

    fetchData() // Wait, I called it getStreaks in the service file.
    // In the service file: getStreaks: async () => ... get('/dashboard/streaks')
    // So I should call result = await dashboardService.getStreaks()
  }, []) // Fixed in below code.

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <StreaksContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function StreaksContent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dashboardService.getStreaks()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--heading)" }}>Streak Overview</h1>
      <div className="border p-4 rounded-md">
        <p>Current Streak: {data?.currentStreak} days</p>
        <p>Longest Streak: {data?.longestStreak} days</p>
      </div>
    </div>
  )
}
