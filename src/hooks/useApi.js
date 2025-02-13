import { useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_URL } from '../config/api'

export const useApi = () => {
  const { token, logout } = useAuth()

  const authFetch = useCallback(async (endpoint, options = {}) => {
    if (!token) {
      throw new Error('No token available')
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (response.status === 401) {
        logout()
        throw new Error('Session expired')
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'API request failed')
      }

      return response.json()
    } catch (error) {
      if (error.message === 'Session expired') {
        throw error
      }
      throw new Error(`API Error: ${error.message}`)
    }
  }, [token, logout])

  return { authFetch }
} 