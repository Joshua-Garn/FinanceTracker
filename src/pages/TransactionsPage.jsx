import { useState } from "react"
import { useTransactions } from "../hooks/useTransactions"
import { useAuth } from "../context/AuthContext"
import { createTransaction, deleteTransaction } from "../services/transactionsService"

const categories = ["Food", "Transport", "Entertainment", "Utilities", "Income", "Shopping", "Health", "Other"]

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

function getLastSevenDaysTotal(transactions) {
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 7)

  return transactions
    .filter((t) => {
      const d = new Date(t.date)
      return d >= sevenDaysAgo && d <= now
    })
    .reduce((sum, t) => sum + t.amount, 0)
}

function TransactionItem({ id, name, amount, category, date, onDelete }) {
  const isPositive = amount >= 0
  return (
    <div className="flex items-center justify-between py-4 px-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors group">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-slate-900">{name}</span>
        <span className="text-xs text-slate-400">{category}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-400">{formatDate(date)}</span>
        <span
          className={`text-sm font-semibold min-w-[80px] text-right ${
            isPositive ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {formatCurrency(amount)}
        </span>
        <button
          onClick={() => onDelete(id)}
          className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-red-500 transition-all cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function AddTransactionModal({ onClose, onSave }) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("Food")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isExpense, setIsExpense] = useState(true)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !amount) return

    setSaving(true)
    const numAmount = parseFloat(amount) * (isExpense ? -1 : 1)
    await onSave({ name: name.trim(), amount: numAmount, category, date })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
        style={{ animation: "modalIn 0.2s ease-out" }}
      >
        <h3 className="text-lg font-bold text-slate-900 mb-4">Add Transaction</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Coffee, Paycheck, etc."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
              required
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsExpense(true)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                    isExpense ? "bg-red-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpense(false)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                    !isExpense ? "bg-emerald-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Income
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
              {saving ? "Saving..." : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TransactionsPage() {
  const { currentUser } = useAuth()
  const { transactions, loading } = useTransactions()
  const [showModal, setShowModal] = useState(false)

  const sevenDayTotal = getLastSevenDaysTotal(transactions)
  const isPositive = sevenDayTotal >= 0

  async function handleCreate(data) {
    await createTransaction(currentUser.uid, data)
  }

  async function handleDelete(transactionId) {
    await deleteTransaction(currentUser.uid, transactionId)
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
          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            + Transaction
          </button>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <p className="text-sm">No transactions yet.</p>
              <p className="text-xs mt-1">Click "+ Transaction" to add your first one.</p>
            </div>
          ) : (
            transactions.map((t) => (
              <TransactionItem key={t.id} {...t} onDelete={handleDelete} />
            ))
          )}
        </div>
      </main>

      {showModal && (
        <AddTransactionModal onClose={() => setShowModal(false)} onSave={handleCreate} />
      )}
    </>
  )
}
