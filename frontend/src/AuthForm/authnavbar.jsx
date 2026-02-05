// import { Link } from "react-router-dom"
// import useTheme from "../hooks/useDarkmode"

// const AuthNavbar = () => {
//   const [theme, setTheme] = useTheme()

//   return (
//     <nav
//       className="hidden md:flex gap-6 sticky top-0 z-50 border-b backdrop-blur-md flex flex-wrap items-center justify-between gap-4 border-gray-200 "
//       style={{
//         backgroundColor: "var(--bg)",
//         borderColor: "var(--border)",
//       }}
//     >
//       <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

//         {/* Logo */}
//         <Link
//           to="/"
//           className="text-xl font-bold tracking-tight"
//         >
//           Taskey
//         </Link>

//         {/* Right side actions */}
//         <div className="flex items-center gap-4 ml-20">
//           {/* Optional helper link */}
//           <Link
//             to="/about"
//             className="text-sm font-medium hover:opacity-70 transition"
//           >
//             About
//           </Link>

//           {/* Theme Toggle */}
//           <button
//             onClick={() =>
//               setTheme(theme === "light" ? "dark" : "light")
//             }
//             className="px-3 py-2 rounded-lg border text-sm font-medium transition hover:opacity-80"
//             style={{ borderColor: "var(--border)" }}
//             aria-label="Toggle theme"
//           >
//             {theme === "light" ? "🌙 Dark" : "☀️ Light"}
//           </button>
//         </div>

//       </div>
//     </nav>
//   )
// }

// export default AuthNavbar


import { useState } from "react"
import { NavLink } from "react-router-dom"
import useTheme from "../hooks/useDarkmode"

const AuthNavbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [theme, setTheme] = useTheme()

  return (
    <nav
      className="border-b sticky top-0 z-50"
      style={{
        backgroundColor: "var(--bg)",
        borderColor: "var(--border)",
        color: "var(--text)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="text-xl font-bold">
          Taskey
        </NavLink>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <NavLink to="/">Home</NavLink>
         


          <button
            onClick={() =>
              setTheme(theme === "light" ? "dark" : "light")
            }
            className="border px-3 py-1 rounded-md"
            style={{ borderColor: "var(--border)" }}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8"
          aria-label="Toggle menu"
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
          isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className="flex flex-col px-4 py-4 gap-4 border-t text-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <NavLink onClick={() => setIsOpen(false)} to="/">
            Home
          </NavLink>
          <NavLink onClick={() => setIsOpen(false)} to="/about">
            About
          </NavLink>
          <NavLink onClick={() => setIsOpen(false)} to="/contact">
            Contact
          </NavLink>
          <NavLink onClick={() => setIsOpen(false)} to="/developers">
            Developers
          </NavLink>
          <NavLink onClick={() => setIsOpen(false)} to="/privacypolicy">
            Privacy Policy
          </NavLink>
          <NavLink onClick={() => setIsOpen(false)} to="/termsconditions">
            Terms & Conditions
          </NavLink>

          <button
            onClick={() =>
              setTheme(theme === "light" ? "dark" : "light")
            }
            className="border px-3 py-2 rounded-md w-fit"
            style={{ borderColor: "var(--border)" }}
          >
            {theme === "light"
              ? "🌙Dark"
              : "☀️Light"}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default AuthNavbar
