import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page">
      <p className="text-sm text-nav">Loading…</p>
    </div>
  )
}

export function NotFoundRedirect() {
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const user = useAuthStore((state) => state.user)

  if (isInitializing) {
    return <AuthLoadingScreen />
  }

  return <Navigate to={user ? '/' : '/login'} replace />
}
