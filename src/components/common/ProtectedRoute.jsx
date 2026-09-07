import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { selectAuth } from '../../store/slices/authSlice'

export default function ProtectedRoute() {
  const { isLoggedIn } = useSelector(selectAuth)
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return <Outlet />
}

export function PublicOnlyRoute() {
  const { isLoggedIn } = useSelector(selectAuth)
  if (isLoggedIn) return <Navigate to="/app" replace />
  return <Outlet />
}
