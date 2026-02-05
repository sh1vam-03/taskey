import { Outlet } from "react-router-dom"
import Sidebar from "../../components/dashboard/Sidebar.jsx"

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main
        className="flex-1 px-6 py-6"
        style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
      >
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout
