import { API_URL } from '../config/api'

export const createMatch = async (token) => {
  const response = await fetch(`${API_URL}/matches`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.match || 'Failed to create match')
  }

  return response.json()
}

export const getMatches = async (token) => {
  const response = await fetch(`${API_URL}/matches`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch matches')
  }

  return response.json()
} 