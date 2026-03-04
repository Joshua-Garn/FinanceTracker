import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { watchTransactions } from "../services/transactionsService"

export function useTransactions() {
  const { currentUser } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentUser) {
      setTransactions([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = watchTransactions(currentUser.uid, (data) => {
      setTransactions(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  return { transactions, loading, error }
}
