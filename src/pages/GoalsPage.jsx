const previousMonth = "January"
const previousMonthContribution = 420

const goals = [
  { id: 1, name: "Debt", saved: 8400, target: 12000 },
  { id: 2, name: "Vacation", saved: 1200, target: 3000 },
  { id: 3, name: "House", saved: 24000, target: 60000 },
  { id: 4, name: "Car", saved: 15000, target: 15000 },
  { id: 5, name: "Other", saved: 780, target: 2000 },
]

function getBarColor(percent) {
  if (percent >= 100) return "bg-emerald-500"
  if (percent >= 50) return "bg-emerald-400"
  return "bg-sky-400"
}

function GoalCard({ name, saved, target }) {
  const percent = Math.round((saved / target) * 100)
  const isComplete = percent >= 100
  const remaining = target - saved
  const barWidth = Math.min(percent, 100)

  return (
    <div
      className={`bg-white rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md ${
        isComplete ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
        {isComplete ? (
          <span className="text-xs font-semibold text-emerald-600">Complete</span>
        ) : (
          <span className="text-xs text-slate-400">
            <span className="font-semibold text-slate-600">
              ${remaining.toLocaleString()}
            </span>{" "}
            to go
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-3">
        ${saved.toLocaleString()} of ${target.toLocaleString()} saved
      </p>

      {/* Progress Bar */}
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor(percent)}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <span
          className={`text-xs font-medium ${
            isComplete ? "text-emerald-600" : "text-sky-600"
          }`}
        >
          {isComplete ? "Goal achieved 🎉" : "Keep it up, you're getting there!"}
        </span>
        <span className="text-xs font-medium text-slate-400">{percent}%</span>
      </div>
    </div>
  )
}

export default function GoalsPage() {
  return (
    <main className="flex-1 flex flex-col min-w-0 p-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Goals</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            You contributed{" "}
            <span className="text-slate-700 font-semibold">
              ${previousMonthContribution.toLocaleString()}
            </span>{" "}
            in {previousMonth}.
          </p>
        </div>
        <button className="bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 text-sm font-medium px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow">
          Edit
        </button>
      </div>

      {/* Goals List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {goals.map((goal) => (
          <GoalCard key={goal.id} {...goal} />
        ))}
      </div>
    </main>
  )
}
