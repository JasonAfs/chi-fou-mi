import { createBrowserRouter } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Game from '../pages/Game'
import Home from '../pages/Home'
import ProtectedRoute from '../components/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/game',
    element: (
      <ProtectedRoute>
        <Game />
      </ProtectedRoute>
    )
  }
]) 