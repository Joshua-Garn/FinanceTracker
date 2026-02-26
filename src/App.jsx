import { Routes, Route } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import DashboardPage from "./pages/DashboardPage"
import TransactionsPage from "./pages/TransactionsPage"
import BudgetPage from "./pages/BudgetPage"
import GoalsPage from "./pages/GoalsPage"

function App() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/goals" element={<GoalsPage />} />
      </Routes>
    </div>
  )
}

export default App
