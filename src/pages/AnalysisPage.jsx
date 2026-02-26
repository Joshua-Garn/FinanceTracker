import { useState } from "react"

const snapshotCards = [
  {
    icon: "📉",
    title: "Spending vs Last Month",
    value: "-12%",
    positive: true,
    comparison: "You spent less than January.",
  },
  {
    icon: "💰",
    title: "Savings Rate",
    value: "24%",
    positive: true,
    comparison: "Up from 18% last month.",
  },
  {
    icon: "📈",
    title: "Income Trend",
    value: "+$320",
    positive: true,
    comparison: "Freelance income growing.",
  },
  {
    icon: "🎯",
    title: "Goal Progress",
    value: "3 of 5",
    positive: true,
    comparison: "Goals on track this month.",
  },
]

const insights = [
  {
    type: "positive",
    icon: "🟢",
    title: "Your savings rate improved",
    body: "You saved 24% of your income this month — up from 18% in January. Small, consistent changes are making a real difference.",
    action: "View savings breakdown",
  },
  {
    type: "optimization",
    icon: "🟡",
    title: "Dining expenses are creeping up",
    body: "You've spent $95 on dining out so far, which is trending 30% higher than last month. Consider setting a weekly dining limit to stay on track.",
    action: "Review dining transactions",
  },
  {
    type: "caution",
    icon: "🔴",
    title: "Entertainment budget exceeded",
    body: "You're $30 over your entertainment budget this month. It's not a big gap — a small adjustment next week should bring things back in line.",
    action: null,
  },
  {
    type: "positive",
    icon: "🟢",
    title: "Car goal is fully funded",
    body: "Congratulations! You've reached your $15,000 car savings goal. Consider redirecting that monthly contribution toward your next priority.",
    action: "Manage goals",
  },
]

const suggestedPrompts = [
  "Can I afford a $500 purchase?",
  "Where am I overspending?",
  "How can I save faster?",
]

function getInsightAccent(type) {
  switch (type) {
    case "positive":
      return "border-emerald-200 bg-emerald-50/30"
    case "optimization":
      return "border-amber-200 bg-amber-50/30"
    case "caution":
      return "border-red-200 bg-red-50/30"
    default:
      return "border-slate-200"
  }
}

function getActionColor(type) {
  switch (type) {
    case "positive":
      return "text-emerald-600 hover:text-emerald-700"
    case "optimization":
      return "text-amber-600 hover:text-amber-700"
    case "caution":
      return "text-red-500 hover:text-red-600"
    default:
      return "text-slate-600"
  }
}

function SnapshotCard({ icon, title, value, comparison }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-medium text-slate-500">{title}</span>
      </div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{comparison}</p>
    </div>
  )
}

function InsightCard({ type, icon, title, body, action }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${getInsightAccent(type)}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">{body}</p>
          {action && (
            <button
              className={`mt-3 text-xs font-semibold transition-colors cursor-pointer ${getActionColor(type)}`}
            >
              {action} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AnalysisPage() {
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState(null)

  function handleAsk() {
    if (!query.trim()) return
    setResponse(
      `Based on your recent activity, here's what I found: Your spending in "${query.trim()}" related categories has been stable. You're in good shape — keep it up!`
    )
    setQuery("")
  }

  return (
    <main className="flex-1 flex flex-col min-w-0 p-8 overflow-hidden">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Analysis</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Smart insights based on your financial activity.
        </p>
        <p className="text-xs text-slate-400 mt-0.5">Based on February activity.</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {/* Section 1: Snapshot Summary */}
        <div className="grid grid-cols-4 gap-4">
          {snapshotCards.map((card) => (
            <SnapshotCard key={card.title} {...card} />
          ))}
        </div>

        {/* Section 2: AI Insight Cards */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            AI Insights
          </h3>
          <div className="space-y-4">
            {insights.map((insight, i) => (
              <InsightCard key={i} {...insight} />
            ))}
          </div>
        </div>

        {/* Section 3: Ask AI */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Ask AI
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Ask about your spending…"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
            />
            <button
              onClick={handleAsk}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Send
            </button>
          </div>

          {/* Suggested Prompts */}
          <div className="flex flex-wrap gap-2 mt-3">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setQuery(prompt)}
                className="text-xs text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Response Card */}
          {response && (
            <div className="mt-4 bg-emerald-50/50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <span className="text-sm mt-0.5">🤖</span>
                <p className="text-sm text-slate-700 leading-relaxed">{response}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
