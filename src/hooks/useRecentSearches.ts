import { useCallback, useState } from 'react'
import { useAuthStore } from '@/store/authStore'

const MAX_RECENT = 5

// Keyed per user so a second admin logging in on the same machine never sees
// the previous one's search history.
const storageKey = (userId?: string) => `recent-searches:${userId ?? 'anon'}`

function read(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === 'string') : []
  } catch {
    return []
  }
}

function write(key: string, terms: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(terms))
  } catch {
    // Private mode / quota — recents are a convenience, never block on them.
  }
}

export function useRecentSearches() {
  const userId = useAuthStore((state) => state.user?.id)
  const key = storageKey(userId)

  const [recents, setRecents] = useState<string[]>(() => read(key))

  const save = useCallback(
    (next: string[]) => {
      setRecents(next)
      write(key, next)
    },
    [key],
  )

  const addRecent = useCallback(
    (rawTerm: string) => {
      const term = rawTerm.trim()
      if (!term) return
      // Re-searching an existing term moves it to the top rather than duplicating it.
      const deduped = read(key).filter((t) => t.toLowerCase() !== term.toLowerCase())
      save([term, ...deduped].slice(0, MAX_RECENT))
    },
    [key, save],
  )

  const removeRecent = useCallback(
    (term: string) => {
      save(read(key).filter((t) => t !== term))
    },
    [key, save],
  )

  const clearRecents = useCallback(() => save([]), [save])

  return { recents, addRecent, removeRecent, clearRecents }
}
