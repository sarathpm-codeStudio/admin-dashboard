import { create } from 'zustand'
import type { AuthUser } from '@/types/auth'

type AuthState = {
  user: AuthUser | null
  isAuthenticated: boolean
  isInitializing: boolean
  setUser: (user: AuthUser | null) => void
  setInitializing: (value: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
    }),
  setInitializing: (isInitializing) => set({ isInitializing }),
  reset: () =>
    set({
      user: null,
      isAuthenticated: false,
      isInitializing: false,
    }),
}))
