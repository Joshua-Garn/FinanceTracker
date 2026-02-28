import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const username = "Katie"

const navLinks = [
  { label: "Dashboard", icon: "📊", to: "/" },
  { label: "Transactions", icon: "💳", to: "/transactions" },
  { label: "Analysis", icon: "📈", to: "/analysis" },
  { label: "Budget", icon: "💰", to: "/budget" },
  { label: "Goals", icon: "🎯", to: "/goals" },
  { label: "Settings", icon: "⚙️", to: "/settings" },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      navigate("/login", { replace: true })
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-white flex flex-col h-screen">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-emerald-400">Finance</span>Tracker
        </h1>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white">
            {username.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">{username}</p>
            <p className="text-xs text-slate-400">Personal Account</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
