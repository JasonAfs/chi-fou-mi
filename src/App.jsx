import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'
import { AuthProvider } from './contexts/AuthContext'
import { MatchProvider } from './contexts/MatchContext'
import backgroundImage from './assets/bg-chifoumi2.webp'

function App() {
  return (
    <AuthProvider>
      <MatchProvider>
        <div 
          style={{ 
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(143, 93, 132, 0.5)), url(${backgroundImage})`
          }} 
          className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
        >
          <RouterProvider router={router} />
        </div>
      </MatchProvider>
    </AuthProvider>
  )
}

export default App