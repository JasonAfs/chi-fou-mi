import { createContext, useContext, useState, useCallback } from 'react'
import { createMatch, getMatches } from '../services/matchService'
import { useAuth } from './AuthContext'

const MatchContext = createContext(null)

export const MatchProvider = ({ children }) => {
  const [matches, setMatches] = useState([])
  const [currentMatch, setCurrentMatch] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { token } = useAuth()

  const fetchMatches = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const matchesData = await getMatches(token)
      setMatches(matchesData)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  const startNewMatch = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const match = await createMatch(token)
      setCurrentMatch(match)
      setError(null)
      return match
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [token])

  const value = {
    matches,
    currentMatch,
    loading,
    error,
    fetchMatches,
    startNewMatch
  }

  return (
    <MatchContext.Provider value={value}>
      {children}
    </MatchContext.Provider>
  )
}

export const useMatch = () => {
  const context = useContext(MatchContext)
  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider')
  }
  return context
} 