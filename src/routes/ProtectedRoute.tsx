import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isSupabaseConfigured } from '@/config/auth'
import { useAuthStore } from '@/store/authStore'

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page">
      <p className="text-sm text-nav">Loading…</p>
    </div>
  )
}

export function ProtectedRoute() {
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (isInitializing) {
    return <AuthLoadingScreen />
  }

  if (!isSupabaseConfigured() || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
