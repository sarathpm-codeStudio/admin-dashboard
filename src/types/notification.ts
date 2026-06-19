export type NotificationType =
  | 'FRIEND_JOINED'
  | 'FRIEND_ENROLLED'
  | 'COURSE_UPDATE'
  | 'EXAM_REMINDER'
  | 'BADGE_UNLOCKED'
  | 'STREAK_REMINDER'
  | 'COINS_EARNED'
  | 'COURSE'
  | 'ACCOUNT'

/** Raw row shape as stored in `public.notifications`. */
export type NotificationRow = {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown> | null
  is_read: boolean
  sent_at: string | null
  created_at: string | null
  is_admin: boolean
}

/** Notification as consumed by the UI. */
export type AdminNotification = {
  id: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown> | null
  isRead: boolean
  createdAt: string | null
}

/** Day bucket a notification falls into. We only ever surface these two. */
export type NotificationBucket = 'today' | 'yesterday'
