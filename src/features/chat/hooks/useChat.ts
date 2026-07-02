import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  chatFunctions,
  MESSAGES_PAGE_SIZE,
  type ChatMessage,
  type ChatMessagePage,
  type ChatRoomSummary,
} from '@/api/chat/chat.api'
import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { decryptMessageSafe } from '@/utils/chatEncryption'

type MessagesInfiniteData = {
  pages: ChatMessagePage[]
  pageParams: unknown[]
}

export const CHAT_ROOMS_QUERY_KEY = ['chat-rooms'] as const
export const chatMessagesQueryKey = (roomId?: string | null) =>
  ['chat-messages', roomId] as const

// All chat rooms the signed-in admin belongs to, ready for the messages list.
export const useGetMyChatRooms = (enabled: boolean = true) =>
  useQuery({
    queryKey: CHAT_ROOMS_QUERY_KEY,
    queryFn: () => chatFunctions.getMyChatRooms(),
    enabled,
  })

// Messages of a single room, paged from newest backwards (WhatsApp-style):
// the first page is the most recent batch; fetch further pages to load older
// history. Disabled until a room is selected.
export const useGetRoomMessages = (roomId?: string | null) =>
  useInfiniteQuery({
    queryKey: chatMessagesQueryKey(roomId),
    queryFn: ({ pageParam }) =>
      chatFunctions.getMessagesPage(roomId as string, {
        before: pageParam,
        limit: MESSAGES_PAGE_SIZE,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!roomId,
  })

// Start (or reopen) a 1:1 conversation with another user, then refresh the list.
export const useStartConversation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (otherUserId: string) =>
      chatFunctions.startConversation(otherUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY })
    },
  })
}

/**
 * Open a conversation with a given user from anywhere (e.g. the "Message"
 * button on a user profile). Reuses the existing 1:1 room if there is one,
 * otherwise creates it, then navigates to the chat page with that room open.
 */
export const useOpenChat = () => {
  const navigate = useNavigate()
  const start = useStartConversation()

  const openChat = (
    userId: string,
    opts?: { onError?: (error: Error) => void },
  ) => {
    start.mutate(userId, {
      onSuccess: ({ roomId }) => navigate('/chats', { state: { roomId } }),
      onError: (error) => opts?.onError?.(error as Error),
    })
  }

  return { openChat, isPending: start.isPending }
}

// Send a message into a room, then refresh that thread and the room list.
export const useSendMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roomId, content }: { roomId: string; content: string }) =>
      chatFunctions.sendMessage(roomId, content),
    // The message lands in the open thread via the realtime INSERT event, so we
    // only refresh the room list here (preview + ordering).
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY })
    },
  })
}

// Clear a room's unread badge and mark the peer's messages seen (blue ticks).
export const useMarkRoomRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roomId: string) => chatFunctions.markRoomRead(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY })
    },
  })
}

/**
 * App-wide chat subscription, mounted once in the shell so the admin keeps
 * receiving messages even when the chat page is closed. Any new message
 * refreshes the room list (preview, ordering, unread badge); a message from a
 * peer is also acknowledged as delivered. Uses its own channel so it can run
 * alongside the per-thread `useChatRealtime`.
 */
export const useChatRoomsRealtime = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('admin-chat-rooms-global')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const incoming = payload.new as ChatMessage
          const myId = useAuthStore.getState().user?.id

          void queryClient.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY })

          // Mark that room's thread stale (without refetching now) so it
          // refetches with the new message next time it's opened — otherwise
          // the cached thread stays "fresh" and the message only shows after a
          // reload. The currently-open room is updated live by useChatRealtime,
          // so we don't force a refetch here.
          if (incoming.room_id) {
            void queryClient.invalidateQueries({
              queryKey: chatMessagesQueryKey(incoming.room_id),
              refetchType: 'none',
            })
          }

          // Only react to messages from the other side, not our own echoes.
          if (!incoming.room_id || incoming.sender_id === myId) return

          void chatFunctions.markRoomDelivered(incoming.room_id)

          // Pop a toast when the admin isn't already on the chat page.
          if (window.location.pathname.startsWith('/chats')) return

          const rooms = queryClient.getQueryData<ChatRoomSummary[]>(
            CHAT_ROOMS_QUERY_KEY,
          )
          const sender =
            rooms?.find((r) => r.id === incoming.room_id)?.peer?.name ?? 'someone'

          useToastStore.getState().show({
            message: `You received new message for ${sender}`,
            variant: 'neutral',
          })
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
        () => {
          void queryClient.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [queryClient])
}

/**
 * Subscribes to realtime changes on chat_messages for a live conversation.
 *
 * INSERT: a new message in the open room is appended straight into the thread
 * cache (instant, no refetch) and the room list refreshes. A message from the
 * peer is also marked DELIVERED so the sender's single tick becomes two.
 *
 * UPDATE: status changes (sent → delivered → seen) flow back so OUR own ticks
 * update live when the other side receives or reads our messages.
 *
 * Mount once in the view.
 */
export const useChatRealtime = (activeRoomId?: string | null) => {
  const queryClient = useQueryClient()
  // Keep the latest active room id without re-subscribing on every change.
  const activeRef = useRef(activeRoomId)
  activeRef.current = activeRoomId

  useEffect(() => {
    const channel = supabase
      .channel('admin-chat-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const incoming = payload.new as ChatMessage
          const roomId = incoming?.room_id
          const myId = useAuthStore.getState().user?.id

          // Always keep the list in sync (preview, order, unread badge).
          void queryClient.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY })

          if (!roomId) return

          // A message from the peer has reached us → acknowledge delivery.
          // (When the room is open, the view marks it seen, which supersedes.)
          if (incoming.sender_id !== myId && roomId !== activeRef.current) {
            void chatFunctions.markRoomDelivered(roomId)
          }

          if (roomId !== activeRef.current) return

          // The realtime payload carries encrypted `content`; decrypt it before
          // it lands in the cache, then append to the newest page of the open
          // thread, skipping duplicates already present in any loaded page.
          void decryptMessageSafe(incoming.content).then((plainContent) => {
            const decrypted: ChatMessage = { ...incoming, content: plainContent }
            queryClient.setQueryData<MessagesInfiniteData>(
              chatMessagesQueryKey(roomId),
              (old) => {
                if (!old || old.pages.length === 0) return old
                const exists = old.pages.some((p) =>
                  p.messages.some((m) => m.id === decrypted.id),
                )
                if (exists) return old
                const [first, ...rest] = old.pages
                if (!first) return old
                return {
                  ...old,
                  pages: [
                    { ...first, messages: [...first.messages, decrypted] },
                    ...rest,
                  ],
                }
              },
            )
          })
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const updated = payload.new as ChatMessage
          const roomId = updated?.room_id

          void queryClient.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY })

          if (!roomId || roomId !== activeRef.current) return

          // Patch the changed message in place so its tick re-renders live.
          queryClient.setQueryData<MessagesInfiniteData>(
            chatMessagesQueryKey(roomId),
            (old) =>
              old
                ? {
                    ...old,
                    pages: old.pages.map((p) => ({
                      ...p,
                      // Keep the already-decrypted `content`; `updated` carries
                      // ciphertext and only status/tick fields matter here.
                      messages: p.messages.map((m) =>
                        m.id === updated.id
                          ? { ...m, ...updated, content: m.content }
                          : m,
                      ),
                    })),
                  }
                : old,
          )
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [queryClient])
}
