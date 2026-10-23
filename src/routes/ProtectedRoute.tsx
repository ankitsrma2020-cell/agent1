import { useEffect, type ReactNode } from 'react'
import { getAuthToken } from '../redux/auth/storage.ts'

function ProtectedRoute({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!getAuthToken()) {
      window.location.replace('/login')
    }
  }, [])

  return getAuthToken() ? children : null
}

export default ProtectedRoute
