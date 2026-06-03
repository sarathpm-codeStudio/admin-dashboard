import { useEffect, type ReactNode } from 'react'
import { resolveAuthUser } from '@/api/auth.api'
import { isSupabaseConfigured } from '@/config/auth'
import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/store/authStore'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser)
  const setInitializing = useAuthStore((state) => state.setInitializing)

  useEffect(() => {
    let cancelled = false

    async function syncAuth(hasSession: boolean) {
      if (!isSupabaseConfigured() || !hasSession) {
        if (!cancelled) setUser(null)
        return
      }

      const user = await resolveAuthUser()
      if (!cancelled) setUser(user)
    }

    async function bootstrap() {
      if (!isSupabaseConfigured()) {
        setUser(null)
        setInitializing(false)
        return
      }

      const { data } = await supabase.auth.getSession()
      if (cancelled) return

      await syncAuth(data.session !== null)
      if (!cancelled) setInitializing(false)
    }

    void bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      void syncAuth(session !== null)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [setUser, setInitializing])

  return children
}
