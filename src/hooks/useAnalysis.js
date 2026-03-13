import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { watchAnalysis } from "../services/analysisService"

export function useAnalysis() {
  const { currentUser } = useAuth()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setAnalysis(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = watchAnalysis(currentUser.uid, (data) => {
      setAnalysis(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  return { analysis, loading }
}
