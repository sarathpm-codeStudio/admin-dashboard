import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/store/authStore'
import { encryptMessage, decryptMessageSafe } from '@/utils/chatEncryption'

// Read the user id on every call so it reflects the current admin.
const getCurrentUserId = () => useAuthStore.getState().user?.id

export type ChatRoomType = 'DIRECT' | 'GROUP'

// The other participant in a DIRECT room (null for GROUP rooms).
export interface ChatPeer {
  id: string
  name: string
  avatar_url: string | null
  role: string | null
}

// Compact preview of a room's most recent message, shown in the list.
export interface ChatLastMessage {
  id: string
  content: string | null
  message_type: string
  sender_id: string
  created_at: string | null
  is_deleted: boolean
}

// One row in the chat list: the room plus everything the list needs to render
// it (peer for DIRECT, last message preview, and this user's unread count).
export interface ChatRoomSummary {
  id: string
  type: ChatRoomType
  name: string | null
  course_id: string | null
  last_message_at: string | null
  last_message: ChatLastMessage | null
  peer: ChatPeer | null
  unread_count: number
}

const peerName = (p: any): string =>
  [p?.first_name, p?.last_name].filter(Boolean).join(' ').trim()

// Compact preview of the message a reply quotes (decrypted for rendering).
export interface ChatReplyPreview {
  id: string
  sender_id: string
  message_type: string
  content: string | null
  is_deleted: boolean
}

// A single message inside a room, as stored in chat_messages.
export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  message_type: string
  content: string | null
  file_url: string | null
  file_name: string | null
  file_size: number | null
  status: string
  created_at: string | null
  // Soft-delete flag: a deleted message is kept as a "This message was
  // deleted" tombstone rather than removed from the thread.
  is_deleted: boolean
  // The message this one replies to (null when it isn't a reply). `reply_to`
  // is the resolved, decrypted preview of that quoted message.
  reply_to_message_id: string | null
  reply_to?: ChatReplyPreview | null
}

// Resolve the quoted-message preview for any rows that reply to another
// message, mutating each row's `reply_to` in place. One batched lookup.
export const attachReplyPreviews = async (
  rows: ChatMessage[],
): Promise<void> => {
  const replyIds = Array.from(
    new Set(rows.map((r) => r.reply_to_message_id).filter(Boolean) as string[]),
  )
  if (!replyIds.length) return

  const { data } = await supabase
    .from('chat_messages')
    .select('id, sender_id, message_type, content, is_deleted')
    .in('id', replyIds)

  const byId = new Map<string, ChatReplyPreview>()
  await Promise.all(
    (data ?? []).map(async (m: any) => {
      byId.set(m.id, {
        id: m.id,
        sender_id: m.sender_id,
        message_type: m.message_type,
        // A quote of a deleted message has no content to show.
        content: m.is_deleted ? null : await decryptMessageSafe(m.content),
        is_deleted: !!m.is_deleted,
      })
    }),
  )

  for (const r of rows) {
    if (r.reply_to_message_id)
      r.reply_to = byId.get(r.reply_to_message_id) ?? null
  }
}

// One page of a room's history: messages in ascending (oldest→newest) order
// plus a cursor pointing at the next, older batch (undefined when at the start).
export interface ChatMessagePage {
  messages: ChatMessage[]
  nextCursor?: string
}

export const MESSAGES_PAGE_SIZE = 25

// Max attachment size for chat uploads (5 MB).
export const CHAT_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024

// One file inside an attachment message (image / PDF). A message can carry
// several of these — an album — stored (encrypted) as JSON in `content`.
export interface ChatAttachment {
  url: string
  name: string
  size: number
}

export const chatFunctions = {
  // A page of a room's messages, newest-first under the hood. Pass the previous
  // page's `nextCursor` as `before` to walk further back in time. Returned
  // messages are flipped to ascending order so they render top→bottom.
  getMessagesPage: async (
    roomId: string,
    opts?: { before?: string; limit?: number },
  ): Promise<ChatMessagePage> => {
    try {
      const limit = opts?.limit ?? MESSAGES_PAGE_SIZE

      // Deleted messages are kept (as tombstones), so we don't filter them out.
      let query = supabase
        .from('chat_messages')
        .select(
          'id, room_id, sender_id, message_type, content, file_url, file_name, file_size, status, created_at, is_deleted, reply_to_message_id',
        )
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(limit)

      // Older than the oldest message we already have.
      if (opts?.before) query = query.lt('created_at', opts.before)

      const { data, error } = await query
      if (error) throw new Error(error.message)

      const batch = (data ?? []) as ChatMessage[]
      // Decrypt each message's content back to plaintext for rendering; a
      // deleted message has nothing to show, so skip it.
      await Promise.all(
        batch.map(async row => {
          row.content = row.is_deleted
            ? null
            : await decryptMessageSafe(row.content)
        }),
      )
      // Resolve the quoted preview for any (non-deleted) replies in this page.
      await attachReplyPreviews(batch.filter(r => !r.is_deleted))
      // A full page means there may be more history behind it; the cursor is
      // the oldest row in this batch (last one, since the batch is newest-first).
      const nextCursor =
        batch.length === limit ? batch[batch.length - 1]?.created_at ?? undefined : undefined

      return { messages: batch.reverse(), nextCursor }
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  // Every chat room the current admin belongs to, newest activity first.
  // For DIRECT rooms the other participant is resolved into `peer`; GROUP
  // rooms carry their own `name`. `unread_count` counts messages from other
  // people sent after this user's last read receipt for that room.
  getMyChatRooms: async (): Promise<ChatRoomSummary[]> => {
    try {
      const userId = getCurrentUserId()
      if (!userId) return []

      // Rooms I'm an active member of (skip rooms I left / soft-deleted rooms).
      const { data: memberRows, error: memberErr } = await supabase
        .from('chat_room_members')
        .select(
          'room_id, chat_rooms!inner(id, type, name, course_id, last_message_id, last_message_at, is_deleted)',
        )
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .eq('chat_rooms.is_deleted', false)

      if (memberErr) throw new Error(memberErr.message)

      const rooms = (memberRows ?? [])
        .map((r: any) => r.chat_rooms)
        .filter(Boolean)
      if (rooms.length === 0) return []

      const roomIds = rooms.map((r: any) => r.id)

      // Resolve the "other side" of each DIRECT room → their profile.
      const { data: peerRows, error: peerErr } = await supabase
        .from('chat_room_members')
        .select('room_id, profiles!inner(id, first_name, last_name, avatar_url, role)')
        .in('room_id', roomIds)
        .neq('user_id', userId)
        .eq('is_deleted', false)

      if (peerErr) throw new Error(peerErr.message)

      const peerByRoom = new Map<string, ChatPeer>()
      for (const row of peerRows ?? []) {
        const p = (row as any).profiles
        if (p && !peerByRoom.has((row as any).room_id)) {
          peerByRoom.set((row as any).room_id, {
            id: p.id,
            name: peerName(p),
            avatar_url: p.avatar_url ?? null,
            role: p.role ?? null,
          })
        }
      }

      // Last-message previews, fetched by the ids the rooms point at.
      const lastIds = rooms
        .map((r: any) => r.last_message_id)
        .filter(Boolean)
      const lastByRoom = new Map<string, ChatLastMessage>()
      if (lastIds.length) {
        const { data: msgs, error: msgErr } = await supabase
          .from('chat_messages')
          .select('id, room_id, content, message_type, sender_id, created_at, is_deleted')
          .in('id', lastIds)

        if (msgErr) throw new Error(msgErr.message)
        for (const m of msgs ?? []) {
          lastByRoom.set((m as any).room_id, {
            id: (m as any).id,
            // Decrypt the preview text so the room list is readable; a deleted
            // last message has nothing to show.
            content: (m as any).is_deleted
              ? null
              : await decryptMessageSafe((m as any).content),
            message_type: (m as any).message_type,
            sender_id: (m as any).sender_id,
            created_at: (m as any).created_at,
            is_deleted: !!(m as any).is_deleted,
          })
        }
      }

      // My read receipts → the cutoff for what counts as unread per room.
      const { data: receipts, error: receiptErr } = await supabase
        .from('chat_read_receipts')
        .select('room_id, last_read_at')
        .eq('user_id', userId)
        .in('room_id', roomIds)

      if (receiptErr) throw new Error(receiptErr.message)

      const readByRoom = new Map<string, string>()
      for (const r of receipts ?? []) {
        readByRoom.set((r as any).room_id, (r as any).last_read_at)
      }

      // Unread = messages from other people newer than my last read receipt.
      // One head-count per room, run in parallel.
      const unreadByRoom = new Map<string, number>()
      await Promise.all(
        roomIds.map(async (roomId: string) => {
          let q = supabase
            .from('chat_messages')
            .select('id', { count: 'exact', head: true })
            .eq('room_id', roomId)
            .eq('is_deleted', false)
            .neq('sender_id', userId)

          const lastRead = readByRoom.get(roomId)
          if (lastRead) q = q.gt('created_at', lastRead)

          const { count, error } = await q
          if (error) throw new Error(error.message)
          unreadByRoom.set(roomId, count ?? 0)
        }),
      )

      const summaries: ChatRoomSummary[] = rooms.map((r: any) => ({
        id: r.id,
        type: r.type,
        name: r.name,
        course_id: r.course_id,
        last_message_at: r.last_message_at,
        last_message: lastByRoom.get(r.id) ?? null,
        peer: r.type === 'DIRECT' ? peerByRoom.get(r.id) ?? null : null,
        unread_count: unreadByRoom.get(r.id) ?? 0,
      }))

      // Newest activity first; rooms with no messages yet fall to the bottom.
      return summaries.sort(
        (a, b) =>
          new Date(b.last_message_at ?? 0).getTime() -
          new Date(a.last_message_at ?? 0).getTime(),
      )
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  // Open a 1:1 conversation with another user. Reuses the existing DIRECT
  // room between the two if there is one; otherwise creates the room and adds
  // both participants. Returns the room id and whether it was just created.
  startConversation: async (
    otherUserId: string,
    opts?: { name?: string },
  ): Promise<{ roomId: string; isNew: boolean }> => {
    try {
      const me = useAuthStore.getState().user
      const userId = me?.id
      if (!userId) throw new Error('Not authenticated')
      if (otherUserId === userId)
        throw new Error('Cannot start a conversation with yourself')

      // Label the room with the admin's name so the receiver (whose peer is the
      // admin) has something to show — the admin profile often has no name. On
      // the admin's own side the peer (user) name takes priority over this.
      const roomLabel = opts?.name ?? me?.fullName ?? 'Admin'

      // My existing DIRECT rooms.
      const { data: myRooms, error: myErr } = await supabase
        .from('chat_room_members')
        .select('room_id, chat_rooms!inner(type, is_deleted)')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .eq('chat_rooms.type', 'DIRECT')
        .eq('chat_rooms.is_deleted', false)

      if (myErr) throw new Error(myErr.message)

      const myRoomIds = (myRooms ?? []).map((r: any) => r.room_id)

      // Is the other user a member of any of them? → reuse it.
      if (myRoomIds.length) {
        const { data: shared, error: sharedErr } = await supabase
          .from('chat_room_members')
          .select('room_id')
          .eq('user_id', otherUserId)
          .eq('is_deleted', false)
          .in('room_id', myRoomIds)
          .limit(1)

        if (sharedErr) throw new Error(sharedErr.message)
        if (shared && shared[0])
          return { roomId: shared[0].room_id, isNew: false }
      }

      // None exists → create the room and add both participants.
      const { data: room, error: roomErr } = await supabase
        .from('chat_rooms')
        .insert({ type: 'DIRECT', created_by: userId, name: roomLabel })
        .select('id')
        .single()

      if (roomErr) throw new Error(roomErr.message)

      const { error: memErr } = await supabase
        .from('chat_room_members')
        .insert([
          { room_id: room.id, user_id: userId, is_admin: true },
          { room_id: room.id, user_id: otherUserId },
        ])

      if (memErr) throw new Error(memErr.message)

      return { roomId: room.id, isNew: true }
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  // Send a text message into a room, then point the room at it as its latest
  // message so the list preview and ordering stay in sync.
  sendMessage: async (
    roomId: string,
    content: string,
    replyToMessageId?: string | null,
  ): Promise<ChatMessage> => {
    try {
      const userId = getCurrentUserId()
      if (!userId) throw new Error('Not authenticated')

      const body = content.trim()
      if (!body) throw new Error('Cannot send an empty message')

      // Store ciphertext only — the DB never sees the plaintext message.
      const encryptedBody = await encryptMessage(body)

      const { data: message, error: msgErr } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: userId,
          message_type: 'TEXT',
          content: encryptedBody,
          status: 'sent',
          reply_to_message_id: replyToMessageId ?? null,
        })
        .select(
          'id, room_id, sender_id, message_type, content, file_url, file_name, file_size, status, created_at, is_deleted, reply_to_message_id',
        )
        .single()

      if (msgErr) throw new Error(msgErr.message)

      // Hand the caller back the readable text (the row itself holds ciphertext).
      ;(message as ChatMessage).content = body
      // Resolve its quoted preview too, for callers that render it directly.
      await attachReplyPreviews([message as ChatMessage])

      const { error: roomErr } = await supabase
        .from('chat_rooms')
        .update({
          last_message_id: message.id,
          last_message_at: (message as ChatMessage).created_at,
        })
        .eq('id', roomId)

      if (roomErr) throw new Error(roomErr.message)

      return message as ChatMessage
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  // Send a voice message: upload the recorded blob to the public `chat-media`
  // bucket, then store an AUDIO message pointing at it. The duration + waveform
  // ride (encrypted) in `content` so the player can render without re-decoding.
  sendAudioMessage: async (
    roomId: string,
    blob: Blob,
    opts: { duration: number; peaks: number[]; mimeType: string },
    replyToMessageId?: string | null,
  ): Promise<ChatMessage> => {
    try {
      const userId = getCurrentUserId()
      if (!userId) throw new Error('Not authenticated')

      // Cross-platform naming: .mp3 (in-browser encode) / .m4a (Safari AAC);
      // ogg/webm only remain as last-resort fallbacks for ancient browsers.
      const ext = opts.mimeType.includes('mpeg')
        ? 'mp3'
        : opts.mimeType.includes('mp4')
          ? 'm4a'
          : opts.mimeType.includes('ogg')
            ? 'ogg'
            : 'webm'
      const path = `voice/${roomId}/${crypto.randomUUID()}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('chat-media')
        .upload(path, blob, { contentType: opts.mimeType, upsert: false })
      if (upErr) throw new Error(upErr.message)

      const { data: pub } = supabase.storage.from('chat-media').getPublicUrl(path)

      const meta = JSON.stringify({
        d: Math.max(1, Math.round(opts.duration)),
        w: opts.peaks,
      })
      const encryptedMeta = await encryptMessage(meta)

      const { data: message, error: msgErr } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: userId,
          message_type: 'AUDIO',
          content: encryptedMeta,
          file_url: pub.publicUrl,
          file_name: 'Voice message',
          file_size: blob.size,
          status: 'sent',
          reply_to_message_id: replyToMessageId ?? null,
        })
        .select(
          'id, room_id, sender_id, message_type, content, file_url, file_name, file_size, status, created_at, is_deleted, reply_to_message_id',
        )
        .single()

      if (msgErr) throw new Error(msgErr.message)

      // Hand back the readable meta (the row itself holds ciphertext).
      ;(message as ChatMessage).content = meta
      await attachReplyPreviews([message as ChatMessage])

      const { error: roomErr } = await supabase
        .from('chat_rooms')
        .update({
          last_message_id: message.id,
          last_message_at: (message as ChatMessage).created_at,
        })
        .eq('id', roomId)

      if (roomErr) throw new Error(roomErr.message)

      return message as ChatMessage
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  // Send one or more attachments (all images, or all PDFs) as a SINGLE message
  // — WhatsApp-style albums. Every file is uploaded to the public `chat-media`
  // bucket; the full list is stored (encrypted) in `content` as JSON, and the
  // first file also fills file_url/name/size for the list preview & legacy
  // single-file readers. Size/type are validated here as a last line of
  // defence (the UI validates before uploading too).
  sendFilesMessage: async (
    roomId: string,
    files: File[],
    kind: 'IMAGE' | 'PDF',
    replyToMessageId?: string | null,
  ): Promise<ChatMessage> => {
    try {
      const userId = getCurrentUserId()
      if (!userId) throw new Error('Not authenticated')
      if (!files.length) throw new Error('No files selected')

      for (const file of files) {
        if (file.size > CHAT_ATTACHMENT_MAX_BYTES)
          throw new Error(`"${file.name}" is too large (max 5 MB)`)
        const validType =
          kind === 'IMAGE'
            ? file.type.startsWith('image/')
            : file.type === 'application/pdf'
        if (!validType)
          throw new Error(
            kind === 'IMAGE'
              ? 'Only images can be attached'
              : 'Only PDF documents can be attached',
          )
      }

      // Upload every file, then collect its public URL + metadata.
      const uploaded: ChatAttachment[] = await Promise.all(
        files.map(async (file) => {
          const ext =
            file.name.split('.').pop()?.toLowerCase() ||
            (kind === 'IMAGE' ? 'jpg' : 'pdf')
          const path = `files/${roomId}/${crypto.randomUUID()}.${ext}`
          const { error: upErr } = await supabase.storage
            .from('chat-media')
            .upload(path, file, { contentType: file.type, upsert: false })
          if (upErr) throw new Error(upErr.message)
          const { data: pub } = supabase.storage
            .from('chat-media')
            .getPublicUrl(path)
          return { url: pub.publicUrl, name: file.name, size: file.size }
        }),
      )

      const first = uploaded[0]!
      const meta = JSON.stringify({ files: uploaded })
      const encryptedMeta = await encryptMessage(meta)

      const { data: message, error: msgErr } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: userId,
          message_type: kind,
          content: encryptedMeta,
          file_url: first.url,
          file_name: first.name,
          file_size: first.size,
          status: 'sent',
          reply_to_message_id: replyToMessageId ?? null,
        })
        .select(
          'id, room_id, sender_id, message_type, content, file_url, file_name, file_size, status, created_at, is_deleted, reply_to_message_id',
        )
        .single()

      if (msgErr) throw new Error(msgErr.message)

      // Hand back the readable attachment list (the row holds ciphertext).
      ;(message as ChatMessage).content = meta
      await attachReplyPreviews([message as ChatMessage])

      const { error: roomErr } = await supabase
        .from('chat_rooms')
        .update({
          last_message_id: message.id,
          last_message_at: (message as ChatMessage).created_at,
        })
        .eq('id', roomId)

      if (roomErr) throw new Error(roomErr.message)

      return message as ChatMessage
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  // Soft-delete one of my own messages: flip is_deleted so it renders as a
  // "This message was deleted" tombstone for everyone. Scoped to the sender.
  deleteMessage: async (messageId: string): Promise<void> => {
    try {
      const userId = getCurrentUserId()
      if (!userId) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('chat_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', userId)

      if (error) throw new Error(error.message)
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  // Mark the peer's messages in a room as DELIVERED for the current admin:
  // the recipient's device has received them but hasn't opened the room yet.
  // Only bumps messages still at 'sent' (one tick → two ticks on the sender).
  markRoomDelivered: async (roomId: string): Promise<void> => {
    try {
      const userId = getCurrentUserId()
      if (!userId) return

      const { error } = await supabase
        .from('chat_messages')
        .update({ status: 'delivered', delivered_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .neq('sender_id', userId)
        .eq('status', 'sent')

      if (error) throw new Error(error.message)
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  // Mark a room as read up to now for the current admin (clears its unread
  // badge) AND mark the peer's messages as SEEN (two blue ticks on the
  // sender). Upserts the read receipt and flips any not-yet-seen messages.
  markRoomRead: async (roomId: string): Promise<void> => {
    try {
      const userId = getCurrentUserId()
      if (!userId) return

      const now = new Date().toISOString()

      const { error: receiptErr } = await supabase
        .from('chat_read_receipts')
        .upsert(
          { room_id: roomId, user_id: userId, last_read_at: now },
          { onConflict: 'room_id,user_id' },
        )

      if (receiptErr) throw new Error(receiptErr.message)

      const { error: seenErr } = await supabase
        .from('chat_messages')
        .update({ status: 'seen', seen_at: now })
        .eq('room_id', roomId)
        .neq('sender_id', userId)
        .neq('status', 'seen')

      if (seenErr) throw new Error(seenErr.message)
    } catch (error: any) {
      throw new Error(error.message)
    }
  },
}
