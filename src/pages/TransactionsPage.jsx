const transactions = [
  { id: 1, name: "Starbucks", amount: -6.75, category: "Food", date: "2026-02-20" },
  { id: 2, name: "Paycheck", amount: 850.00, category: "Income", date: "2026-02-18" },
  { id: 3, name: "Gas", amount: -42.09, category: "Transport", date: "2026-02-17" },
  { id: 4, name: "Netflix", amount: -15.99, category: "Entertainment", date: "2026-02-16" },
  { id: 5, name: "Grocery Store", amount: -78.23, category: "Food", date: "2026-02-15" },
  { id: 6, name: "Freelance Payment", amount: 320.00, category: "Income", date: "2026-02-14" },
  { id: 7, name: "Electric Bill", amount: -112.50, category: "Utilities", date: "2026-02-13" },
  { id: 8, name: "Coffee Shop", amount: -5.40, category: "Food", date: "2026-02-12" },
]

function getLastSevenDaysTotal() {
  const now = new Date("2026-02-24")
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 7)

  const total = transactions
    .filter((t) => {
      const d = new Date(t.date)
      return d >= sevenDaysAgo && d <= now
    })
    .reduce((sum, t) => sum + t.amount, 0)

  return total
}

function formatCurrency(amount) {
  const abs = Math.abs(amount).toFixed(2)
  return amount >= 0 ? `+$${abs}` : `-$${abs}`
}

function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function TransactionItem({ name, amount, category, date }) {
  const isPositive = amount >= 0
  return (
    <div className="flex items-center justify-between py-4 px-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-slate-900">{name}</span>
        <span className="text-xs text-slate-400">{category}</span>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-xs text-slate-400">{formatDate(date)}</span>
        <span
          className={`text-sm font-semibold min-w-[80px] text-right ${
            isPositive ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {formatCurrency(amount)}
        </span>
      </div>
    </div>
  )
}

export default function TransactionsPage() {
  const sevenDayTotal = getLastSevenDaysTotal()
  const isPositive = sevenDayTotal >= 0

  return (
    <main className="flex-1 flex flex-col min-w-0 p-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Transactions</h2>
          <p className="text-sm text-slate-500 mt-1">
            <span
              className={`font-semibold ${
                isPositive ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {formatCurrency(sevenDayTotal)}
            </span>{" "}
            in the last 7 days
          </p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer">
          + Transaction
        </button>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-y-auto">
        {transactions.map((t) => (
          <TransactionItem key={t.id} {...t} />
        ))}
      </div>
    </main>
  )
}
