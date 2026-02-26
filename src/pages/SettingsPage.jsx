import { useState } from "react"

const defaultProfile = {
  name: "Katie",
  email: "katie@example.com",
}

function Toggle({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out ${
        enabled ? "bg-emerald-500" : "bg-slate-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  )
}

function EditProfileModal({ profile, onClose, onSave }) {
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn 0.2s ease-out" }}
      >
        <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Profile</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Profile Picture
            </label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-lg font-bold text-white shadow-sm">
                {name.charAt(0)}
              </div>
              <button
                type="button"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                Upload photo
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({ name, email })
              onClose()
            }}
            className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ onClose, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn 0.2s ease-out" }}
      >
        <h3 className="text-lg font-bold text-slate-900 mb-2">Delete All Data?</h3>
        <p className="text-sm text-slate-500 mb-6">
          This action cannot be undone. All your financial data will be permanently removed.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Delete Everything
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [profile, setProfile] = useState(defaultProfile)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [darkMode, setDarkMode] = useState(false)
  const [aiInsights, setAiInsights] = useState(true)
  const [motivational, setMotivational] = useState(true)

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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Manage your account and preferences.
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Section 1: Profile */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Profile
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-xl font-bold text-white shadow-sm">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{profile.name}</p>
                  <p className="text-xs text-slate-400">{profile.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 text-sm font-medium px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Section 2: App Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              App Preferences
            </h3>
            <div className="divide-y divide-slate-100">
              {/* Dark Mode */}
              <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">🌙 Dark Mode</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Switch to a darker color theme.
                  </p>
                </div>
                <Toggle enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />
              </div>

              {/* AI Insights */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">🤖 Enable AI Insights</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Receive personalized financial insights on your Analysis page.
                  </p>
                </div>
                <Toggle enabled={aiInsights} onToggle={() => setAiInsights(!aiInsights)} />
              </div>

              {/* Motivational Messages */}
              <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">💬 Show Motivational Messages</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Display encouraging tips throughout the app.
                  </p>
                </div>
                <Toggle enabled={motivational} onToggle={() => setMotivational(!motivational)} />
              </div>
            </div>
          </div>

          {/* Section 3: Data & Privacy */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Data & Privacy
            </h3>
            <div className="divide-y divide-slate-100">
              <button className="w-full flex items-center justify-between py-4 first:pt-0 text-sm font-medium text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer">
                <span>Export Data</span>
                <span className="text-slate-300">→</span>
              </button>
              <button className="w-full flex items-center justify-between py-4 text-sm font-medium text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer">
                <span>Reset Demo Data</span>
                <span className="text-slate-300">→</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-between py-4 last:pb-0 text-sm font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                <span>Delete All Data</span>
                <span className="text-red-300">→</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Your financial data stays on your device.
            </p>
          </div>

          {/* App Version */}
          <p className="text-center text-xs text-slate-300 pb-2">v1.0.0</p>
        </div>
      </main>

      {/* Modals */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={(updated) => setProfile(updated)}
        />
      )}
      {showDeleteModal && (
        <DeleteConfirmModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {}}
        />
      )}
    </>
  )
}
