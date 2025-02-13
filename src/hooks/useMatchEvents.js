import { useEffect, useCallback } from 'react'
import { API_URL } from '../config/api'

export const useMatchEvents = (matchId, token, onEvent) => {
  const subscribe = useCallback(() => {
    if (!matchId || !token) return

    let abortController = new AbortController()

    async function startSSE() {
      try {
        const response = await fetch(`${API_URL}/matches/${matchId}/subscribe`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/event-stream'
          },
          signal: abortController.signal
        })

        if (!response.ok) {
          throw new Error('SSE connection failed')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          
          // Garder la dernière ligne incomplète dans le buffer
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                console.log('SSE Event:', data)
                onEvent(data)
              } catch (error) {
                console.error('Error parsing SSE data:', error)
              }
            }
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') return
        console.error('SSE Error:', error)
        // Tentative de reconnexion après un délai
        setTimeout(startSSE, 5000)
      }
    }

    startSSE()

    return () => {
      abortController.abort()
    }
  }, [matchId, token, onEvent])

  useEffect(() => {
    const cleanup = subscribe()
    return () => {
      if (cleanup) cleanup()
    }
  }, [subscribe])
} 