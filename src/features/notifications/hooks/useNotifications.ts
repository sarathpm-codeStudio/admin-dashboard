import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { notificationFunctions } from '@/api/notifications/notifications.api'
import { supabase } from '@/config/supabase'
import { useNotificationSoundStore } from '@/store/notificationSoundStore'
import type { AdminNotification } from '@/types/notification'
import { playNotificationSound } from '../utils/notificationSound'

export const NOTIFICATIONS_QUERY_KEY = ['admin-notifications'] as const

export const useGetNotifications = () =>
  useQuery<AdminNotification[]>({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => notificationFunctions.getAdminNotifications(),
    // Notifications age out of the today/yesterday window; refetch on focus
    // keeps the list honest even without a realtime event.
    refetchOnWindowFocus: true,
  })

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationFunctions.markAsRead(id),
    // Optimistically flip the row so the UI reacts instantly on click.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      const previous = queryClient.getQueryData<AdminNotification[]>(
        NOTIFICATIONS_QUERY_KEY,
      )
      queryClient.setQueryData<AdminNotification[]>(
        NOTIFICATIONS_QUERY_KEY,
        (old) =>
          old?.map((n) => (n.id === id ? { ...n, isRead: true } : n)) ?? [],
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous)
      }
    },
  })
}

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationFunctions.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      const previous = queryClient.getQueryData<AdminNotification[]>(
        NOTIFICATIONS_QUERY_KEY,
      )
      queryClient.setQueryData<AdminNotification[]>(
        NOTIFICATIONS_QUERY_KEY,
        (old) => old?.map((n) => ({ ...n, isRead: true })) ?? [],
      )
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous)
      }
    },
  })
}

/**
 * Subscribes to realtime changes on admin notifications. A new INSERT plays a
 * sound and refreshes the list; UPDATEs (e.g. read elsewhere) just refresh.
 * Mount this once, near the top of the app shell.
 */
export const useNotificationRealtime = () => {
  const queryClient = useQueryClient()
  // Avoid double-firing the sound under React 18 StrictMode remounts.
  const mounted = useRef(false)

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true

    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: 'is_admin=eq.true',
        },
        () => {
          if (!useNotificationSoundStore.getState().muted) {
            playNotificationSound()
          }
          void queryClient.invalidateQueries({
            queryKey: NOTIFICATIONS_QUERY_KEY,
          })
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: 'is_admin=eq.true',
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: NOTIFICATIONS_QUERY_KEY,
          })
        },
      )
      .subscribe()

    return () => {
      mounted.current = false
      void supabase.removeChannel(channel)
    }
  }, [queryClient])
}
