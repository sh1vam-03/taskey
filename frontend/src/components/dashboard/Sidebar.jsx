import { NavLink } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/Authcontext"

const Sidebar = ({ open, onClose }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }
  const linkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-md transition ${isActive ? "font-semibold" : "opacity-70 hover:opacity-100"
    }`

  return (
    <aside
      className={`
        fixed md:static z-40
        w-64 h-full
        border-r
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="px-6 py-6">

        {/* Mobile close */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Taskey</h2>
          <button onClick={onClose} className="text-xl">✕</button>
        </div>

        {/* Desktop title */}
        <h2
          className="hidden md:block text-xl font-bold mb-8"
          style={{ color: "var(--heading)" }}
        >
          Taskey
        </h2>

        <nav className="space-y-2">
          <NavLink to="/dashboard" end className={linkClass} onClick={onClose}>
            Overview
          </NavLink>
          <NavLink to="/dashboard/today" className={linkClass} onClick={onClose}>
            Today
          </NavLink>
          <NavLink to="/dashboard/weekly" className={linkClass} onClick={onClose}>
            Weekly
          </NavLink>
          <NavLink to="/dashboard/monthly" className={linkClass} onClick={onClose}>
            Monthly
          </NavLink>
          <NavLink to="/dashboard/streaks" className={linkClass} onClick={onClose}>
            Streaks
          </NavLink>
          <NavLink to="/dashboard/tasks" className={linkClass}>
            Tasks
          </NavLink>

        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 px-4 py-3 text-left rounded-md opacity-70 hover:opacity-100 transition cursor-pointer"
        >
          Logout
        </button>

      </div>
    </aside>
  )
}

export default Sidebar
