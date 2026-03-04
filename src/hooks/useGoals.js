import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { watchGoals } from "../services/goalsService"

export function useGoals() {
  const { currentUser } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentUser) {
      setGoals([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = watchGoals(currentUser.uid, (data) => {
      setGoals(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  return { goals, loading, error }
}
