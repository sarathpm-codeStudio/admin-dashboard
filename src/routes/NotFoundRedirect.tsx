import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AuthLoadingScreen } from '@/components/ui/AuthLoadingScreen'

export function NotFoundRedirect() {
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const user = useAuthStore((state) => state.user)

  if (isInitializing) {
    return <AuthLoadingScreen />
  }

  return <Navigate to={user ? '/' : '/login'} replace />
}
