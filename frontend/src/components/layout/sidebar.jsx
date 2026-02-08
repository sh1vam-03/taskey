import Item from "./Item"

const Sidebar = ({ open, onClose, active, onNavigate }) => {
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
      <div className="md:hidden p-4">
        <button
          onClick={onClose}
          className="px-3 py-2 border rounded-lg"
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
    </aside>
  )
}

export default Sidebar
