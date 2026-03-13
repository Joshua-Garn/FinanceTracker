import { getAuth } from "firebase/auth"
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore"
import { db } from "../lib/firebase"

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

function parseDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr)
}

function computeMetrics(transactions, budgets, goals) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const thisMonthTx = transactions.filter((t) => parseDate(t.date) >= startOfMonth)
  const lastMonthTx = transactions.filter((t) => {
    const d = parseDate(t.date)
    return d >= startOfLastMonth && d <= endOfLastMonth
  })

  const thisMonthSpending = thisMonthTx
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0)

  const lastMonthSpending = lastMonthTx
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0)

  const thisMonthIncome = thisMonthTx
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0)

  const spendingChange = lastMonthSpending > 0
    ? Math.round(((thisMonthSpending - lastMonthSpending) / lastMonthSpending) * 100)
    : 0

  const savingsRate = thisMonthIncome > 0
    ? Math.round(((thisMonthIncome - thisMonthSpending) / thisMonthIncome) * 100)
    : 0

  const totalBudgetLimit = budgets.reduce((s, b) => s + (b.limit || 0), 0)
  const totalBudgetUsed = budgets.reduce((s, b) => s + (b.used || 0), 0)
  const budgetUtilization = totalBudgetLimit > 0
    ? Math.round((totalBudgetUsed / totalBudgetLimit) * 100)
    : 0

  const totalGoalTarget = goals.reduce((s, g) => s + (g.target || 0), 0)
  const totalGoalSaved = goals.reduce((s, g) => s + (g.saved || 0), 0)
  const goalProgress = totalGoalTarget > 0
    ? Math.round((totalGoalSaved / totalGoalTarget) * 100)
    : 0

  return {
    spendingChange,
    savingsRate,
    thisMonthIncome,
    totalBudgetUsed,
    totalBudgetLimit,
    budgetUtilization,
    totalGoalSaved,
    totalGoalTarget,
    goalProgress,
  }
}

async function fetchUserData(uid) {
  const [txSnap, budgetSnap, goalSnap] = await Promise.all([
    getDocs(collection(db, "users", uid, "transactions")),
    getDocs(collection(db, "users", uid, "budgets")),
    getDocs(collection(db, "users", uid, "goals")),
  ])

  return {
    transactions: txSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    budgets: budgetSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    goals: goalSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  }
}

async function callOpenAI(systemPrompt, userPrompt) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  })

  if (!response.ok) {
    const txt = await response.text()
    throw new Error(`OpenAI error: ${txt}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ""
}

export async function generateInsights(question = null) {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing VITE_OPENAI_API_KEY in .env")
  }

  const uid = getAuth().currentUser?.uid
  if (!uid) throw new Error("User not authenticated")

  const { transactions, budgets, goals } = await fetchUserData(uid)
  const metrics = computeMetrics(transactions, budgets, goals)

  const systemPrompt = `Return ONLY valid JSON:
{
  "summary": {
    "spendingVsLastMonth": "string",
    "savingsRate": "string",
    "incomeTrend": "string",
    "goalProgress": "string"
  },
  "insights": [
    {
      "type": "positive|optimization|caution",
      "title": "string",
      "body": "string",
      "action": "string or null"
    }
  ],
  "askResponse": "string or null"
}`

  const userPrompt = `Metrics:
- Spending vs last month: ${metrics.spendingChange >= 0 ? "+" : ""}${metrics.spendingChange}%
- Savings rate: ${metrics.savingsRate}%
- Income: $${metrics.thisMonthIncome.toFixed(2)}
- Budget: $${metrics.totalBudgetUsed.toFixed(2)} / $${metrics.totalBudgetLimit.toFixed(2)} (${metrics.budgetUtilization}%)
- Goals: $${metrics.totalGoalSaved.toFixed(2)} / $${metrics.totalGoalTarget.toFixed(2)} (${metrics.goalProgress}%)
${question ? `Question: ${question}` : "No question, generate proactive advice."}
Give 3-4 concrete, encouraging finance insights.`

  const content = await callOpenAI(systemPrompt, userPrompt)
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("AI returned non-JSON response")
  const parsed = JSON.parse(jsonMatch[0])

  const result = {
    ...parsed,
    generatedAt: new Date().toISOString(),
  }

  await setDoc(doc(db, "users", uid, "analysis", "latest"), result, { merge: true })
  return result
}

export async function askAI(question) {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing VITE_OPENAI_API_KEY in .env")
  }

  const uid = getAuth().currentUser?.uid
  if (!uid) throw new Error("User not authenticated")
  if (!question?.trim()) throw new Error("Question is required")

  const { transactions, budgets, goals } = await fetchUserData(uid)
  const metrics = computeMetrics(transactions, budgets, goals)

  const systemPrompt = "You are a concise personal finance coach. Answer in 2-3 sentences."
  const userPrompt = `User metrics:
Spending change: ${metrics.spendingChange}%
Savings rate: ${metrics.savingsRate}%
Budget use: ${metrics.budgetUtilization}%
Goal progress: ${metrics.goalProgress}%
Question: ${question.trim()}`

  const answer = await callOpenAI(systemPrompt, userPrompt)
  return { answer }
}

export function watchAnalysis(uid, callback) {
  const ref = doc(db, "users", uid, "analysis", "latest")
  return onSnapshot(ref, (snap) => callback(snap.exists() ? snap.data() : null))
}
