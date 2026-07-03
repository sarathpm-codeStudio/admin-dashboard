import { useState, useRef, useEffect, useLayoutEffect, useMemo, Fragment } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, Send, FileText, Download, Check, MessageCircle, Reply, X, Trash2, Mic, Clock, Paperclip, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { RiAccountCircleLine } from 'react-icons/ri'
import { Header1, Paragraph } from '@/components/ui/Typography'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { EmojiPicker } from '@/components/ui/EmojiPicker'
import { AudioPlayer } from '@/components/ui/AudioPlayer'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { formatDuration, pseudoPeaks } from '@/utils/audio'
import avatarFallback from '@/asset/image/user1.png'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import {
  useGetMyChatRooms,
  useGetRoomMessages,
  useSendMessage,
  useDeleteMessage,
  useSendAudioMessage,
  useSendFileMessage,
  useMarkRoomRead,
  useChatRealtime,
  useTyping,
} from '@/features/chat/hooks/useChat'
import { usePresenceHeartbeat, usePeerPresence } from '@/features/chat/hooks/usePresence'
import { CHAT_ATTACHMENT_MAX_BYTES, type ChatRoomSummary, type ChatMessage, type ChatReplyPreview } from '@/api/chat/chat.api'

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
  if (m.is_deleted) return 'This message was deleted'
  if (m.message_type !== 'TEXT') {
    const label =
      m.message_type === 'PDF'
        ? 'PDF'
        : m.message_type.charAt(0) + m.message_type.slice(1).toLowerCase()
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

// Midnight timestamp for a date, used to compare calendar days.
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

// Whether two ISO timestamps fall on the same calendar day.
const sameDay = (a: string | null, b: string | null): boolean =>
  !!a && !!b && startOfDay(new Date(a)) === startOfDay(new Date(b))

// Label for a day-separator: "Today", "Yesterday", a weekday within the last
// week, else a full date.
const dateSeparatorLabel = (iso: string | null): string => {
  if (!iso) return ''
  const d = new Date(iso)
  const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return d.toLocaleDateString([], { weekday: 'long' })
  return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
}

// One-line text for a quoted (replied-to) message; non-text shows its kind.
const replyPreviewText = (r: ChatReplyPreview): string => {
  if (r.is_deleted) return 'This message was deleted'
  if (r.message_type !== 'TEXT') {
    const label =
      r.message_type === 'PDF'
        ? 'PDF'
        : r.message_type.charAt(0) + r.message_type.slice(1).toLowerCase()
    return `📎 ${label}`
  }
  return r.content ?? ''
}

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
  const label = msg.message_type === 'PDF' ? 'PDF Document' : `${msg.message_type} Document`
  return `${sizeLabel} • ${label}`
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

// An optimistic voice message that shows in the thread the moment you hit send,
// before its blob has finished uploading. It carries everything needed both to
// render the bubble locally (object-URL `src`, waveform `peaks`, `duration`)
// and to retry the upload (`blob`, `meta`, `replyToMessageId`). `status`
// flips 'uploading' → gone on success, or → 'error' (retryable) on failure.
interface PendingAudio {
  id: string
  roomId: string
  src: string
  duration: number
  peaks: number[]
  createdAt: string
  status: 'uploading' | 'error'
  blob: Blob
  meta: { duration: number; peaks: number[]; mimeType: string }
  replyToMessageId?: string | null
  replyTo: ChatReplyPreview | null
}

// An optimistic text message shown with a clock (⏱) tick the instant you hit
// send, until the server confirms it (then the real message replaces it) or the
// send fails (then it's removed and the text is restored to the input).
interface PendingText {
  id: string
  roomId: string
  content: string
  createdAt: string
  replyTo: ChatReplyPreview | null
}

// An optimistic attachment (image / PDF) shown while its file uploads. Images
// preview from a local object URL; documents show their file card. `status`
// flips 'uploading' → gone on success, or → 'error' (retryable) on failure.
interface PendingFile {
  id: string
  roomId: string
  kind: 'IMAGE' | 'PDF'
  file: File
  // Local preview for images ('' for documents).
  previewUrl: string
  createdAt: string
  status: 'uploading' | 'error'
  replyToMessageId?: string | null
  replyTo: ChatReplyPreview | null
}

export function ChatView() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [text, setText] = useState('')
  // The message currently being replied to (null when composing a fresh one).
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  // The message briefly highlighted after jumping to it from a reply quote.
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const highlightTimer = useRef<number | undefined>(undefined)
  // The message awaiting delete confirmation (null when the modal is closed).
  const [pendingDelete, setPendingDelete] = useState<ChatMessage | null>(null)
  // Voice messages currently uploading (or failed and awaiting retry), rendered
  // optimistically at the bottom of the open thread until the upload lands.
  const [pendingAudios, setPendingAudios] = useState<PendingAudio[]>([])
  // Text messages currently sending, shown optimistically with a clock tick.
  const [pendingTexts, setPendingTexts] = useState<PendingText[]>([])
  // Attachments currently uploading (or failed and awaiting retry).
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const pendingFilesRef = useRef<PendingFile[]>([])
  // Attachment picker popover state + hidden file inputs (image / PDF).
  const [attachOpen, setAttachOpen] = useState(false)
  const attachWrapRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  // Emoji picker open state, plus refs to place/close it and to insert at caret.
  const [emojiOpen, setEmojiOpen] = useState(false)
  const emojiWrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  // Scroll bookkeeping: height before loading older messages (to restore
  // position), whether the last change was an older-page prepend, whether the
  // user is pinned to the bottom, and whether the room just changed.
  const prevHeightRef = useRef(0)
  const loadingOlderRef = useRef(false)
  const nearBottomRef = useRef(true)
  const roomChangedRef = useRef(false)
  // Latest pending-audio list, so the unmount cleanup can free object URLs.
  const pendingAudiosRef = useRef<PendingAudio[]>([])
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
  const sendAudioMessage = useSendAudioMessage()
  const sendFileMessage = useSendFileMessage()
  const deleteMessage = useDeleteMessage()
  const markRoomRead = useMarkRoomRead()

  // Voice-message recorder (mic → blob → upload).
  const recorder = useAudioRecorder()

  useChatRealtime(activeId)

  // Ephemeral typing indicator for the open room (broadcast, no DB writes).
  const { peerTyping, notifyTyping, stopTyping } = useTyping(activeId, myId)

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

  // Optimistic bubbles for the open room only (uploading / sending), merged and
  // ordered by time so they sit at the bottom in the right sequence.
  const roomPendingAudios = pendingAudios.filter((p) => p.roomId === activeId)
  const roomPendingTexts = pendingTexts.filter((p) => p.roomId === activeId)
  const roomPendingFiles = pendingFiles.filter((p) => p.roomId === activeId)
  const roomPending = [
    ...roomPendingAudios.map((p) => ({ kind: 'audio' as const, id: p.id, createdAt: p.createdAt, audio: p })),
    ...roomPendingTexts.map((p) => ({ kind: 'text' as const, id: p.id, createdAt: p.createdAt, text: p })),
    ...roomPendingFiles.map((p) => ({ kind: 'file' as const, id: p.id, createdAt: p.createdAt, file: p })),
  ].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

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

  // A room switch should land at the bottom (newest) once its messages render,
  // and any in-progress reply is dropped.
  useEffect(() => {
    roomChangedRef.current = true
    nearBottomRef.current = true
    setReplyTo(null)
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
    // These are deps so a new typing indicator or a freshly-sent voice/text/
    // attachment bubble scrolls into view when pinned to the bottom.
  }, [messages, peerTyping, pendingAudios, pendingTexts, pendingFiles])

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

  // Jump to a quoted message when its reply preview is clicked. If the target
  // isn't loaded yet, keep pulling older pages (keeping the viewport steady)
  // until it appears, then smooth-scroll to it and flash a highlight.
  const scrollToMessage = async (id: string) => {
    const find = () =>
      scrollRef.current?.querySelector<HTMLElement>(`[data-msg-id="${id}"]`) ?? null

    let el = find()
    for (let i = 0; !el && hasNextPage && i < 20; i++) {
      const c = scrollRef.current
      if (c) {
        prevHeightRef.current = c.scrollHeight
        loadingOlderRef.current = true
      }
      await fetchNextPage()
      await new Promise((r) => requestAnimationFrame(() => r(null)))
      el = find()
    }
    if (!el) return

    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlightId(id)
    window.clearTimeout(highlightTimer.current)
    highlightTimer.current = window.setTimeout(() => setHighlightId(null), 1600)
  }

  // Clear the highlight timer on unmount.
  useEffect(() => () => window.clearTimeout(highlightTimer.current), [])

  // Keep a ref to the pending audios and free their object URLs on unmount so
  // in-flight/failed recordings don't leak blob memory when leaving the page.
  pendingAudiosRef.current = pendingAudios
  pendingFilesRef.current = pendingFiles
  useEffect(
    () => () => {
      pendingAudiosRef.current.forEach((p) => URL.revokeObjectURL(p.src))
      pendingFilesRef.current.forEach((p) => p.previewUrl && URL.revokeObjectURL(p.previewUrl))
    },
    [],
  )

  // Close the attachment picker on any click outside it.
  useEffect(() => {
    if (!attachOpen) return
    const onDown = (e: MouseEvent) => {
      if (attachWrapRef.current && !attachWrapRef.current.contains(e.target as Node))
        setAttachOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [attachOpen])

  // Close the emoji picker on any click outside it (the trigger lives inside the
  // wrapper too, so tapping it just toggles rather than close-then-reopen).
  useEffect(() => {
    if (!emojiOpen) return
    const onDown = (e: MouseEvent) => {
      if (emojiWrapRef.current && !emojiWrapRef.current.contains(e.target as Node))
        setEmojiOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [emojiOpen])

  // Insert a picked emoji at the caret (falling back to the end), keeping focus.
  const insertEmoji = (emoji: string) => {
    const el = inputRef.current
    const start = el?.selectionStart ?? text.length
    const end = el?.selectionEnd ?? text.length
    setText(text.slice(0, start) + emoji + text.slice(end))
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      const pos = start + emoji.length
      el.setSelectionRange(pos, pos)
    })
  }

  // Clear the unread badge when a room with unread messages is opened.
  useEffect(() => {
    if (active && active.unread_count > 0) {
      markRoomRead.mutate(active.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, active?.unread_count])

  // Label for who authored a quoted message ("You" for the current admin).
  const replyAuthor = (senderId: string): string =>
    senderId === myId ? 'You' : active ? roomName(active) : ''

  // Start recording a voice message (asks for mic permission).
  const handleStartRecording = async () => {
    stopTyping()
    try {
      await recorder.start()
    } catch {
      toast.error('Microphone access is required to record a voice message')
    }
  }

  // Upload (or re-upload) a pending voice message. Flips it back to 'uploading'
  // while in flight; on success the real message is appended to the thread by
  // the mutation, so we just drop the placeholder (and free its object URL); on
  // failure we mark it 'error' so its bubble offers a retry button.
  const uploadAudio = (pending: PendingAudio) => {
    setPendingAudios((list) =>
      list.map((p) => (p.id === pending.id ? { ...p, status: 'uploading' } : p)),
    )
    sendAudioMessage.mutate(
      {
        roomId: pending.roomId,
        blob: pending.blob,
        meta: pending.meta,
        replyToMessageId: pending.replyToMessageId,
      },
      {
        onSuccess: () => {
          URL.revokeObjectURL(pending.src)
          setPendingAudios((list) => list.filter((p) => p.id !== pending.id))
        },
        onError: (err: any) => {
          setPendingAudios((list) =>
            list.map((p) => (p.id === pending.id ? { ...p, status: 'error' } : p)),
          )
          toast.error(err?.message ?? 'Could not send voice message')
        },
      },
    )
  }

  // Stop recording and show the voice bubble immediately (spinner on play)
  // while it uploads in the background. The waveform was captured live during
  // recording, so there's no decode step to delay the bubble — even for a long
  // clip the sender sees it the instant they hit send.
  const handleSendAudio = async () => {
    const result = await recorder.stop()
    if (!result || !activeId) return
    const id = `pending-${crypto.randomUUID()}`
    const peaks = result.peaks.length ? result.peaks : pseudoPeaks(id)
    const duration = result.duration
    const replyToMessageId = replyTo?.id
    const replyTarget = replyTo
    setReplyTo(null)

    const pending: PendingAudio = {
      id,
      roomId: activeId,
      src: URL.createObjectURL(result.blob),
      duration,
      peaks,
      createdAt: new Date().toISOString(),
      status: 'uploading',
      blob: result.blob,
      meta: {
        duration,
        peaks,
        mimeType: result.mimeType,
      },
      replyToMessageId,
      replyTo: replyTarget
        ? {
            id: replyTarget.id,
            sender_id: replyTarget.sender_id,
            message_type: replyTarget.message_type,
            content: replyTarget.content,
            is_deleted: replyTarget.is_deleted,
          }
        : null,
    }
    setPendingAudios((list) => [...list, pending])
    uploadAudio(pending)
  }

  // Retry a voice message whose upload failed.
  const retryAudio = (id: string) => {
    const pending = pendingAudios.find((p) => p.id === id)
    if (pending) uploadAudio(pending)
  }

  // Upload (or re-upload) a pending attachment; mirrors uploadAudio.
  const uploadFile = (pending: PendingFile) => {
    setPendingFiles((list) =>
      list.map((p) => (p.id === pending.id ? { ...p, status: 'uploading' } : p)),
    )
    sendFileMessage.mutate(
      {
        roomId: pending.roomId,
        file: pending.file,
        kind: pending.kind,
        replyToMessageId: pending.replyToMessageId,
      },
      {
        onSuccess: () => {
          if (pending.previewUrl) URL.revokeObjectURL(pending.previewUrl)
          setPendingFiles((list) => list.filter((p) => p.id !== pending.id))
        },
        onError: (err: any) => {
          setPendingFiles((list) =>
            list.map((p) => (p.id === pending.id ? { ...p, status: 'error' } : p)),
          )
          toast.error(err?.message ?? 'Could not send attachment')
        },
      },
    )
  }

  // Retry an attachment whose upload failed.
  const retryFile = (id: string) => {
    const pending = pendingFiles.find((p) => p.id === id)
    if (pending) uploadFile(pending)
  }

  // Open the hidden file input for the picked attachment kind.
  const pickAttachment = (kind: 'IMAGE' | 'PDF') => {
    setAttachOpen(false)
    ;(kind === 'IMAGE' ? imageInputRef : docInputRef).current?.click()
  }

  // Validate the chosen file (type + 5 MB cap), then show it optimistically and
  // upload in the background — same flow as voice messages.
  const handleFileSelected = (
    kind: 'IMAGE' | 'PDF',
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    // Reset so picking the same file again still fires onChange.
    e.target.value = ''
    if (!file || !activeId) return

    const validType =
      kind === 'IMAGE' ? file.type.startsWith('image/') : file.type === 'application/pdf'
    if (!validType) {
      toast.error(kind === 'IMAGE' ? 'Only images can be attached' : 'Only PDF documents can be attached')
      return
    }
    if (file.size > CHAT_ATTACHMENT_MAX_BYTES) {
      toast.error('File is too large — maximum size is 5 MB')
      return
    }

    const replyTarget = replyTo
    setReplyTo(null)
    const pending: PendingFile = {
      id: `pending-${crypto.randomUUID()}`,
      roomId: activeId,
      kind,
      file,
      previewUrl: kind === 'IMAGE' ? URL.createObjectURL(file) : '',
      createdAt: new Date().toISOString(),
      status: 'uploading',
      replyToMessageId: replyTarget?.id,
      replyTo: replyTarget
        ? {
            id: replyTarget.id,
            sender_id: replyTarget.sender_id,
            message_type: replyTarget.message_type,
            content: replyTarget.content,
            is_deleted: replyTarget.is_deleted,
          }
        : null,
    }
    setPendingFiles((list) => [...list, pending])
    uploadFile(pending)
  }

  // Open the confirm modal for one of my own messages.
  const handleDelete = (msg: ChatMessage) => setPendingDelete(msg)

  // Confirmed delete: soft-delete the message (leaving a tombstone) and drop it
  // as the reply target if it was being quoted.
  const confirmDelete = () => {
    const msg = pendingDelete
    if (!msg || !activeId) return
    if (replyTo?.id === msg.id) setReplyTo(null)
    deleteMessage.mutate(
      { messageId: msg.id, roomId: activeId },
      {
        onSuccess: () => setPendingDelete(null),
        onError: (err: any) => {
          setPendingDelete(null)
          toast.error(err?.message ?? 'Could not delete message')
        },
      },
    )
  }

  const handleSend = () => {
    const body = text.trim()
    if (!body || !activeId) return
    const replyToMessageId = replyTo?.id
    const replyTarget = replyTo
    // Show the message immediately with a clock tick, then clear the composer.
    const id = `pending-${crypto.randomUUID()}`
    const pending: PendingText = {
      id,
      roomId: activeId,
      content: body,
      createdAt: new Date().toISOString(),
      replyTo: replyTarget
        ? {
            id: replyTarget.id,
            sender_id: replyTarget.sender_id,
            message_type: replyTarget.message_type,
            content: replyTarget.content,
            is_deleted: replyTarget.is_deleted,
          }
        : null,
    }
    setPendingTexts((list) => [...list, pending])
    setText('')
    setReplyTo(null)
    stopTyping()
    sendMessage.mutate(
      { roomId: activeId, content: body, replyToMessageId },
      {
        onSuccess: () => setPendingTexts((list) => list.filter((p) => p.id !== id)),
        onError: (err: any) => {
          setPendingTexts((list) => list.filter((p) => p.id !== id))
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
                        Online
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
                  {messages.length === 0 && roomPending.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center py-10">
                      <Paragraph variant="muted" className="!text-sm text-gray-400">
                        No messages yet — say hello 👋
                      </Paragraph>
                    </div>
                  ) : (
                    messages.map((msg: ChatMessage, i: number) => {
                      const mine = msg.sender_id === myId
                      // Messages are oldest→newest here; a day-separator sits
                      // before the first message of a day.
                      const prev = messages[i - 1]
                      const showSeparator = !sameDay(prev?.created_at ?? null, msg.created_at)
                      return (
                        <Fragment key={msg.id}>
                          {showSeparator && (
                            <div className="flex items-center gap-3 py-1">
                              <div className="h-px flex-1 bg-gray-200" />
                              <span className="shrink-0 rounded-full bg-white px-3 py-0.5 text-[11px] font-semibold text-gray-500 shadow-sm">
                                {dateSeparatorLabel(msg.created_at)}
                              </span>
                              <div className="h-px flex-1 bg-gray-200" />
                            </div>
                          )}
                          <motion.div
                            variants={msgItemVariants}
                            // Own messages already appeared as the optimistic
                            // clock bubble — re-animating the confirmed one
                            // would flicker, so only peer messages animate in.
                            initial={mine ? false : 'hidden'}
                            data-msg-id={msg.id}
                            className={`group flex flex-col ${mine ? 'items-end' : 'items-start'}`}
                          >
                            <div className={`flex max-w-[75%] items-center gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                              <div
                                className={`min-w-0 rounded-2xl px-4 py-3 transition-shadow ${mine
                                  ? 'rounded-tr-sm bg-primary text-white'
                                  : 'rounded-tl-sm bg-white text-ink'
                                  } ${highlightId === msg.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                              >
                                {msg.is_deleted ? (
                                  <Paragraph
                                    className={`flex items-center gap-1.5 !text-sm italic ${mine ? 'text-white/70' : 'text-gray-400'}`}
                                  >
                                    <Trash2 size={13} /> This message was deleted
                                  </Paragraph>
                                ) : (
                                  <>
                                    {msg.reply_to && (
                                      <button
                                        type="button"
                                        onClick={() => msg.reply_to && scrollToMessage(msg.reply_to.id)}
                                        className={`mb-2 w-full rounded-lg border-l-2 px-2.5 py-1.5 text-left transition-opacity hover:opacity-80 ${mine ? 'border-white/60 bg-white/15' : 'border-primary bg-gray-100'}`}
                                      >
                                        <p className={`text-[11px] font-bold ${mine ? 'text-white' : 'text-primary'}`}>{replyAuthor(msg.reply_to.sender_id)}</p>
                                        <p className={`truncate text-[11px] ${mine ? 'text-white/80' : 'text-gray-500'}`}>{replyPreviewText(msg.reply_to)}</p>
                                      </button>
                                    )}
                                    {msg.message_type === 'AUDIO' && msg.file_url ? (
                                      <AudioPlayer src={msg.file_url} content={msg.content} seed={msg.id} mine={mine} />
                                    ) : msg.message_type === 'IMAGE' && msg.file_url ? (
                                      // Image attachment — click opens the original.
                                      <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="block">
                                        <img
                                          src={msg.file_url}
                                          alt={msg.file_name ?? 'Image'}
                                          loading="lazy"
                                          className="max-h-[260px] max-w-[220px] rounded-lg object-cover"
                                        />
                                      </a>
                                    ) : (
                                      <>
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
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                              {!msg.is_deleted && (
                                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                  <button
                                    onClick={() => setReplyTo(msg)}
                                    title="Reply"
                                    className="text-gray-400 hover:text-primary"
                                  >
                                    <Reply size={15} />
                                  </button>
                                  {mine && (
                                    <button
                                      onClick={() => handleDelete(msg)}
                                      title="Delete"
                                      className="text-gray-400 hover:text-red-500"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            <div
                              className={`mt-1 flex items-center gap-1 ${mine ? 'flex-row-reverse' : ''
                                }`}
                            >
                              <span className="text-[10px] text-black">
                                {formatMessageTime(msg.created_at)}
                              </span>
                              {mine && !msg.is_deleted && (
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
                        </Fragment>
                      )
                    })
                  )}

                  {/* Optimistic bubbles (voice + text): shown the instant you hit
                      send, with a clock tick while in flight. Removed once the
                      real message lands. */}
                  {roomPending.map((p) => {
                    const quote =
                      p.kind === 'audio' ? p.audio.replyTo : p.kind === 'text' ? p.text.replyTo : p.file.replyTo
                    return (
                      <motion.div
                        key={p.id}
                        variants={msgItemVariants}
                        className="group flex flex-col items-end"
                      >
                        <div className="flex max-w-[75%] items-center gap-2 flex-row-reverse">
                          <div className="min-w-0 rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-white">
                            {quote && (
                              <div className="mb-2 w-full rounded-lg border-l-2 border-white/60 bg-white/15 px-2.5 py-1.5 text-left">
                                <p className="text-[11px] font-bold text-white">
                                  {replyAuthor(quote.sender_id)}
                                </p>
                                <p className="truncate text-[11px] text-white/80">
                                  {replyPreviewText(quote)}
                                </p>
                              </div>
                            )}
                            {p.kind === 'audio' ? (
                              <AudioPlayer
                                src={p.audio.src}
                                meta={{ d: p.audio.duration, w: p.audio.peaks }}
                                seed={p.audio.id}
                                mine
                                uploadState={p.audio.status}
                                onRetry={() => retryAudio(p.audio.id)}
                              />
                            ) : p.kind === 'text' ? (
                              <Paragraph className="!text-sm leading-relaxed text-white">
                                {p.text.content}
                              </Paragraph>
                            ) : p.file.kind === 'IMAGE' ? (
                              <div className="relative">
                                <img
                                  src={p.file.previewUrl}
                                  alt={p.file.file.name}
                                  className="max-h-[260px] max-w-[220px] rounded-lg object-cover opacity-80"
                                />
                                {p.file.status === 'uploading' && (
                                  <span className="absolute inset-0 m-auto h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                )}
                              </div>
                            ) : (
                              <div className="flex min-w-[200px] items-center gap-3 rounded-xl bg-white px-3 py-2">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                                  {p.file.status === 'uploading' ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                                  ) : (
                                    <FileText size={14} className="text-blue-600" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-semibold text-ink">{p.file.file.name}</p>
                                  <p className="text-[10px] text-gray-400">
                                    {p.file.status === 'uploading' ? 'Uploading…' : 'Failed'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center gap-1 flex-row-reverse">
                          <span className="text-[10px] text-black">
                            {formatMessageTime(p.createdAt)}
                          </span>
                          {p.kind === 'audio' && p.audio.status === 'error' ? (
                            <span className="text-[10px] font-semibold text-red-500">
                              Not sent
                            </span>
                          ) : p.kind === 'file' && p.file.status === 'error' ? (
                            <button
                              onClick={() => retryFile(p.file.id)}
                              className="text-[10px] font-semibold text-red-500 hover:underline"
                            >
                              Not sent — Retry
                            </button>
                          ) : (
                            // Clock tick while the message is still being sent.
                            <Clock size={12} className="text-gray-400" />
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}

              {/* Typing indicator — last child so it sits at the bottom (newest). */}
              {peerTyping && !chatLoading && (
                <div className="flex items-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <motion.div
              className="shrink-0 border-t border-gray-200 px-6 py-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            >
              {replyTo && (
                <div className="mb-2 flex items-center gap-3 rounded-xl border-l-4 border-primary bg-white px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-primary">
                      Replying to {replyAuthor(replyTo.sender_id)}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {replyPreviewText(replyTo)}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyTo(null)}
                    title="Cancel reply"
                    className="shrink-0 text-gray-400 hover:text-primary"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                {recorder.isRecording ? (
                  <>
                    <button
                      onClick={recorder.cancel}
                      title="Cancel recording"
                      className="shrink-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="flex flex-1 items-center gap-2">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                      <span className="text-sm tabular-nums text-ink">{formatDuration(recorder.elapsed)}</span>
                      {/* Live waveform: bars rise and fall with your voice. */}
                      <div className="flex h-8 min-w-0 flex-1 items-center justify-end gap-[2px] overflow-hidden">
                        {recorder.waveform.length === 0 ? (
                          <span className="text-xs text-gray-400">Recording…</span>
                        ) : (
                          recorder.waveform.map((h, i) => (
                            <span
                              key={i}
                              className="w-[3px] shrink-0 rounded-full bg-primary/70"
                              style={{ height: `${Math.max(10, h)}%` }}
                            />
                          ))
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleSendAudio}
                      disabled={sendAudioMessage.isPending}
                      title="Send voice message"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      <Send size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="relative shrink-0" ref={emojiWrapRef}>
                      {emojiOpen && <EmojiPicker onSelect={insertEmoji} />}
                      <button
                        type="button"
                        onClick={() => setEmojiOpen((o) => !o)}
                        title="Emoji"
                        className={`transition-colors ${emojiOpen ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
                      >
                        😊
                      </button>
                    </div>
                    <div className="relative shrink-0" ref={attachWrapRef}>
                      {attachOpen && (
                        <div className="absolute bottom-full left-0 z-50 mb-2 w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-xl">
                          <button
                            type="button"
                            onClick={() => pickAttachment('IMAGE')}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink hover:bg-gray-50"
                          >
                            <ImageIcon size={16} className="text-primary" />
                            Image
                          </button>
                          <button
                            type="button"
                            onClick={() => pickAttachment('PDF')}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink hover:bg-gray-50"
                          >
                            <FileText size={16} className="text-red-500" />
                            Document (PDF)
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setAttachOpen((o) => !o)}
                        title="Attach (image or PDF, max 5 MB)"
                        className={`transition-colors ${attachOpen ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
                      >
                        <Paperclip size={18} />
                      </button>
                    </div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelected('IMAGE', e)}
                    />
                    <input
                      ref={docInputRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileSelected('PDF', e)}
                    />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder={`Type your message to ${roomName(active)}...`}
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value)
                        notifyTyping()
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend()
                      }}
                      className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-gray-400"
                    />
                    {text.trim() ? (
                      <button
                        onClick={handleSend}
                        disabled={sendMessage.isPending}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        <Send size={15} />
                      </button>
                    ) : (
                      <button
                        onClick={handleStartRecording}
                        title="Record voice message"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-opacity hover:opacity-90"
                      >
                        <Mic size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete message"
        message="This message will be deleted for everyone in this chat."
        confirmLabel="Delete"
        confirmVariant="outline-danger"
        isLoading={deleteMessage.isPending}
      />
    </div>
  )
}
