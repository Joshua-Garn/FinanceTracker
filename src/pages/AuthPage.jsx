import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function getErrorMessage(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    case "auth/weak-password":
      return "Password should be at least 6 characters."
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password."
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later."
    default:
      return "Something went wrong. Please try again."
  }
}

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, signup } = useAuth()

  const isSignUp = location.pathname === "/signup"
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    if (isSignUp && password !== confirmPassword) {
      return setError("Passwords do not match.")
    }

    try {
      setSubmitting(true)
      if (isSignUp) {
        await signup(email, password, name)
      } else {
        await login(email, password)
      }
      navigate("/", { replace: true })
    } catch (err) {
      setError(getErrorMessage(err.code))
    } finally {
      setSubmitting(false)
    }
  }

  function toggleMode() {
    setName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setError("")
    navigate(isSignUp ? "/login" : "/signup", { replace: true })
  }

  return (
    <>
      <style>{`
        @keyframes authFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex h-screen bg-white">
        {/* Left Side – Auth Form */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center px-8 sm:px-16 lg:px-20">
          <div className="w-full max-w-sm mx-auto">
            {/* Logo */}
            <h1 className="text-xl font-bold tracking-tight mb-10">
              <span className="text-emerald-500">Finance</span>
              <span className="text-slate-900">Tracker</span>
            </h1>

            {/* Title & Helper */}
            <div
              key={isSignUp ? "signup" : "signin"}
              style={{ animation: "authFadeIn 0.25s ease-out" }}
            >
              <h2 className="text-2xl font-bold text-slate-900">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-sm text-slate-500 mt-1.5 mb-8">
                {isSignUp
                  ? "Start building smarter financial habits."
                  : "Sign in to continue managing your finances."}
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                  />
                </div>

                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none text-white text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow mt-2"
                >
                  {submitting
                    ? "Please wait..."
                    : isSignUp
                      ? "Create Account"
                      : "Sign In"}
                </button>
              </form>

              {/* Toggle */}
              <p className="text-sm text-slate-500 text-center mt-6">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button
                  onClick={toggleMode}
                  className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side – Brand Panel */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900" />

          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-emerald-400 blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-sky-400 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-emerald-300 blur-2xl" />
          </div>

          {/* Brand Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full px-16 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
              <span className="text-emerald-400">Finance</span>Tracker
            </h1>
            <p className="text-lg text-slate-300 font-medium max-w-xs leading-relaxed">
              Understand your money in 20 seconds.
            </p>
            <div className="mt-10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-400 font-medium">Calm. Clear. Intelligent.</span>
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
