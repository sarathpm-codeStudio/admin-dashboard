import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, Send, FileText, Download, Check, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { RiAccountCircleLine } from 'react-icons/ri'
import { Header1, Paragraph } from '@/components/ui/Typography'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import avatarFallback from '@/asset/image/user1.png'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import {
  useGetMyChatRooms,
  useGetRoomMessages,
  useSendMessage,
  useMarkRoomRead,
  useChatRealtime,
} from '@/features/chat/hooks/useChat'
import { usePresenceHeartbeat, usePeerPresence } from '@/features/chat/hooks/usePresence'
import type { ChatRoomSummary, ChatMessage } from '@/api/chat/chat.api'

// "last seen" label for an offline peer, e.g. "last seen 5m ago" / "yesterday".
const formatLastSeen = (iso: string): string => {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

// Display name for a room: the peer for DIRECT chats, falling back to the
// room's own name then a generic label.
const roomName = (room: ChatRoomSummary): string =>
  (room.type === 'DIRECT' ? room.peer?.name || room.name : room.name) || 'Conversation'

// Avatar for a room (falls back to a placeholder when the peer has none).
const roomAvatar = (room: ChatRoomSummary): string =>
  room.peer?.avatar_url || avatarFallback

// Pretty, capitalised role label for the peer, e.g. "Faculty" / "Student".
const roleLabel = (role: string | null | undefined): string =>
  role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : ''

// One-line preview of the last message; non-text messages show their kind.
const lastMessagePreview = (room: ChatRoomSummary): string => {
  const m = room.last_message
  if (!m) return 'No messages yet'
  if (m.message_type !== 'TEXT') {
    const label = m.message_type.charAt(0) + m.message_type.slice(1).toLowerCase()
    return `📎 ${label}`
  }
  return m.content ?? ''
}

// WhatsApp-style timestamp for the list: time today, "Yesterday", weekday, else date.
const formatListTime = (iso: string | null): string => {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOf(now) - startOf(date)) / 86_400_000)

  if (days === 0)
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (days === 1) return 'Yesterday'
  if (days < 7) return date.toLocaleDateString([], { weekday: 'long' }).toUpperCase()
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase()
}

// Clock time for a message bubble, e.g. "9:48 AM".
const formatMessageTime = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''

// Human-readable attachment size + type, e.g. "2.4 MB • PDF Document".
const formatAttachment = (msg: ChatMessage): string => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = msg.file_size ?? 0
  let u = 0
  while (size >= 1024 && u < units.length - 1) {
    size /= 1024
    u++
  }
  const sizeLabel = `${size.toFixed(u === 0 ? 0 : 1)} ${units[u]}`
  return `${sizeLabel} • ${msg.message_type} Document`
}

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

const msgVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const msgItemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
}

export function ChatView() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  // Scroll bookkeeping: height before loading older messages (to restore
  // position), whether the last change was an older-page prepend, whether the
  // user is pinned to the bottom, and whether the room just changed.
  const prevHeightRef = useRef(0)
  const loadingOlderRef = useRef(false)
  const nearBottomRef = useRef(true)
  const roomChangedRef = useRef(false)
  const toast = useToast()
  const location = useLocation()

  const myId = useAuthStore((s) => s.user?.id)

  const { data: rooms = [], isLoading: leftLoading, isFetching } = useGetMyChatRooms()
  const {
    data: messagesData,
    isLoading: chatLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetRoomMessages(activeId)
  const sendMessage = useSendMessage()
  const markRoomRead = useMarkRoomRead()

  useChatRealtime(activeId)

  // Broadcast my own presence while I'm on the chat page (online + heartbeat
  // now, offline on leave); live presence of the open peer for the header.
  usePresenceHeartbeat(!!myId)

  // Flatten the paged history (newest page first) into one ascending list.
  const messages = useMemo(
    () =>
      messagesData
        ? [...messagesData.pages].reverse().flatMap((p) => p.messages)
        : [],
    [messagesData],
  )

  const filtered = useMemo(
    () => rooms.filter((r) => roomName(r).toLowerCase().includes(search.toLowerCase())),
    [rooms, search],
  )

  const active = rooms.find((r) => r.id === activeId) ?? null
  const peerPresence = usePeerPresence(active?.peer?.id)

  // Open a specific room when navigated here from a "Message" button (the
  // room id is passed in the router location state).
  useEffect(() => {
    const roomId = (location.state as { roomId?: string } | null)?.roomId
    if (roomId) setActiveId(roomId)
  }, [location.state])

  // Don't auto-open any room — show the welcome screen until one is clicked.
  // Only clear the selection if the active room is truly gone (skip while the
  // list is still fetching, so a freshly created room isn't dropped).
  useEffect(() => {
    if (isFetching) return
    if (activeId && !rooms.some((r) => r.id === activeId)) setActiveId(null)
  }, [rooms, activeId, isFetching])

  // A room switch should land at the bottom (newest) once its messages render.
  useEffect(() => {
    roomChangedRef.current = true
    nearBottomRef.current = true
  }, [activeId])

  // Position the scroll after each message change, before the browser paints:
  //  • loading older history → keep the viewport on the same message
  //  • room change / new message while pinned to bottom → jump to the bottom
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (loadingOlderRef.current) {
      el.scrollTop = el.scrollHeight - prevHeightRef.current
      loadingOlderRef.current = false
    } else if (roomChangedRef.current || nearBottomRef.current) {
      el.scrollTop = el.scrollHeight
      roomChangedRef.current = false
    }
  }, [messages])

  // Track bottom-pinning and pull in older history when scrolled to the top.
  const handleMessagesScroll = () => {
    const el = scrollRef.current
    if (!el) return
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (el.scrollTop < 60 && hasNextPage && !isFetchingNextPage) {
      prevHeightRef.current = el.scrollHeight
      loadingOlderRef.current = true
      void fetchNextPage()
    }
  }

  // Clear the unread badge when a room with unread messages is opened.
  useEffect(() => {
    if (active && active.unread_count > 0) {
      markRoomRead.mutate(active.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, active?.unread_count])

  const handleSend = () => {
    const body = text.trim()
    if (!body || !activeId) return
    setText('')
    sendMessage.mutate(
      { roomId: activeId, content: body },
      {
        onError: (err: any) => {
          setText(body)
          toast.error(err?.message ?? 'Could not send message')
        },
      },
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left Panel ── */}
      <div className="flex w-[300px] shrink-0 flex-col bg-white lg:w-[360px] xl:w-[400px]">
        <motion.div
          className="shrink-0 px-5 pb-4 pt-6"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Header1 className="mb-4 text-primary">Messages</Header1>
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <Input
              placeholder="Search conversations"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            {leftLoading ? (
              <motion.div
                key="left-skeleton"
                className="space-y-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <Skeleton className="h-[60px] w-[60px] shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2 pt-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="conv-list" variants={listVariants} initial="hidden" animate="visible">
                {filtered.length === 0 ? (
                  <Paragraph variant="muted" className="py-10 text-center !text-sm text-ink-muted">
                    No conversations yet
                  </Paragraph>
                ) : (
                  filtered.map((conv) => (
                    <motion.button
                      key={conv.id}
                      variants={listItemVariants}
                      onClick={() => setActiveId(conv.id)}
                      style={
                        activeId === conv.id
                          ? { boxShadow: '0 16px 32px rgba(0, 11, 96, 0.12)' }
                          : {}
                      }
                      className={`mb-2 flex w-full items-start gap-3 rounded-xl px-5 py-3.5 text-left transition-colors ${activeId === conv.id
                        ? 'border-l-4 border-primary bg-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                      <img
                        src={roomAvatar(conv)}
                        alt={roomName(conv)}
                        className="mt-0.5 h-[60px] w-[60px] shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <Paragraph className="truncate font-bold text-ink">
                              {roomName(conv)}
                            </Paragraph>
                            {conv.peer?.role && (
                              <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
                                {roleLabel(conv.peer.role)}
                              </span>
                            )}
                          </div>
                          <span className="shrink-0 text-[10px] text-black">
                            {formatListTime(conv.last_message_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <Paragraph variant="muted" className="truncate !text-sm text-gray-400">
                            {lastMessagePreview(conv)}
                          </Paragraph>
                          {conv.unread_count > 0 && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex min-w-0 flex-1 flex-col bg-gray-100">
        {!active ? (
          <motion.div
            className="flex flex-1 flex-col items-center justify-center px-6 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <MessageCircle size={30} className="text-primary" />
            </div>
            <Header1 className="mb-2 text-primary">Welcome to Chat</Header1>
            <Paragraph variant="muted" className="max-w-[260px] !text-sm text-gray-400">
              {rooms.length === 0
                ? 'You have no conversations yet.'
                : 'Select a conversation from the left to start chatting.'}
            </Paragraph>
          </motion.div>
        ) : (
          <>
            {/* Chat Header */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`header-${activeId}`}
                className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={roomAvatar(active)}
                    alt={roomName(active)}
                    className="h-[60px] w-[60px] rounded-xl object-cover"
                  />
                  <div>
                    <Paragraph className="text-sm font-bold text-primary">
                      {roomName(active)}
                    </Paragraph>
                    {peerPresence.isOnline ? (
                      <Paragraph className="flex items-center gap-1 !text-[10px] font-semibold text-green-500">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                        Active now
                      </Paragraph>
                    ) : (
                      <Paragraph className="flex items-center gap-1 !text-[10px] font-semibold text-gray-400">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-300" />
                        {peerPresence.lastSeen
                          ? `last seen ${formatLastSeen(peerPresence.lastSeen)}`
                          : 'Offline'}
                      </Paragraph>
                    )}
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                  <RiAccountCircleLine size={20} />
                  View Profile
                </button>
              </motion.div>
            </AnimatePresence>

            {/* Messages */}
            <div
              ref={scrollRef}
              onScroll={handleMessagesScroll}
              className="scrollbar-none flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5"
            >
              {isFetchingNextPage && (
                <div className="flex shrink-0 justify-center py-1">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
                </div>
              )}
              {chatLoading ? (
                  <motion.div
                    key="chat-skeleton"
                    className="flex flex-1 flex-col gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <Skeleton className={`h-16 rounded-2xl ${i % 2 === 0 ? 'w-3/5' : 'w-2/3'}`} />
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`msgs-${activeId}`}
                    className="flex flex-col gap-4"
                    variants={msgVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {messages.length === 0 ? (
                      <div className="flex flex-1 items-center justify-center py-10">
                        <Paragraph variant="muted" className="!text-sm text-gray-400">
                          No messages yet — say hello 👋
                        </Paragraph>
                      </div>
                    ) : (
                      messages.map((msg: ChatMessage) => {
                        const mine = msg.sender_id === myId
                        return (
                          <motion.div
                            key={msg.id}
                            variants={msgItemVariants}
                            className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-[65%] rounded-2xl px-4 py-3 ${mine
                                ? 'rounded-tr-sm bg-primary text-white'
                                : 'rounded-tl-sm bg-white text-ink'
                                }`}
                            >
                              {msg.content && (
                                <Paragraph
                                  className={`!text-sm leading-relaxed ${mine ? 'text-white' : 'text-ink'
                                    }`}
                                >
                                  {msg.content}
                                </Paragraph>
                              )}

                              {msg.message_type !== 'TEXT' && msg.file_url && (
                                <a
                                  href={msg.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-3 ${msg.content ? 'mt-3' : ''
                                    } rounded-xl bg-white px-3 py-2`}
                                >
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                                    <FileText size={14} className="text-blue-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold text-ink">
                                      {msg.file_name ?? 'Attachment'}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                      {formatAttachment(msg)}
                                    </p>
                                  </div>
                                  <span className="shrink-0 text-gray-400 hover:text-primary">
                                    <Download size={14} />
                                  </span>
                                </a>
                              )}
                            </div>

                            <div
                              className={`mt-1 flex items-center gap-1 ${mine ? 'flex-row-reverse' : ''
                                }`}
                            >
                              <span className="text-[10px] text-black">
                                {formatMessageTime(msg.created_at)}
                              </span>
                              {mine && (
                                <span className="flex items-center">
                                  {/* sent → 1 tick · delivered → 2 ticks · seen → 2 blue ticks */}
                                  <Check
                                    size={13}
                                    strokeWidth={3}
                                    className={msg.status === 'seen' ? 'text-[#53BDEB]' : 'text-gray-400'}
                                  />
                                  {msg.status !== 'sent' && (
                                    <Check
                                      size={13}
                                      strokeWidth={3}
                                      className={`-ml-[7px] ${msg.status === 'seen' ? 'text-[#53BDEB]' : 'text-gray-400'
                                        }`}
                                    />
                                  )}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        )
                      })
                    )}
                  </motion.div>
                )}
            </div>

            {/* Input Bar */}
            <motion.div
              className="shrink-0 border-t border-gray-200 px-6 py-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                {/* <button className="text-gray-400 transition-colors hover:text-primary">
                  <Paperclip size={18} />
                </button> */}
                <button className="text-gray-400 transition-colors hover:text-primary">😊</button>
                <input
                  type="text"
                  placeholder={`Type your message to ${roomName(active)}...`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend()
                  }}
                  className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-gray-400"
                />
                {/* <button className="text-gray-400 transition-colors hover:text-primary">
                  <Mic size={18} />
                </button> */}
                <button
                  onClick={handleSend}
                  disabled={!text.trim() || sendMessage.isPending}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Send size={15} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
