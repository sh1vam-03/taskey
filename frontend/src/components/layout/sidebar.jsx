import Item from "./Item"
import { useAuth } from "../../context/Authcontext"

const Sidebar = ({ open, onClose, active, onNavigate }) => {
    const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    
  }
  return (
    <aside
      className={`
        fixed md:static top-0 left-0 h-full w-64 z-40
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
      style={{
        backgroundColor: "var(--bg)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Mobile close */}
      <div className="md:hidden p-4 ">
        <button
          onClick={onClose}
          className="px-3 py-2 border rounded-lg cursor-pointer"
          style={{ borderColor: "var(--border)" }}
        >
          ✕ Close
        </button>
      </div>

      <nav className="space-y-2 p-4">
        <Item
          label="Overview"
          active={active === "overview"}
          onClick={() => onNavigate("overview")}
        />
        <Item
          label="Calendar"
          active={active === "calendar"}
          onClick={() => onNavigate("calendar")}
        />
        <Item
          label="Tasks"
          active={active === "tasks"}
          onClick={() => onNavigate("tasks")}
        />
      </nav>

      <button
          onClick={logout}
          className="w-full px-4 py-3 my-3 rounded-lg text-left transition hover:opacity-80 cursor-pointer"
          style={{
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        >
           Logout
        </button>

     
    </aside>
  )
}

export default Sidebar
