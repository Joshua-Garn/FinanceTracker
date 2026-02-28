import { Routes, Route, Outlet, Navigate } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import PrivateRoute from "./components/PrivateRoute"
import DashboardPage from "./pages/DashboardPage"
import TransactionsPage from "./pages/TransactionsPage"
import BudgetPage from "./pages/BudgetPage"
import GoalsPage from "./pages/GoalsPage"
import SettingsPage from "./pages/SettingsPage"
import AnalysisPage from "./pages/AnalysisPage"
import AuthPage from "./pages/AuthPage"

function AppShell() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <Outlet />
    </div>
  )
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/auth" element={<Navigate to="/login" replace />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
