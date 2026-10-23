import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import Signup from './pages/Signup.tsx'
import Login from './pages/Login.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Users from './pages/Users.tsx'
import Activity from './pages/Activity.tsx'
import Leaderboard from './pages/Leaderboard.tsx'
import Sessions from './pages/Sessions.tsx'
import { restoreSessionRequested } from './redux/slices/signupSlice.ts'
import { getAuthToken } from './redux/auth/storage.ts'
import type { AppDispatch } from './redux/types/index.ts'

function App() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (getAuthToken()) dispatch(restoreSessionRequested())
  }, [dispatch])

  if (window.location.pathname === '/dashboard') return <Dashboard />
  if (window.location.pathname === '/users') return <Users />
 rn window.location.pathname === '/signup' ? <Signup /> : <Login />
}

export default App
