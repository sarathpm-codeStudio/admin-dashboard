import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page">
      <p className="text-sm text-nav">Loading…</p>
    </div>
  )
}

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
