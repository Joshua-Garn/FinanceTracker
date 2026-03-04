import { useNavigate } from "react-router-dom"
import { useTransactions } from "../hooks/useTransactions"
import { useBudgets } from "../hooks/useBudgets"
import { useGoals } from "../hooks/useGoals"
import { useAuth } from "../context/AuthContext"

function DashboardCard({ title, value, change, positive, subtitle, loading }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-slate-100 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-slate-400">{subtitle}</span>
        {!loading && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              positive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  )
}

function formatCurrency(amount) {
  const abs = Math.abs(amount)
  const formatted = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return amount >= 0 ? `$${formatted}` : `-$${formatted}`
}

function getThisMonthTransactions(transactions) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return transactions.filter((t) => new Date(t.date) >= startOfMonth)
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { transactions, loading: txLoading } = useTransactions()
  const { budgets, loading: budgetLoading } = useBudgets()
  const { goals, loading: goalsLoading } = useGoals()

  const loading = txLoading || budgetLoading || goalsLoading
  const username = currentUser?.email?.split("@")[0] || "there"

  const thisMonthTx = getThisMonthTransactions(transactions)
  const cashFlow = thisMonthTx.reduce((sum, t) => sum + t.amount, 0)
  const txCount = thisMonthTx.length

  const totalBudgetLimit = budgets.reduce((sum, b) => sum + (b.limit || 0), 0)
  const totalBudgetUsed = budgets.reduce((sum, b) => sum + (b.used || 0), 0)
  const budgetPercent = totalBudgetLimit > 0 ? Math.round((totalBudgetUsed / totalBudgetLimit) * 100) : 0

  const totalGoalTarget = goals.reduce((sum, g) => sum + (g.target || 0), 0)
  const totalGoalSaved = goals.reduce((sum, g) => sum + (g.saved || 0), 0)
  const goalPercent = totalGoalTarget > 0 ? Math.round((totalGoalSaved / totalGoalTarget) * 100) : 0

  const cards = [
    {
      title: "Cash Flow",
      value: formatCurrency(cashFlow),
      change: cashFlow >= 0 ? "Positive" : "Negative",
      positive: cashFlow >= 0,
      subtitle: "This month",
    },
    {
      title: "Goal Progress",
      value: `${goalPercent}%`,
      change: goalPercent >= 50 ? "On track" : "Keep going",
      positive: goalPercent >= 50,
      subtitle: `$${totalGoalSaved.toLocaleString()} saved`,
    },
    {
      title: "Budget",
      value: `$${totalBudgetUsed.toLocaleString()} / $${totalBudgetLimit.toLocaleString()}`,
      change: `${budgetPercent}% used`,
      positive: budgetPercent <= 80,
      subtitle: "Monthly spending",
    },
    {
      title: "Transactions",
      value: txCount.toString(),
      change: txCount > 0 ? "Active" : "None yet",
      positive: txCount > 0,
      subtitle: "This month",
    },
  ]

  return (
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
        <button
          onClick={() => navigate("/transactions")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          + Transaction
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-fr">
        {cards.map((card) => (
          <DashboardCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* Quick Summary */}
      {!loading && (
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Quick Summary
          </h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900">{goals.length}</p>
              <p className="text-xs text-slate-500 mt-1">Active Goals</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{budgets.length}</p>
              <p className="text-xs text-slate-500 mt-1">Budget Categories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{transactions.length}</p>
              <p className="text-xs text-slate-500 mt-1">Total Transactions</p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
