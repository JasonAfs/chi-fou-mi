import { API_URL } from '../config/api'

export const login = async (username, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Invalid credentials')
  }

  return response.json()
}

export const register = async (username, password) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Registration failed')
  }

  return response.json()
} 