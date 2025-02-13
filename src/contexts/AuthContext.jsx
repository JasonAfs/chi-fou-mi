import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const login = useCallback((newToken) => {
    setToken(newToken)
    localStorage.setItem('token', newToken)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    localStorage.removeItem('token')
  }, [])

  const value = {
    token,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 