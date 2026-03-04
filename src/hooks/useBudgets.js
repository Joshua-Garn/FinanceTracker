import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { watchBudgets } from "../services/budgetsService"

export function useBudgets() {
  const { currentUser } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentUser) {
      setBudgets([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = watchBudgets(currentUser.uid, (data) => {
      setBudgets(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  return { budgets, loading, error }
}
