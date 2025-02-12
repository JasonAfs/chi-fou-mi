import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'
import backgroundImage from './assets/bg-chifoumi2.webp'

function App() {
  return (
    <div 
      style={{ 
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(143, 93, 132, 0.5)), url(${backgroundImage})`
      }} 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
    >
      <RouterProvider router={router} />
    </div>
  )
}

export default App