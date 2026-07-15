import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Send, X, Maximize2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import {
  useGetMyChatRooms,
  useGetRoomMessages,
  useSendMessage,
  useMarkRoomRead,
  useChatRealtime,
  useChatRoomsRealtime,
  useThreadCatchUp,
} from '@/features/chat/hooks/useChat'
import { usePeerPresence } from '@/features/chat/hooks/usePresence'
import type { ChatRoomSummary } from '@/api/chat/chat.api'

// ── Small local helpers (mirrors of ChatView's) ──────────────────────────────

const roomName = (room: ChatRoomSummary): string =>
  (room.type === 'DIRECT' ? room.peer?.name || room.name : room.name) || 'Conversation'

const roleLabel = (role: string | null | undefined): string =>
  role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : ''

const AVATAR_COLORS = ['#F97316', '#0EA5E9', '#8B5CF6', '#EC4899', '#10B981', '#6366F1', '#EF4444', '#F59E0B']
const colorForName = (name: string): string => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? '#6366F1'
}
const initialOf = (name: string): string => name.trim().charAt(0).toUpperCase() || '?'

const lastMessagePreview = (room: ChatRoomSummary): string => {
  const m = room.last_message
  if (!m) return 'No messages yet'
  if (m.is_deleted) return 'This message was deleted'
  if (m.message_type !== 'TEXT') {
    const noun = m.message_type === 'IMAGE' ? 'Photo' : m.message_type === 'PDF' ? 'Document' : 'Voice message'
    return `📎 ${noun}`
  }
  return m.content ?? ''
}

const formatListTime = (iso: string | null): string => {
  if (!iso) return ''
  const date = new Date(iso)
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOf(new Date()) - startOf(date)) / 86_400_000)
  if (days === 0) return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (days === 1) return 'Yesterday'
  if (days < 7) return date.toLocaleDateString([], { weekday: 'short' })
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const formatMessageTime = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''

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

// ── Widget ────────────────────────────────────────────────────────────────────

/**
 * LinkedIn-style floating chat: a launcher bubble on every admin page (except
 * the full chat page) that opens a mini panel — room list first, then the
 * selected conversation with a text composer. Attachments stay in the full chat
 * page; the expand button jumps there.
 */
export function ChatWidget() {
  const { pathname } = useLocation()
  const myId = useAuthStore((s) => s.user?.id)

  // The full chat page renders its own two-pane chat (and mounts its own
  // realtime channels — the names collide, so never render both).
  if (!myId || pathname.startsWith('/chats')) return null
  return <ChatWidgetPanel myId={myId} />
}

function ChatWidgetPanel({ myId }: { myId: string }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Always enabled (not just while open): the closed launcher's unread badge
  // needs the room list too. Kept fresh by useChatRoomsRealtime below.
  const { data: rooms = [], isLoading: roomsLoading } = useGetMyChatRooms(true)
  const active = rooms.find((r) => r.id === activeId) ?? null

  const totalUnread = useMemo(
    () => rooms.reduce((sum, r) => sum + (r.unread_count || 0), 0),
    [rooms],
  )

  // Keep the room list (unread badge) live app-wide, and the open thread live +
  // self-healing. Never mounted alongside ChatView's copies — the widget
  // doesn't render on /chats.
  useChatRoomsRealtime()
  useChatRealtime(activeId)
  useThreadCatchUp(activeId)

  const { data: messagePages, isLoading: messagesLoading } = useGetRoomMessages(activeId)
  // Newest message first — the thread renders column-reverse.
  const messages = useMemo(
    () => (messagePages?.pages ?? []).flatMap((p) => p.messages.slice().reverse()),
    [messagePages],
  )

  const sendMessage = useSendMessage()
  const markRoomRead = useMarkRoomRead()
  const [text, setText] = useState('')

  const peerPresence = usePeerPresence(open && active ? active.peer?.id : null)

  // Clear the unread badge for the open room (again whenever new messages
  // arrive while it stays open).
  useEffect(() => {
    if (open && activeId && (active?.unread_count ?? 0) > 0) markRoomRead.mutate(activeId)
  }, [open, activeId, active?.unread_count])

  const handleSend = () => {
    const body = text.trim()
    if (!activeId || !body || sendMessage.isPending) return
    setText('')
    sendMessage.mutate({ roomId: activeId, content: body }, { onError: () => setText(body) })
  }

  const openFullChat = () => {
    setOpen(false)
    navigate('/chats', activeId ? { state: { roomId: activeId } } : undefined)
  }

  const Avatar = ({ room, size }: { room: ChatRoomSummary; size: string }) =>
    room.peer?.avatar_url ? (
      <img
        src={room.peer.avatar_url}
        alt={roomName(room)}
        className={`${size} shrink-0 rounded-lg object-cover`}
      />
    ) : (
      <div
        className={`${size} flex shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white`}
        style={{ backgroundColor: colorForName(roomName(room)) }}
      >
        {initialOf(roomName(room))}
      </div>
    )

  // ── Launcher bubble ──────────────────────────────────────────────────────
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open chat"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle size={24} />
        {totalUnread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>
    )
  }

  // ── Panel ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 right-6 z-40 flex h-[480px] max-h-[calc(100vh-6rem)] w-[340px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 bg-primary px-3 py-2.5 text-white">
        {active ? (
          <>
            <button
              type="button"
              onClick={() => setActiveId(null)}
              aria-label="Back to conversations"
              className="rounded-lg p-1 transition-colors hover:bg-white/10"
            >
              <ArrowLeft size={17} />
            </button>
            <Avatar room={active} size="h-8 w-8" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{roomName(active)}</p>
              {active.peer?.id && (
                <p className="flex items-center gap-1 text-[10px] text-white/70">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${peerPresence.isOnline ? 'bg-green-400' : 'bg-black'}`}
                  />
                  {peerPresence.isOnline
                    ? 'Online'
                    : peerPresence.lastSeen
                      ? `last seen ${formatLastSeen(peerPresence.lastSeen)}`
                      : 'Offline'}
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="flex flex-1 items-center gap-2 pl-1 text-sm font-bold">
            Messages
            {totalUnread > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </p>
        )}
        <button
          type="button"
          onClick={openFullChat}
          title="Open full chat"
          aria-label="Open full chat"
          className="rounded-lg p-1 transition-colors hover:bg-white/10"
        >
          <Maximize2 size={15} />
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close chat"
          className="rounded-lg p-1 transition-colors hover:bg-white/10"
        >
          <X size={17} />
        </button>
      </div>

      {!active ? (
        /* ── Room list ── */
        <div className="flex-1 overflow-y-auto">
          {roomsLoading ? (
            <p className="px-4 py-6 text-center text-xs text-gray-400">Loading conversations…</p>
          ) : rooms.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-gray-400">No conversations yet.</p>
          ) : (
            rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => setActiveId(room.id)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
              >
                <Avatar room={room} size="h-10 w-10" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="flex min-w-0 items-center gap-1.5 truncate text-sm font-semibold text-ink">
                      <span className="truncate">{roomName(room)}</span>
                      {room.peer?.role && (
                        <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-gray-500">
                          {roleLabel(room.peer.role)}
                        </span>
                      )}
                    </p>
                    <span className="shrink-0 text-[10px] text-gray-400">
                      {formatListTime(room.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-gray-500">{lastMessagePreview(room)}</p>
                    {room.unread_count > 0 && (
                      <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                        {room.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        /* ── Thread ── */
        <>
          <div className="flex flex-1 flex-col-reverse gap-2 overflow-y-auto bg-gray-50 px-3 py-3">
            {messagesLoading ? (
              <p className="py-6 text-center text-xs text-gray-400">Loading messages…</p>
            ) : messages.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-400">No messages yet — say hello!</p>
            ) : (
              messages.map((msg) => {
                const mine = msg.sender_id === myId
                return (
                  <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-1.5 ${
                        mine
                          ? 'rounded-tr-sm bg-primary text-white'
                          : 'rounded-tl-sm bg-white text-ink shadow-sm'
                      }`}
                    >
                      {msg.is_deleted ? (
                        <p className={`text-xs italic ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                          This message was deleted
                        </p>
                      ) : msg.message_type === 'TEXT' ? (
                        <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>
                      ) : (
                        // Rich content lives in the full chat page.
                        <button
                          type="button"
                          onClick={openFullChat}
                          className={`text-xs underline ${mine ? 'text-white/90' : 'text-primary'}`}
                        >
                          📎 {msg.message_type === 'IMAGE' ? 'Photo' : msg.message_type === 'PDF' ? 'Document' : 'Voice message'} — open in chat
                        </button>
                      )}
                      <p className={`mt-0.5 text-right text-[9px] ${mine ? 'text-white/60' : 'text-gray-400'}`}>
                        {formatMessageTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Composer (text only) */}
          <div className="flex shrink-0 items-center gap-2 border-t border-gray-100 bg-white px-3 py-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder={`Message ${active ? roomName(active) : ''}…`}
              className="h-9 min-w-0 flex-1 rounded-xl bg-gray-100 px-3 text-sm text-ink outline-none placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() || sendMessage.isPending}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatWidget
