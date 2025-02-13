import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useMatchEvents } from '../hooks/useMatchEvents'
import { getMatch, playTurn } from '../services/matchService'

const MOVES = ['rock', 'paper', 'scissors']

function Match() {
  const { id: matchId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [currentTurn, setCurrentTurn] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [hasPlayedThisTurn, setHasPlayedThisTurn] = useState(false)

  const getCurrentUserId = useCallback(() => {
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.userId
    } catch (err) {
      console.error('Error decoding token:', err)
      return null
    }
  }, [token])

  useEffect(() => {
    setCurrentUserId(getCurrentUserId())
  }, [getCurrentUserId])

  const fetchMatch = useCallback(async () => {
    try {
      const matchData = await getMatch(matchId, token)
      setMatch(matchData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [matchId, token])

  const handleEvent = useCallback((event) => {
    console.log('Received event:', event)
    switch (event.type) {
      case 'PLAYER1_JOIN':
      case 'PLAYER2_JOIN':
        fetchMatch()
        break
      case 'NEW_TURN':
        setCurrentTurn(event.payload.turnId)
        setHasPlayedThisTurn(false)
        fetchMatch()
        break
      case 'PLAYER1_MOVED':
      case 'PLAYER2_MOVED':
        fetchMatch()
        break
      case 'TURN_ENDED':
        setCurrentTurn(event.payload.newTurnId)
        setHasPlayedThisTurn(false)
        fetchMatch()
        break
      case 'MATCH_ENDED':
        fetchMatch()
        break
      default:
        break
    }
  }, [fetchMatch])

  useMatchEvents(matchId, token, handleEvent)

  useEffect(() => {
    fetchMatch()
  }, [fetchMatch])

  const handleMove = async (move) => {
    try {
      await playTurn(matchId, currentTurn, move, token)
      setHasPlayedThisTurn(true)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  if (!match) return <div className="min-h-screen flex items-center justify-center">Match not found</div>

  const isPlayer1 = match.user1._id === currentUserId
  const currentPlayer = isPlayer1 ? match.user1 : match.user2
  const opponent = isPlayer1 ? match.user2 : match.user1

  const currentTurnData = match.turns[currentTurn - 1] || {}
  
  const canPlay = match.user2 && !hasPlayedThisTurn && (
    (isPlayer1 && !currentTurnData.user1) ||
    (!isPlayer1 && !currentTurnData.user2)
  )

  const getGameStatus = () => {
    if (!match.user2) return "Waiting for opponent to join..."
    if (match.winner) {
      if (match.winner === 'draw') return "It's a draw!"
      return `${match.winner.username || match.winner} won the game!`
    }
    if (!currentTurnData) return "Starting new turn..."
    
    if (hasPlayedThisTurn) {
      return "Waiting for opponent's move..."
    }
    
    if (isPlayer1) {
      if (!currentTurnData.user1) return "Make your move!"
      return currentTurnData.user2 ? "Turn complete" : "Waiting for opponent..."
    } else {
      if (!currentTurnData.user2) return "Make your move!"
      return currentTurnData.user1 ? "Turn complete" : "Waiting for opponent..."
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="text-xl font-bold">
            {currentPlayer?.username} vs {opponent?.username || 'Waiting for opponent...'}
          </div>
          <button
            onClick={() => navigate('/game')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Games
          </button>
        </div>

        {match.winner ? (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">
              {match.winner === 'draw' ? "It's a draw!" : 
               `${match.winner.username || match.winner} won the game!`}
            </h2>
            <button
              onClick={() => navigate('/game')}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Play Again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {match.turns.map((turn, index) => (
                <div key={index} className="border rounded p-4 text-center">
                  <div className="font-bold mb-2">Turn {index + 1}</div>
                  <div className="space-y-2">
                    <div>{match.user1.username}: {turn.user1 || '?'}</div>
                    <div>{match.user2?.username || 'Waiting...'}: {turn.user2 || '?'}</div>
                    {turn.winner && (
                      <div className="font-bold mt-2">
                        Winner: {turn.winner === 'draw' ? 'Draw' : match[turn.winner].username}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">
                {getGameStatus()}
              </h3>
              <div className="flex justify-center space-x-4">
                {MOVES.map((move) => (
                  <button
                    key={move}
                    onClick={() => handleMove(move)}
                    disabled={!canPlay}
                    className={`bg-blue-500 text-white px-6 py-2 rounded capitalize
                      ${canPlay ? 'hover:bg-blue-600' : 'opacity-50 cursor-not-allowed'}`}
                  >
                    {move}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Match 