import { useState, useEffect, useCallback, useMemo } from 'react'
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

  const isPlayer1 = useMemo(() => {
    if (!currentUserId || !match?.user1?._id) return false
    return String(match.user1._id).trim() === String(currentUserId).trim()
  }, [currentUserId, match?.user1?._id])

  const getCurrentUserId = useCallback(() => {
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log('Token payload:', payload)
      // Assurez-vous que c'est la bonne clé pour l'userId dans le token
      return payload.sub || payload.userId || payload._id
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
      setMatch(prevMatch => {
        // Si le match était déjà marqué comme terminé, on garde cet état
        if (prevMatch?.status === 'finished') {
          return {
            ...matchData,
            status: 'finished',
            winner: prevMatch.winner
          }
        }
        return matchData
      })
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
        // Ne pas mettre à jour si le match est terminé
        if (match?.status === 'finished') break
        console.log('NEW_TURN event - resetting hasPlayedThisTurn')
        setCurrentTurn(event.payload.turnId)
        setHasPlayedThisTurn(false)
        fetchMatch()
        break
      case 'PLAYER1_MOVED':
      case 'PLAYER2_MOVED':
        // Ne pas mettre à jour si le match est terminé
        if (match?.status === 'finished') break
        if (event.type === 'PLAYER1_MOVED' && !isPlayer1) {
          console.log('Player 1 moved, resetting hasPlayedThisTurn for player 2')
          setHasPlayedThisTurn(false)
        } else if (event.type === 'PLAYER2_MOVED' && isPlayer1) {
          console.log('Player 2 moved, resetting hasPlayedThisTurn for player 1')
          setHasPlayedThisTurn(false)
        }
        fetchMatch()
        break
      case 'TURN_ENDED':
        // Ne pas mettre à jour si le match est terminé
        if (match?.status === 'finished') break
        console.log('Turn ended - resetting state for new turn')
        setCurrentTurn(event.payload.newTurnId)
        setHasPlayedThisTurn(false)
        fetchMatch()
        break
      case 'MATCH_ENDED':
        console.log('Match ended event:', event.payload)
        setMatch(prevMatch => ({
          ...prevMatch,
          status: 'finished',
          winner: event.payload.winner === 'draw' ? null : event.payload.winner
        }))
        break
      default:
        break
    }
  }, [fetchMatch, isPlayer1, match?.status])

  useMatchEvents(matchId, token, handleEvent)

  useEffect(() => {
    fetchMatch()
  }, [fetchMatch])

  const handleMove = async (move) => {
    try {
      console.log('handleMove - before:', {
        currentTurn,
        move,
        hasPlayedThisTurn
      })
      
      await playTurn(matchId, currentTurn, move, token)
      setHasPlayedThisTurn(true)
      
      console.log('handleMove - after: Move successful')
    } catch (err) {
      console.error('handleMove error:', err)
      setError(err.message)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  if (!match) return <div className="min-h-screen flex items-center justify-center">Match not found</div>

  console.log('Debug match:', {
    currentUserId,
    user1Id: match.user1._id,
    user2Id: match.user2?._id,
    isPlayer1
  })

  const currentPlayer = isPlayer1 ? match.user1 : match.user2
  const opponent = isPlayer1 ? match.user2 : match.user1

  const currentTurnData = match.turns[currentTurn - 1] || {}
  
  const getGameStatus = () => {
    console.log('getGameStatus - match:', match.status, 'winner:', match.winner)
    if (!match.user2) return "En attente d'un adversaire..."
    if (match.status === 'finished') {
      if (match.winner === null || match.winner === 'draw') return "Match nul !"
      return `${match.winner?.username || match.winner} a gagné la partie !`
    }
    if (!currentTurnData) return "Début d'un nouveau tour..."
    
    console.log('Debug turn status:', {
      isPlayer1,
      currentTurnData,
      user1Move: currentTurnData.user1,
      user2Move: currentTurnData.user2
    })
    
    const player1HasPlayed = Boolean(currentTurnData.user1)
    const player2HasPlayed = Boolean(currentTurnData.user2)

    if (isPlayer1) {
      if (!player1HasPlayed) {
        return "C'est votre tour - Jouez votre coup !"
      } else if (!player2HasPlayed) {
        return "En attente du coup de l'adversaire..."
      }
    } else {
      if (!player1HasPlayed) {
        return "En attente que le joueur 1 joue son coup..."
      } else if (!player2HasPlayed) {
        return "C'est votre tour - Jouez votre coup !"
      }
    }
    
    return "Tour terminé"
  }

  const canPlay = () => {
    // Vérifions d'abord si le match est terminé
    if (match.status === 'finished') {
      console.log('canPlay: false - match is finished')
      return false
    }
    
    if (!match.user2) {
      console.log('canPlay: false - no player2')
      return false
    }

    const currentTurnData = match.turns[currentTurn - 1] || {}
    
    console.log('canPlay debug:', {
      isPlayer1,
      currentTurn,
      currentTurnData,
      hasPlayedThisTurn,
      matchStatus: match.status
    })
    
    if (isPlayer1) {
      const canPlay = !currentTurnData.user1 && !hasPlayedThisTurn
      console.log('Player 1 canPlay:', canPlay)
      return canPlay
    }
    
    const canPlay = currentTurnData.user1 && !currentTurnData.user2 && !hasPlayedThisTurn
    console.log('Player 2 canPlay:', canPlay)
    return canPlay
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="text-xl font-bold">
            {currentPlayer?.username} vs {opponent?.username || "En attente d'un adversaire..."}
          </div>
          <button
            onClick={() => navigate('/game')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Retour aux parties
          </button>
        </div>

        {match.status === 'finished' ? (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">
              {match.winner === null || match.winner === 'draw' 
                ? "Match nul !" 
                : `${match.winner?.username || match.winner} a gagné la partie !`}
            </h2>
            <button
              onClick={() => navigate('/game')}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Jouer à nouveau
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
                    disabled={!canPlay()}
                    className={`bg-blue-500 text-white px-6 py-2 rounded capitalize
                      ${canPlay() ? 'hover:bg-blue-600' : 'opacity-50 cursor-not-allowed'}`}
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