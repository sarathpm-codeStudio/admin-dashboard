import { supabase } from '@/config/supabase'
import type { AdminNotification, NotificationRow } from '@/types/notification'

const mapRow = (row: NotificationRow): AdminNotification => ({
  id: row.id,
  type: row.type,
  title: row.title,
  body: row.body,
  data: row.data,
  isRead: row.is_read,
  createdAt: row.created_at,
})

/** Local midnight of "yesterday" — the oldest moment we surface notifications from. */
const yesterdayStartISO = (): string => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 1)
  return start.toISOString()
}

export const notificationFunctions = {
  /**
   * Admin notifications (`is_admin = true`) created today or yesterday,
   * newest first.
   */
  getAdminNotifications: async (): Promise<AdminNotification[]> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, user_id, type, title, body, data, is_read, sent_at, created_at, is_admin')
        .eq('is_admin', true)
        .gte('created_at', yesterdayStartISO())
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return (data as NotificationRow[] | null)?.map(mapRow) ?? []
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  /** Mark a single notification as read. */
  markAsRead: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

      if (error) throw new Error(error.message)
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  /** Mark every unread admin notification as read. */
  markAllAsRead: async (): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_admin', true)
        .eq('is_read', false)

      if (error) throw new Error(error.message)
    } catch (error: any) {
      throw new Error(error.message)
    }
  },
}
