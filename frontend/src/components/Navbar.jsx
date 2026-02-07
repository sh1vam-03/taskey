
import { useState } from "react"
import { NavLink } from "react-router-dom"
import useTheme from "../hooks/useDarkmode"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [theme, setTheme] = useTheme()

  const linkClass = ({ isActive }) =>
    `relative transition ${
      isActive
        ? "font-semibold"
        : "opacity-80 hover:opacity-100"
    }`

  const ActiveBar = ({ isActive }) =>
    isActive ? (
      <span
        className="absolute left-0 -bottom-1 h-[2px] w-full"
        style={{ backgroundColor: "var(--text)" }}
      />
    ) : null

  const NavItem = ({ to, label, onClick }) => (
    <NavLink
      to={to}
      onClick={onClick}
      className={linkClass}
      style={{ color: "var(--text)" }}
    >
      {({ isActive }) => (
        <span className="relative">
          {label}
          <ActiveBar isActive={isActive} />
        </span>
      )}
    </NavLink>
  )

  return (
    <nav
      className="border-b sticky top-0 z-50"
      style={{
        backgroundColor: "var(--bg)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <NavLink to="/" className="text-xl font-bold">
          Taskey
        </NavLink>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <NavItem to="/" label="Home" />
          <NavItem to="/about" label="About" />
          <NavItem to="/contact" label="Contact" />
          <NavItem to="/developers" label="Developers" />
          <NavItem to="/privacypolicy" label="Privacy" />
          <NavItem to="/termsconditions" label="Terms" />
          <NavItem to="/login" label="Login" />

          <button
            onClick={() =>
              setTheme(theme === "light" ? "dark" : "light")
            }
            className="border px-3 py-1 rounded-md cursor-pointer"
            style={{ borderColor: "var(--border)" }}
          >
            {theme === "light" ? "🌙Dark" : "☀️Light"}
          </button>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8"
        >
          <span
            className={`h-0.5 w-6 bg-current transition-transform duration-300 ${
              isOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-current my-1 transition-opacity duration-300 ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-current transition-transform duration-300 ${
              isOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className="flex flex-col px-4 py-4 gap-4 border-t text-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <NavItem to="/" label="Home" onClick={() => setIsOpen(false)} />
          <NavItem to="/about" label="About" onClick={() => setIsOpen(false)} />
          <NavItem to="/contact" label="Contact" onClick={() => setIsOpen(false)} />
          <NavItem to="/developers" label="Developers" onClick={() => setIsOpen(false)} />
          <NavItem to="/privacypolicy" label="Privacy" onClick={() => setIsOpen(false)} />
          <NavItem to="/termsconditions" label="Terms" onClick={() => setIsOpen(false)} />
          <NavItem to="/login" label="Login" onClick={() => setIsOpen(false)} />

          <button
            onClick={() =>
              setTheme(theme === "light" ? "dark" : "light")
            }
            className="border px-3 py-2 rounded-md w-fit"
            style={{ borderColor: "var(--border)" }}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
