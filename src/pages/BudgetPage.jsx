import { useState } from "react"
import { useBudgets } from "../hooks/useBudgets"
import { useAuth } from "../context/AuthContext"
import { createBudget, updateBudget, deleteBudget } from "../services/budgetsService"

const defaultCategories = ["Rent", "Utilities", "Groceries", "Transportation", "Entertainment", "Dining Out", "Shopping", "Health", "Other"]

function getBarColor(percent) {
  if (percent > 100) return "bg-red-400"
  if (percent >= 75) return "bg-amber-400"
  return "bg-emerald-400"
}

function getMicrocopy(percent) {
  if (percent > 100) return { text: "You're slightly over budget here.", color: "text-red-500" }
  return { text: "Great job staying on track!", color: "text-emerald-600" }
}

function BudgetCard({ id, category, used, limit, onEdit, onDelete }) {
  const percent = limit > 0 ? Math.round((used / limit) * 100) : 0
  const remaining = limit - used
  const isOver = remaining < 0
  const barWidth = Math.min(percent, 100)
  const micro = getMicrocopy(percent)

  return (
    <div
      className={`bg-white rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md group ${
        isOver ? "border-red-200 bg-red-50/30" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-900">{category}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {isOver ? "Over by" : "Remaining"}{" "}
            <span className={`font-semibold ${isOver ? "text-red-500" : "text-slate-600"}`}>
              ${Math.abs(remaining).toLocaleString()}
            </span>
          </span>
          <button
            onClick={() => onEdit({ id, category, used, limit })}
            className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-emerald-600 transition-all cursor-pointer"
          >
            ✎
          </button>
          <button
            onClick={() => onDelete(id)}
            className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-red-500 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>
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

function BudgetModal({ budget, onClose, onSave }) {
  const isEdit = !!budget
  const [category, setCategory] = useState(budget?.category || "Rent")
  const [limit, setLimit] = useState(budget?.limit?.toString() || "")
  const [used, setUsed] = useState(budget?.used?.toString() || "0")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!limit) return

    setSaving(true)
    await onSave({
      category,
      limit: parseFloat(limit),
      used: parseFloat(used) || 0,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
        style={{ animation: "modalIn 0.2s ease-out" }}
      >
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          {isEdit ? "Edit Budget" : "Add Budget"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white"
            >
              {defaultCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Budget Limit</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="500.00"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount Used</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={used}
                onChange={(e) => setUsed(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-60"
            >
              {saving ? "Saving..." : isEdit ? "Update" : "Add Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BudgetPage() {
  const { currentUser } = useAuth()
  const { budgets, loading } = useBudgets()
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)

  const totalBudgeted = budgets.reduce((sum, b) => sum + (b.limit || 0), 0)
  const currentMonth = new Date().toLocaleDateString("en-US", { month: "long" })

  async function handleSave(data) {
    if (editingBudget) {
      await updateBudget(currentUser.uid, editingBudget.id, data)
    } else {
      await createBudget(currentUser.uid, data)
    }
    setEditingBudget(null)
  }

  async function handleDelete(budgetId) {
    await deleteBudget(currentUser.uid, budgetId)
  }

  function handleEdit(budget) {
    setEditingBudget(budget)
    setShowModal(true)
  }

  function handleCloseModal() {
    setShowModal(false)
    setEditingBudget(null)
  }

  return (
    <>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <main className="flex-1 flex flex-col min-w-0 p-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Budget</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              You've budgeted{" "}
              <span className="text-slate-700 font-semibold">
                ${totalBudgeted.toLocaleString()}
              </span>{" "}
              for {currentMonth}.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
          >
            + Budget
          </button>
        </div>

        {/* Budget List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <p className="text-sm">No budgets set yet.</p>
              <p className="text-xs mt-1">Click "+ Budget" to create your first category.</p>
            </div>
          ) : (
            budgets.map((item) => (
              <BudgetCard key={item.id} {...item} onEdit={handleEdit} onDelete={handleDelete} />
            ))
          )}
        </div>
      </main>

      {showModal && (
        <BudgetModal
          budget={editingBudget}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </>
  )
}
