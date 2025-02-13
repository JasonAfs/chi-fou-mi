import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import StyledButton from '../components/buttons/StyledButton'

function Home() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white/30 backdrop-blur-sm p-12 rounded-2xl shadow-xl">
        <h1 className="text-6xl font-bold mb-12 text-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          CHI-FOU-MI
        </h1>
        
        <div className="flex flex-col items-center gap-6">
          {!token ? (
            <>
              <Link to="/login">
                <StyledButton>LOGIN</StyledButton>
              </Link>
              <Link to="/register">
                <StyledButton>REGISTER</StyledButton>
              </Link>
            </>
          ) : (
            <>
              <StyledButton onClick={() => navigate('/game')}>
                PLAY GAME
              </StyledButton>
              <StyledButton 
                onClick={logout}
                className="red"
              >
                LOGOUT
              </StyledButton>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home 