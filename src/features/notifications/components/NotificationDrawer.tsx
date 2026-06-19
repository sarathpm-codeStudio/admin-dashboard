import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  BellOff,
  CheckCheck,
  Loader2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Header2, Paragraph } from '@/components/ui/Typography'
import { useNotificationSoundStore } from '@/store/notificationSoundStore'
import type { AdminNotification } from '@/types/notification'
import { cn } from '@/utils/cn'
import {
  useGetNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '../hooks/useNotifications'
import { resolveNotificationHref } from '../utils/notificationTarget'

type NotificationDrawerProps = {
  open: boolean
  onClose: () => void
}

/** Is the timestamp within today's local calendar day? */
const isToday = (iso: string | null): boolean => {
  if (!iso) return false
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return new Date(iso).getTime() >= start.getTime()
}

/**
 * Today's items show a coarse relative time ("11 min ago"); older items show
 * the calendar date ("6/18/2026").
 */
const formatStamp = (iso: string | null): string => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  if (isToday(iso)) {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins} min ago`
    return `${Math.floor(mins / 60)} hr ago`
  }
  return date.toLocaleDateString('en-US')
}

function NotificationItem({
  notification,
  onSelect,
}: {
  notification: AdminNotification
  onSelect: (notification: AdminNotification) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className={cn(
        'flex w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-input/60',
        !notification.isRead && 'bg-primary-50/40',
      )}
    >
      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-input text-ink-muted">
        <Bell className="size-[18px]" aria-hidden />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[15px] font-semibold text-ink-heading">
            {notification.title}
          </span>
          {!notification.isRead && (
            <span className="size-2 shrink-0 rounded-full bg-primary-500" />
          )}
        </span>
        <span className="mt-1 block text-sm leading-snug text-ink-muted">
          {notification.body}
        </span>
        <span className="mt-2 block text-xs text-nav">
          {formatStamp(notification.createdAt)}
        </span>
      </span>
    </button>
  )
}

function Section({
  label,
  items,
  onSelect,
}: {
  label: string
  items: AdminNotification[]
  onSelect: (notification: AdminNotification) => void
}) {
  if (items.length === 0) return null
  return (
    <div>
      <p className="bg-surface-input px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-ink-muted">
        {label}
      </p>
      <div className="divide-y divide-[#eef0f3]">
        {items.map((n) => (
          <NotificationItem key={n.id} notification={n} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const { data: notifications = [], isLoading, isError } = useGetNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const muted = useNotificationSoundStore((s) => s.muted)
  const toggleMuted = useNotificationSoundStore((s) => s.toggleMuted)
  const navigate = useNavigate()

  const handleSelect = (notification: AdminNotification) => {
    if (!notification.isRead) markRead.mutate(notification.id)
    const href = resolveNotificationHref(notification)
    if (href) {
      onClose()
      navigate(href)
    }
  }

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const today = notifications.filter((n) => isToday(n.createdAt))
  const yesterday = notifications.filter((n) => !isToday(n.createdAt))
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Close notifications"
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface-card shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4">
              <Header2 size="section">Notifications</Header2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={muted ? 'Unmute notification sound' : 'Mute notification sound'}
                  aria-pressed={muted}
                  onClick={toggleMuted}
                  className={cn(
                    'rounded-nav p-1.5 transition-colors hover:bg-surface-input',
                    muted ? 'text-[#ba1a1a]' : 'text-nav hover:text-ink-heading',
                  )}
                >
                  {muted ? (
                    <VolumeX className="size-[18px]" aria-hidden />
                  ) : (
                    <Volume2 className="size-[18px]" aria-hidden />
                  )}
                </button>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllRead.mutate()}
                    disabled={markAllRead.isPending}
                    className="flex items-center gap-1.5 rounded-nav px-2 py-1.5 text-sm font-medium text-nav transition-colors hover:bg-surface-input hover:text-ink-heading disabled:opacity-60"
                  >
                    <CheckCheck className="size-4" aria-hidden />
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="rounded-nav p-1.5 text-nav transition-colors hover:bg-surface-input hover:text-ink-heading"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex h-full items-center justify-center text-nav">
                  <Loader2 className="size-6 animate-spin" aria-hidden />
                </div>
              ) : isError ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <Paragraph variant="muted">
                    Couldn&apos;t load notifications. Please try again.
                  </Paragraph>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center text-nav">
                  <BellOff className="mb-3 size-10 opacity-50" aria-hidden />
                  <Paragraph variant="muted">No notifications yet</Paragraph>
                  <p className="mt-1 text-xs text-nav">
                    You&apos;re all caught up for today.
                  </p>
                </div>
              ) : (
                <div>
                  <Section
                    label="Today"
                    items={today}
                    onSelect={handleSelect}
                  />
                  <Section
                    label="Yesterday"
                    items={yesterday}
                    onSelect={handleSelect}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#e2e8f0] p-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-card bg-surface-input py-3 text-sm font-semibold text-ink-heading transition-colors hover:bg-[#e7eaee]"
              >
                View All Notifications
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
