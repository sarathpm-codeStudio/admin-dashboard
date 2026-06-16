import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AuthLoadingScreen } from '@/components/ui/AuthLoadingScreen'

export function PublicRoute() {
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const user = useAuthStore((state) => state.user)

  if (isInitializing) {
    return <AuthLoadingScreen />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
