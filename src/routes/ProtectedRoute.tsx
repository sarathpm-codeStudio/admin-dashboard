import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isSupabaseConfigured } from '@/config/auth'
import { useAuthStore } from '@/store/authStore'
import { AuthLoadingScreen } from '@/components/ui/AuthLoadingScreen'

export function ProtectedRoute() {
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (isInitializing) {
    return <AuthLoadingScreen />
  }

  if (!isSupabaseConfigured()) {
    return <Outlet />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
