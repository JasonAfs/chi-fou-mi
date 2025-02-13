import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatch } from '../contexts/MatchContext'
import StyledButton from '../components/buttons/StyledButton'

function Game() {
  const { matches, loading, error, fetchMatches, startNewMatch } = useMatch()
  const navigate = useNavigate()

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  const handlePlayClick = async () => {
    try {
      const match = await startNewMatch()
      navigate(`/match/${match._id}`)
    } catch (err) {
      console.error('Failed to start match:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Chifoumi Game</h1>
          <StyledButton onClick={handlePlayClick}>
            PLAY 
          </StyledButton>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Matches</h2>
          {matches.length === 0 ? (
            <p className="text-gray-500">No matches found. Start a new game!</p>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <div
                  key={match._id}
                  className="border rounded p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {match.user1.username} vs {match.user2?.username || 'Waiting for opponent'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {match.winner ? 'Completed' : 'In Progress'}
                    </p>
                  </div>
                  {!match.winner && (
                    <StyledButton onClick={() => navigate(`/match/${match._id}`)}>
                      CONTINUE
                    </StyledButton>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Game 