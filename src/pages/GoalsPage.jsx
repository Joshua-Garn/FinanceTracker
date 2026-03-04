import { useState } from "react"
import { useGoals } from "../hooks/useGoals"
import { useAuth } from "../context/AuthContext"
import { createGoal, updateGoal, deleteGoal } from "../services/goalsService"

function getBarColor(percent) {
  if (percent >= 100) return "bg-emerald-500"
  if (percent >= 50) return "bg-emerald-400"
  return "bg-sky-400"
}

function GoalCard({ id, name, saved, target, onEdit, onDelete }) {
  const percent = target > 0 ? Math.round((saved / target) * 100) : 0
  const isComplete = percent >= 100
  const remaining = target - saved
  const barWidth = Math.min(percent, 100)

  return (
    <div
      className={`bg-white rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md group ${
        isComplete ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
        <div className="flex items-center gap-2">
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
          <button
            onClick={() => onEdit({ id, name, saved, target })}
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

function GoalModal({ goal, onClose, onSave }) {
  const isEdit = !!goal
  const [name, setName] = useState(goal?.name || "")
  const [target, setTarget] = useState(goal?.target?.toString() || "")
  const [saved, setSaved] = useState(goal?.saved?.toString() || "0")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !target) return

    setSaving(true)
    await onSave({
      name: name.trim(),
      target: parseFloat(target),
      saved: parseFloat(saved) || 0,
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
          {isEdit ? "Edit Goal" : "Add Goal"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vacation, Emergency Fund, etc."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
              required
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="5000.00"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount Saved</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={saved}
                onChange={(e) => setSaved(e.target.value)}
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
              {saving ? "Saving..." : isEdit ? "Update" : "Add Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function GoalsPage() {
  const { currentUser } = useAuth()
  const { goals, loading } = useGoals()
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)

  const totalSaved = goals.reduce((sum, g) => sum + (g.saved || 0), 0)

  async function handleSave(data) {
    if (editingGoal) {
      await updateGoal(currentUser.uid, editingGoal.id, data)
    } else {
      await createGoal(currentUser.uid, data)
    }
    setEditingGoal(null)
  }

  async function handleDelete(goalId) {
    await deleteGoal(currentUser.uid, goalId)
  }

  function handleEdit(goal) {
    setEditingGoal(goal)
    setShowModal(true)
  }

  function handleCloseModal() {
    setShowModal(false)
    setEditingGoal(null)
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
            <h2 className="text-2xl font-bold text-slate-900">Goals</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              You've saved{" "}
              <span className="text-slate-700 font-semibold">
                ${totalSaved.toLocaleString()}
              </span>{" "}
              across all goals.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
          >
            + Goal
          </button>
        </div>

        {/* Goals List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <p className="text-sm">No goals yet.</p>
              <p className="text-xs mt-1">Click "+ Goal" to start tracking your savings.</p>
            </div>
          ) : (
            goals.map((goal) => (
              <GoalCard key={goal.id} {...goal} onEdit={handleEdit} onDelete={handleDelete} />
            ))
          )}
        </div>
      </main>

      {showModal && (
        <GoalModal
          goal={editingGoal}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </>
  )
}
