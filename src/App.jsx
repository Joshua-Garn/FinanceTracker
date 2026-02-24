const username = "Katie"

const navLinks = [
  { label: "Dashboard", icon: "📊", active: true },
  { label: "Transactions", icon: "💳", active: false },
  { label: "Analysis", icon: "📈", active: false },
  { label: "Budget", icon: "💰", active: false },
  { label: "Goals", icon: "🎯", active: false },
  { label: "Settings", icon: "⚙️", active: false },
]

const cards = [
  {
    title: "Total Balance",
    value: "$24,563.00",
    change: "+2.5%",
    positive: true,
    subtitle: "Across all accounts",
  },
  {
    title: "Cash Flow",
    value: "+$1,240.00",
    change: "+8.1%",
    positive: true,
    subtitle: "This month",
  },
  {
    title: "Goal Progress",
    value: "68%",
    change: "On track",
    positive: true,
    subtitle: "Emergency fund",
  },
  {
    title: "Budget",
    value: "$1,850 / $3,000",
    change: "62% used",
    positive: true,
    subtitle: "Monthly spending",
  },
  {
    title: "Transactions",
    value: "47",
    change: "-12 vs last month",
    positive: false,
    subtitle: "This month",
  },
]

function Sidebar() {
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
          <a
            key={link.label}
            href="#"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              link.active
                ? "bg-emerald-500/15 text-emerald-400"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </a>
        ))}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-slate-700 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white">
          {username.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{username}</p>
          <p className="text-xs text-slate-400">Personal Account</p>
        </div>
      </div>
    </aside>
  )
}

function DashboardCard({ title, value, change, positive, subtitle }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-slate-400">{subtitle}</span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            positive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Welcome, {username}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Here's your financial health today.
            </p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer">
            + Transaction
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-3 gap-5 auto-rows-fr">
          {cards.map((card) => (
            <DashboardCard key={card.title} {...card} />
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
