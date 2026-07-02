import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/store/authStore'

// Read the user id on every call so it reflects the current admin.
const getCurrentUserId = () => useAuthStore.getState().user?.id

// One row per user in user_presence: whether they're currently active and when
// they were last seen. `is_online` is the user's own declared state; readers
// still treat it as offline once `last_seen` goes stale (see PRESENCE_STALE_MS).
export interface UserPresence {
  user_id: string
  is_online: boolean
  last_seen: string
  platform: string | null
  updated_at: string
}

// This is the web client.
const PLATFORM = 'web'

// Upsert my presence row. Called on enter (online), on a heartbeat (keeps
// last_seen fresh), and on leave/hide/unload (offline).
const writePresence = async (isOnline: boolean): Promise<void> => {
  try {
    const userId = getCurrentUserId()
    if (!userId) return

    const now = new Date().toISOString()
    const { error } = await supabase.from('user_presence').upsert(
      {
        user_id: userId,
        is_online: isOnline,
        last_seen: now,
        platform: PLATFORM,
        updated_at: now,
      },
      { onConflict: 'user_id' },
    )

    if (error) throw new Error(error.message)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const presenceFunctions = {
  // Entered the chat module — mark myself active.
  goOnline: () => writePresence(true),
  // Still here — refresh last_seen so I don't look stale.
  heartbeat: () => writePresence(true),
  // Left the chat module / closed the tab — mark myself away.
  goOffline: () => writePresence(false),

  // Current presence row for a given user (the peer in a DIRECT room). Null
  // when that user has never registered any presence.
  getPresence: async (userId: string): Promise<UserPresence | null> => {
    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('user_id, is_online, last_seen, platform, updated_at')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw new Error(error.message)
      return (data as UserPresence) ?? null
    } catch (error: any) {
      throw new Error(error.message)
    }
  },
}
