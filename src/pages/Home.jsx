import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Home() {
  const { token, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Welcome to Chifoumi</h1>
      <div className="space-x-4">
        {!token ? (
          <>
            <Link
              to="/login"
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/game"
              className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600"
            >
              Play Game
            </Link>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Home 