const previousMonth = "January"
const previousMonthTotal = 1240

const budgetItems = [
  { id: 1, category: "Rent", used: 1200, limit: 1200 },
  { id: 2, category: "Utilities", used: 185, limit: 200 },
  { id: 3, category: "Groceries", used: 320, limit: 500 },
  { id: 4, category: "Transportation", used: 275, limit: 300 },
  { id: 5, category: "Entertainment", used: 180, limit: 150 },
  { id: 6, category: "Dining Out", used: 95, limit: 200 },
]

function getBarColor(percent) {
  if (percent > 100) return "bg-red-400"
  if (percent >= 75) return "bg-amber-400"
  return "bg-emerald-400"
}

function getMicrocopy(percent) {
  if (percent > 100) return { text: "You're slightly over budget here.", color: "text-red-500" }
  return { text: "Great job staying on track!", color: "text-emerald-600" }
}

function BudgetCard({ category, used, limit }) {
  const percent = Math.round((used / limit) * 100)
  const remaining = limit - used
  const isOver = remaining < 0
  const barWidth = Math.min(percent, 100)
  const micro = getMicrocopy(percent)

  return (
    <div
      className={`bg-white rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md ${
        isOver ? "border-red-200 bg-red-50/30" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-900">{category}</h3>
        <span className="text-xs text-slate-400">
          {isOver ? "Over by" : "Remaining"}{" "}
          <span className={`font-semibold ${isOver ? "text-red-500" : "text-slate-600"}`}>
            ${Math.abs(remaining).toLocaleString()}
          </span>
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-3">
        ${used.toLocaleString()} of ${limit.toLocaleString()} used
      </p>

      {/* Progress Bar */}
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor(percent)}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <span className={`text-xs font-medium ${micro.color}`}>{micro.text}</span>
        <span className="text-xs font-medium text-slate-400">{percent}%</span>
      </div>
    </div>
  )
}

export default function BudgetPage() {
  return (
    <main className="flex-1 flex flex-col min-w-0 p-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Budget</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            You budgeted{" "}
            <span className="text-slate-700 font-semibold">
              ${previousMonthTotal.toLocaleString()}
            </span>{" "}
            on your bills in {previousMonth}.
          </p>
        </div>
        <button className="bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 text-sm font-medium px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow">
          Edit
        </button>
      </div>

      {/* Budget List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {budgetItems.map((item) => (
          <BudgetCard key={item.id} {...item} />
        ))}
      </div>
    </main>
  )
}
