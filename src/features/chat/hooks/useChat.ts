import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  attachReplyPreviews,
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

// Append a message to the newest page of a room's thread cache, in place and
// idempotently (deduped by id). Used so a just-sent message lands instantly
// without a refetch — and so the later realtime echo is a no-op.
const appendMessageToThread = (
  queryClient: ReturnType<typeof useQueryClient>,
  roomId: string,
  message: ChatMessage,
) => {
  queryClient.setQueryData<MessagesInfiniteData>(
    chatMessagesQueryKey(roomId),
    (old) => {
      if (!old || old.pages.length === 0) return old
      const exists = old.pages.some((p) => p.messages.some((m) => m.id === message.id))
      if (exists) return old
      const [first, ...rest] = old.pages
      if (!first) return old
      return { ...old, pages: [{ ...first, messages: [...first.messages, message] }, ...rest] }
    },
  )
}

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
    // The open thread is kept live in place by realtime patches; without this,
    // react-query refetches every loaded page on each window focus, visibly
    // reloading the conversation (e.g. when testing two apps side by side).
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })

/**
 * Catch-up sync for the open thread: quietly fetches the newest page and merges
 * any messages the cache is missing — in place, deduped, sorted; no refetch and
 * no visible reload (when nothing is new, the cache object is returned as-is so
 * nothing re-renders). Runs when the room opens and whenever the window regains
 * focus, so the thread self-heals even if a realtime event was missed (dropped
 * socket, sleeping tab, etc.).
 */
export const useThreadCatchUp = (roomId?: string | null) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!roomId) return
    let cancelled = false

    const catchUp = async () => {
      try {
        const page = await chatFunctions.getMessagesPage(roomId, {
          limit: MESSAGES_PAGE_SIZE,
        })
        if (cancelled) return
        queryClient.setQueryData<MessagesInfiniteData>(
          chatMessagesQueryKey(roomId),
          (old) => {
            if (!old || old.pages.length === 0) return old
            const known = new Set(
              old.pages.flatMap((p) => p.messages.map((m) => m.id)),
            )
            const fresh = page.messages.filter((m) => !known.has(m.id))
            if (!fresh.length) return old
            const [first, ...rest] = old.pages
            if (!first) return old
            // Newest page holds messages oldest→newest; merge the missing ones
            // in and re-sort so mid-stream gaps land in the right place too.
            const merged = [...first.messages, ...fresh].sort((a, b) =>
              (a.created_at ?? '').localeCompare(b.created_at ?? ''),
            )
            return { ...old, pages: [{ ...first, messages: merged }, ...rest] }
          },
        )
      } catch {
        /* best-effort sync — ignore failures */
      }
    }

    void catchUp()
    const onFocus = () => void catchUp()
    window.addEventListener('focus', onFocus)
    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
    }
  }, [roomId, queryClient])
}

/**
 * Ephemeral typing indicator over a Supabase Realtime broadcast channel
 * (`chat-typing:<roomId>`, event `typing`, payload `{ user_id, typing }`). No
 * DB writes — typing is transient. `self: false` means we never receive our own
 * events. Returns whether the peer is typing, plus `notifyTyping` (call on each
 * keystroke) and `stopTyping` (call on send / when the field clears).
 */
export const useTyping = (roomId?: string | null, myId?: string) => {
  const [peerTyping, setPeerTyping] = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const subscribedRef = useRef(false)
  // Whether I'm currently broadcasting "typing".
  const activeRef = useRef(false)
  // Last time we broadcast "typing: true", to throttle re-sends.
  const lastTrueRef = useRef(0)
  const stopTimer = useRef<number | undefined>(undefined)
  const clearTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!roomId) {
      setPeerTyping(false)
      return
    }

    const channel = supabase.channel(`chat-typing:${roomId}`, {
      config: { broadcast: { self: false } },
    })

    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (!payload || payload.user_id === myId) return
      if (payload.typing) {
        setPeerTyping(true)
        // Auto-clear if we miss the peer's "stopped" event.
        window.clearTimeout(clearTimer.current)
        clearTimer.current = window.setTimeout(() => setPeerTyping(false), 4000)
      } else {
        window.clearTimeout(clearTimer.current)
        setPeerTyping(false)
      }
    })

    channel.subscribe((status) => {
      subscribedRef.current = status === 'SUBSCRIBED'
    })
    channelRef.current = channel

    return () => {
      // Best-effort "stopped typing" before tearing the channel down.
      if (activeRef.current && subscribedRef.current) {
        void channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { user_id: myId, typing: false },
        })
      }
      activeRef.current = false
      subscribedRef.current = false
      window.clearTimeout(stopTimer.current)
      window.clearTimeout(clearTimer.current)
      setPeerTyping(false)
      void supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [roomId, myId])

  // Announce that I'm typing, then auto-stop after a short pause. Re-broadcast
  // "typing" at most every ~1.2s while typing so a peer that just subscribed
  // (or missed the first packet) still picks it up mid-burst.
  const notifyTyping = useCallback(() => {
    const channel = channelRef.current
    if (!channel || !myId || !subscribedRef.current) return
    const now = Date.now()
    if (now - lastTrueRef.current > 1200) {
      lastTrueRef.current = now
      activeRef.current = true
      void channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: myId, typing: true },
      })
    }
    window.clearTimeout(stopTimer.current)
    stopTimer.current = window.setTimeout(() => {
      activeRef.current = false
      lastTrueRef.current = 0
      void channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: myId, typing: false },
      })
    }, 2500)
  }, [myId])

  // Stop immediately (e.g. right after sending a message).
  const stopTyping = useCallback(() => {
    const channel = channelRef.current
    window.clearTimeout(stopTimer.current)
    lastTrueRef.current = 0
    if (channel && myId && activeRef.current && subscribedRef.current) {
      activeRef.current = false
      void channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: myId, typing: false },
      })
    }
  }, [myId])

  return { peerTyping, notifyTyping, stopTyping }
}

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
    mutationFn: ({
      roomId,
      content,
      replyToMessageId,
    }: {
      roomId: string
      content: string
      replyToMessageId?: string | null
    }) => chatFunctions.sendMessage(roomId, content, replyToMessageId),
    // Drop the just-sent message straight into the thread cache (no refetch), so
    // it replaces the optimistic bubble with no flicker; the later realtime echo
    // is deduped. Only the room list is refreshed.
    onSuccess: (message, { roomId }) => {
      appendMessageToThread(queryClient, roomId, message)
      queryClient.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY })
    },
  })
}

// Send one or more attachments (image / PDF album) as a single message, then
// drop it straight into the thread cache — same no-refetch contract as text and
// voice sends.
export const useSendFilesMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      roomId,
      files,
      kind,
      replyToMessageId,
    }: {
      roomId: string
      files: File[]
      kind: 'IMAGE' | 'PDF'
      replyToMessageId?: string | null
    }) => chatFunctions.sendFilesMessage(roomId, files, kind, replyToMessageId),
    onSuccess: (message, { roomId }) => {
      appendMessageToThread(queryClient, roomId, message)
      queryClient.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY })
    },
  })
}

// Soft-delete my own message, then refresh that thread and the room list so the
// tombstone (and any updated last-message preview) shows everywhere.
export const useDeleteMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ messageId }: { messageId: string; roomId: string }) =>
      chatFunctions.deleteMessage(messageId),
    onSuccess: (_data, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: chatMessagesQueryKey(roomId) })
      queryClient.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY })
    },
  })
}

// Send a voice message (record → upload → store), then refresh the room list.
// The thread updates live via the realtime INSERT, same as text messages.
export const useSendAudioMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      roomId,
      blob,
      meta,
      replyToMessageId,
    }: {
      roomId: string
      blob: Blob
      meta: { duration: number; peaks: number[]; mimeType: string }
      replyToMessageId?: string | null
    }) => chatFunctions.sendAudioMessage(roomId, blob, meta, replyToMessageId),
    // Drop the returned (render-ready) message straight into the open thread so
    // the voice bubble becomes playable the instant the upload finishes, without
    // waiting on the realtime echo. Deduped by id in case realtime beat us here.
    onSuccess: (message, { roomId }) => {
      queryClient.setQueryData<MessagesInfiniteData>(
        chatMessagesQueryKey(roomId),
        (old) => {
          if (!old || old.pages.length === 0) return old
          const exists = old.pages.some((p) =>
            p.messages.some((m) => m.id === message.id),
          )
          if (exists) return old
          const [first, ...rest] = old.pages
          if (!first) return old
          return {
            ...old,
            pages: [
              { ...first, messages: [...first.messages, message] },
              ...rest,
            ],
          }
        },
      )
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
        (payload) => {
          void queryClient.invalidateQueries({ queryKey: CHAT_ROOMS_QUERY_KEY })
          // Same stale-marking as INSERT: keeps a closed room's ticks and
          // deletions fresh for its next open, without refetching now.
          const roomId = (payload.new as { room_id?: string })?.room_id
          if (roomId) {
            void queryClient.invalidateQueries({
              queryKey: chatMessagesQueryKey(roomId),
              refetchType: 'none',
            })
          }
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

          // My own sends enter the thread via the mutation's onSuccess swap
          // (which replaces the optimistic clock bubble in one render).
          // Appending the echo here too would land BEFORE the request resolves,
          // briefly duplicating the bubble — the "chat reloads on send" flicker.
          if (incoming.sender_id === myId) return

          // The realtime payload carries encrypted `content`; decrypt it and
          // resolve any quoted-reply preview before it lands in the cache, then
          // append to the newest page of the open thread, skipping duplicates
          // already present in any loaded page.
          void (async () => {
            const plainContent = await decryptMessageSafe(incoming.content)
            const decrypted: ChatMessage = { ...incoming, content: plainContent }
            await attachReplyPreviews([decrypted])
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
          })()
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
