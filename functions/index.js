import { onCall, HttpsError } from "firebase-functions/v2/https"
import { initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import OpenAI from "openai"

initializeApp()
const db = getFirestore()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function computeMetrics(transactions, budgets, goals) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const thisMonthTx = transactions.filter((t) => new Date(t.date) >= startOfMonth)
  const lastMonthTx = transactions.filter((t) => {
    const d = new Date(t.date)
    return d >= startOfLastMonth && d <= endOfLastMonth
  })

  const thisMonthSpending = thisMonthTx.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  const lastMonthSpending = lastMonthTx.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  const thisMonthIncome = thisMonthTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const lastMonthIncome = lastMonthTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)

  const spendingChange = lastMonthSpending > 0
    ? Math.round(((thisMonthSpending - lastMonthSpending) / lastMonthSpending) * 100)
    : 0

  const savingsRate = thisMonthIncome > 0
    ? Math.round(((thisMonthIncome - thisMonthSpending) / thisMonthIncome) * 100)
    : 0

  const incomeChange = thisMonthIncome - lastMonthIncome

  const categorySpending = {}
  thisMonthTx.filter((t) => t.amount < 0).forEach((t) => {
    const cat = t.category || "Other"
    categorySpending[cat] = (categorySpending[cat] || 0) + Math.abs(t.amount)
  })

  const totalBudgetLimit = budgets.reduce((s, b) => s + (b.limit || 0), 0)
  const totalBudgetUsed = budgets.reduce((s, b) => s + (b.used || 0), 0)
  const budgetUtilization = totalBudgetLimit > 0 ? Math.round((totalBudgetUsed / totalBudgetLimit) * 100) : 0

  const overBudgetCategories = budgets.filter((b) => b.used > b.limit).map((b) => ({
    category: b.category,
    over: b.used - b.limit,
  }))

  const totalGoalTarget = goals.reduce((s, g) => s + (g.target || 0), 0)
  const totalGoalSaved = goals.reduce((s, g) => s + (g.saved || 0), 0)
  const goalProgress = totalGoalTarget > 0 ? Math.round((totalGoalSaved / totalGoalTarget) * 100) : 0
  const completedGoals = goals.filter((g) => g.saved >= g.target).length
  const activeGoals = goals.length

  return {
    thisMonthSpending,
    lastMonthSpending,
    spendingChange,
    thisMonthIncome,
    incomeChange,
    savingsRate,
    categorySpending,
    totalBudgetLimit,
    totalBudgetUsed,
    budgetUtilization,
    overBudgetCategories,
    totalGoalTarget,
    totalGoalSaved,
    goalProgress,
    completedGoals,
    activeGoals,
  }
}

async function generateAIInsights(metrics, question = null) {
  const systemPrompt = `You are a friendly, non-judgmental personal finance coach. Give practical, actionable advice. Be concise and encouraging. Never give investment guarantees or legal/tax advice. Frame suggestions as education, not financial advice.

Always respond with valid JSON matching this exact schema:
{
  "summary": {
    "spendingVsLastMonth": "string like '+12%' or '-8%'",
    "savingsRate": "string like '24%'",
    "incomeTrend": "string like '+$320' or '-$150'",
    "goalProgress": "string like '2 of 4 on track'"
  },
  "insights": [
    {
      "type": "positive" | "optimization" | "caution",
      "title": "short title",
      "body": "1-2 sentence explanation",
      "action": "optional action suggestion or null"
    }
  ],
  "askResponse": "string response to user question, or null if no question"
}`

  const userPrompt = `Here are the user's financial metrics for this month:

Spending: $${metrics.thisMonthSpending.toFixed(2)} (${metrics.spendingChange >= 0 ? "+" : ""}${metrics.spendingChange}% vs last month)
Income: $${metrics.thisMonthIncome.toFixed(2)} (${metrics.incomeChange >= 0 ? "+$" : "-$"}${Math.abs(metrics.incomeChange).toFixed(2)} vs last month)
Savings Rate: ${metrics.savingsRate}%

Budget: ${metrics.budgetUtilization}% used ($${metrics.totalBudgetUsed.toFixed(2)} of $${metrics.totalBudgetLimit.toFixed(2)})
${metrics.overBudgetCategories.length > 0 ? `Over budget: ${metrics.overBudgetCategories.map((c) => `${c.category} by $${c.over.toFixed(2)}`).join(", ")}` : "All categories within budget"}

Goals: ${metrics.goalProgress}% overall (${metrics.completedGoals} of ${metrics.activeGoals} completed)
Total saved toward goals: $${metrics.totalGoalSaved.toFixed(2)} of $${metrics.totalGoalTarget.toFixed(2)}

Spending by category: ${Object.entries(metrics.categorySpending).map(([k, v]) => `${k}: $${v.toFixed(2)}`).join(", ") || "No spending data"}

${question ? `User question: "${question}"` : "No specific question - provide general insights."}

Generate 3-4 relevant insights based on this data. Be specific to their actual numbers.`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  const content = response.choices[0]?.message?.content || "{}"
  
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error("Failed to parse AI response:", e)
  }

  return {
    summary: {
      spendingVsLastMonth: `${metrics.spendingChange >= 0 ? "+" : ""}${metrics.spendingChange}%`,
      savingsRate: `${metrics.savingsRate}%`,
      incomeTrend: `${metrics.incomeChange >= 0 ? "+$" : "-$"}${Math.abs(metrics.incomeChange).toFixed(0)}`,
      goalProgress: `${metrics.completedGoals} of ${metrics.activeGoals}`,
    },
    insights: [],
    askResponse: question ? "I couldn't generate a response. Please try again." : null,
  }
}

export const generateInsights = onCall(
  { secrets: ["OPENAI_API_KEY"], cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in")
    }

    const uid = request.auth.uid
    const question = request.data?.question || null

    try {
      const [txSnap, budgetSnap, goalSnap] = await Promise.all([
        db.collection("users").doc(uid).collection("transactions").get(),
        db.collection("users").doc(uid).collection("budgets").get(),
        db.collection("users").doc(uid).collection("goals").get(),
      ])

      const transactions = txSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const budgets = budgetSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const goals = goalSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

      const metrics = computeMetrics(transactions, budgets, goals)
      const aiResult = await generateAIInsights(metrics, question)

      await db.collection("users").doc(uid).collection("analysis").doc("latest").set({
        ...aiResult,
        generatedAt: new Date().toISOString(),
        metrics,
      })

      return aiResult
    } catch (error) {
      console.error("generateInsights error:", error)
      throw new HttpsError("internal", "Failed to generate insights")
    }
  }
)

export const askAI = onCall(
  { secrets: ["OPENAI_API_KEY"], cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in")
    }

    const uid = request.auth.uid
    const question = request.data?.question

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      throw new HttpsError("invalid-argument", "Question is required")
    }

    try {
      const [txSnap, budgetSnap, goalSnap] = await Promise.all([
        db.collection("users").doc(uid).collection("transactions").get(),
        db.collection("users").doc(uid).collection("budgets").get(),
        db.collection("users").doc(uid).collection("goals").get(),
      ])

      const transactions = txSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const budgets = budgetSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const goals = goalSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

      const metrics = computeMetrics(transactions, budgets, goals)

      const systemPrompt = `You are a friendly personal finance coach. Answer the user's question based on their financial data. Be concise (2-3 sentences max), practical, and encouraging. Never give investment guarantees or legal/tax advice.`

      const userPrompt = `User's financial summary:
- Monthly spending: $${metrics.thisMonthSpending.toFixed(2)}
- Monthly income: $${metrics.thisMonthIncome.toFixed(2)}
- Savings rate: ${metrics.savingsRate}%
- Budget used: ${metrics.budgetUtilization}%
- Goal progress: ${metrics.goalProgress}%
- Categories: ${Object.entries(metrics.categorySpending).map(([k, v]) => `${k}: $${v.toFixed(2)}`).join(", ") || "None"}

Question: "${question.trim()}"`

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 200,
      })

      return {
        answer: response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.",
      }
    } catch (error) {
      console.error("askAI error:", error)
      throw new HttpsError("internal", "Failed to get AI response")
    }
  }
)
