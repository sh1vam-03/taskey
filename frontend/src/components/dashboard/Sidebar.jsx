import { NavLink } from "react-router-dom"

const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-md transition ${
      isActive ? "font-semibold" : "opacity-70 hover:opacity-100"
    }`

  return (
    <aside
      className="w-64 border-r hidden md:block"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="px-6 py-6">
        <h2 className="text-xl font-bold mb-8" style={{ color: "var(--heading)" }}>
          Taskey
        </h2>

        <nav className="space-y-2">
          <NavLink to="/dashboard" end className={linkClass}>Overview</NavLink>
          <NavLink to="/dashboard/today" className={linkClass}>Today</NavLink>
          <NavLink to="/dashboard/weekly" className={linkClass}>Weekly</NavLink>
          <NavLink to="/dashboard/monthly" className={linkClass}>Monthly</NavLink>
          <NavLink to="/dashboard/streaks" className={linkClass}>Streaks</NavLink>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
