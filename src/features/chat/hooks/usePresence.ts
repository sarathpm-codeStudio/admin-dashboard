import { useEffect, useState } from 'react'
import { presenceFunctions, type UserPresence } from '@/api/chat/presence.api'
import { supabase } from '@/config/supabase'

// How often to refresh my own last_seen while I'm in the chat module.
const PRESENCE_HEARTBEAT_MS = 30_000
// A user counts as online only if their last heartbeat is newer than this, so a
// crashed/closed tab that never wrote "offline" still expires instead of
// showing a permanent green dot. Kept > heartbeat interval to avoid flicker.
const PRESENCE_STALE_MS = 60_000
// How often a viewer re-checks staleness so a peer flips to "last seen …" once
// their heartbeat stops (no DB event fires when a client simply goes away).
const PRESENCE_TICK_MS = 15_000

/**
 * Broadcast MY presence for as long as this hook is mounted. Mount it in the
 * chat view so "online" means "currently in the chat module": marks me online
 * on mount, heartbeats every 30s, and marks me offline on unmount, tab-hide, or
 * page unload. Pass `enabled=false` (e.g. no user id yet) to stay dormant.
 */
export const usePresenceHeartbeat = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return

    void presenceFunctions.goOnline()
    const beat = setInterval(() => {
      void presenceFunctions.heartbeat()
    }, PRESENCE_HEARTBEAT_MS)

    // Tab hidden → away; tab visible again → back online.
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') void presenceFunctions.goOffline()
      else void presenceFunctions.goOnline()
    }
    // Best-effort "offline" on tab close; the staleness window is the real
    // safety net when this doesn't get a chance to run.
    const onUnload = () => {
      void presenceFunctions.goOffline()
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('beforeunload', onUnload)

    return () => {
      clearInterval(beat)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('beforeunload', onUnload)
      void presenceFunctions.goOffline()
    }
  }, [enabled])
}

/**
 * Live presence of a single peer (the other side of a DIRECT room). Fetches the
 * current row, subscribes to its realtime changes, and re-evaluates staleness on
 * a timer so the peer flips to offline when their heartbeat stops. Returns
 * whether they're online now and their last_seen timestamp for the "last seen …"
 * label.
 */
export const usePeerPresence = (peerId?: string | null) => {
  const [row, setRow] = useState<UserPresence | null>(null)
  // Bump on a timer purely to re-run the staleness check below.
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!peerId) {
      setRow(null)
      return
    }

    let active = true
    void presenceFunctions.getPresence(peerId).then((r) => {
      if (active) setRow(r)
    })

    const channel = supabase
      .channel(`user-presence-${peerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=eq.${peerId}`,
        },
        (payload) => {
          if (active) setRow(payload.new as UserPresence)
        },
      )
      .subscribe()

    return () => {
      active = false
      void supabase.removeChannel(channel)
    }
  }, [peerId])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), PRESENCE_TICK_MS)
    return () => clearInterval(id)
  }, [])

  const isOnline =
    !!row?.is_online &&
    Date.now() - new Date(row.last_seen).getTime() < PRESENCE_STALE_MS

  return { isOnline, lastSeen: row?.last_seen ?? null }
}
