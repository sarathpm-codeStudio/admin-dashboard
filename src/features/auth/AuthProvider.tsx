import { useEffect, type ReactNode } from 'react'
import { resolveAuthUser } from '@/api/auth/auth.api'
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

      try {
        const user = await resolveAuthUser()
        if (!cancelled) setUser(user)
      } catch {
        if (!cancelled) setUser(null)
      }
    }

    async function bootstrap() {
      if (!isSupabaseConfigured()) {
        setUser(null)
        setInitializing(false)
        return
      }

      try {
        const { data } = await supabase.auth.getSession()
        if (cancelled) return
        await syncAuth(data.session !== null)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setInitializing(false)
      }
    }

    void bootstrap()

    if (!isSupabaseConfigured()) {
      return () => {
        cancelled = true
      }
    }

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
