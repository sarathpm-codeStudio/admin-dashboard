import { create } from 'zustand'

const STORAGE_KEY = 'notifications-muted'

const readInitial = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(STORAGE_KEY) === '1'
}

type NotificationSoundState = {
  muted: boolean
  toggleMuted: () => void
}

/** Whether the notification "ding" is muted. Persisted across sessions. */
export const useNotificationSoundStore = create<NotificationSoundState>(
  (set, get) => ({
    muted: readInitial(),
    toggleMuted: () => {
      const next = !get().muted
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      }
      set({ muted: next })
    },
  }),
)
