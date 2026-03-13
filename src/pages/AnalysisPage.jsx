import { useState } from "react"
import { useAnalysis } from "../hooks/useAnalysis"
import { generateInsights, askAI } from "../services/analysisService"

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

function getInsightIcon(type) {
  switch (type) {
    case "positive":
      return "🟢"
    case "optimization":
      return "🟡"
    case "caution":
      return "🔴"
    default:
      return "💡"
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

function SnapshotCard({ icon, title, value, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-medium text-slate-500">{title}</span>
      </div>
      {loading ? (
        <div className="h-7 w-16 bg-slate-100 rounded animate-pulse" />
      ) : (
        <p className="text-xl font-bold text-slate-900">{value || "—"}</p>
      )}
    </div>
  )
}

function InsightCard({ type, title, body, action }) {
  const icon = getInsightIcon(type)
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
  const { analysis, loading: analysisLoading } = useAnalysis()
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState(null)

  const summary = analysis?.summary || {}
  const insights = analysis?.insights || []
  const lastGenerated = analysis?.generatedAt
    ? new Date(analysis.generatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    try {
      await generateInsights()
    } catch (err) {
      console.error("Failed to generate insights:", err)
      setError(err.message || "Failed to generate insights. Make sure the Functions emulator is running.")
    } finally {
      setGenerating(false)
    }
  }

  async function handleAsk() {
    if (!query.trim() || asking) return
    setAsking(true)
    try {
      const result = await askAI(query.trim())
      setResponse(result.answer)
      setQuery("")
    } catch (err) {
      console.error("Failed to ask AI:", err)
      setResponse("Sorry, I couldn't process your question. Please try again.")
    } finally {
      setAsking(false)
    }
  }

  const snapshotCards = [
    {
      icon: "📉",
      title: "Spending vs Last Month",
      value: summary.spendingVsLastMonth,
    },
    {
      icon: "💰",
      title: "Savings Rate",
      value: summary.savingsRate,
    },
    {
      icon: "📈",
      title: "Income Trend",
      value: summary.incomeTrend,
    },
    {
      icon: "🎯",
      title: "Goal Progress",
      value: summary.goalProgress,
    },
  ]

  return (
    <main className="flex-1 flex flex-col min-w-0 p-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analysis</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            AI-powered insights based on your financial activity.
          </p>
          {lastGenerated && (
            <p className="text-xs text-slate-400 mt-0.5">Last updated: {lastGenerated}</p>
          )}
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
        >
          {generating ? "Generating..." : "✨ Generate Insights"}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {/* Section 1: Snapshot Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {snapshotCards.map((card) => (
            <SnapshotCard key={card.title} {...card} loading={analysisLoading || generating} />
          ))}
        </div>

        {/* Section 2: AI Insight Cards */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            AI Insights
          </h3>
          {analysisLoading || generating ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
                      <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
                      <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, i) => (
                <InsightCard key={i} {...insight} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 p-8 text-center">
              <p className="text-sm text-slate-500">No insights yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Click "Generate Insights" to get AI-powered analysis of your finances.
              </p>
            </div>
          )}
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
              disabled={asking}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all disabled:opacity-60"
            />
            <button
              onClick={handleAsk}
              disabled={asking || !query.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              {asking ? "..." : "Send"}
            </button>
          </div>

          {/* Suggested Prompts */}
          <div className="flex flex-wrap gap-2 mt-3">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setQuery(prompt)}
                disabled={asking}
                className="text-xs text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-60"
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
