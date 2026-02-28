import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function PrivateRoute() {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
