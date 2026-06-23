import { supabase } from '@/config/supabase'
import type { AnnouncementSort, AnnouncementTab } from '@/features/announcements/types'

export const COURSE_COVERS_BUCKET = 'course-covers'

export type AnnouncementListRow = {
  id: string
  title: string
  audience: string | null
  course_id: string | null
  created_at: string
  updated_at: string
  time_period: { start_date?: string; end_date?: string } | string | null
  is_draft: boolean
  is_deleted: boolean
  published: string | null
  content?: string
  image_url?: string | null
  courses?: { title: string } | { title: string }[] | null
}

export type AnnouncementListPagination = {
  total: number
  total_pages: number
  current_page: number
  limit: number
  has_next: boolean
  has_prev: boolean
}

export type AnnouncementListResponse = {
  data: AnnouncementListRow[]
  pagination: AnnouncementListPagination
}

export type CreateAnnouncementPayload = {
  title: string
  audience: string
  course_id: string | null
  content: string
  time_period: { start_date?: string; end_date?: string } | null
  image_url: string | null
  is_draft: boolean
  is_deleted: boolean
  published: string | null
}

function resolveImageExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName

  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }

  return mimeMap[file.type] ?? 'jpg'
}

function mapStorageUploadError(message: string): string {
  if (message.includes('row-level security') || message.includes('Unauthorized')) {
    return 'Banner upload was blocked by storage permissions. Run the announcement-images storage policies in Supabase, then try again.'
  }
  if (message.includes('Bucket not found')) {
    return `Storage bucket "${COURSE_COVERS_BUCKET}" was not found in Supabase.`
  }
  return message
}

export const announcementApi = {
  getAnnouncements: async ({
    page = 1,
    limit = 10,
    tab = 'all',
    sort = 'date-desc',
  }: {
    page?: number
    limit?: number
    tab?: AnnouncementTab
    sort?: AnnouncementSort
  }): Promise<AnnouncementListResponse> => {
    try {
      const from = (page - 1) * limit
      const to = from + limit - 1

      let query = supabase
        .from('announcements')
        .select(
          `
          id,
          title,
          audience,
          course_id,
          created_at,
          updated_at,
          time_period,
          is_draft,
          is_deleted,
          published,
          courses ( title )
        `,
          { count: 'exact' },
        )
        .eq('is_deleted', false)

      if (tab === 'drafts') {
        query = query.eq('is_draft', true)
      } else {
        query = query.eq('is_draft', false)
      }

      query = query
        .order('created_at', { ascending: sort === 'date-asc' })
        .range(from, to)

      const { data: announcements, error, count } = await query
      if (error) throw new Error(error.message)

      const total = count ?? 0
      const totalPages = Math.max(0, Math.ceil(total / limit))

      if (!announcements || announcements.length === 0) {
        return {
          data: [],
          pagination: {
            total: 0,
            total_pages: totalPages,
            current_page: page,
            limit,
            has_next: false,
            has_prev: false,
          },
        }
      }

      return {
        data: announcements as AnnouncementListRow[],
        pagination: {
          total,
          total_pages: totalPages,
          current_page: page,
          limit,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load announcements'
      throw new Error(message)
    }
  },

  deleteAnnouncement: async (id: string): Promise<{ success: true }> => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_deleted: true })
        .eq('id', id)

      if (error) throw new Error(error.message)
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete announcement'
      throw new Error(message)
    }
  },

  uploadAnnouncementBanner: async (file: File): Promise<string> => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error('You must be signed in to upload a banner image.')
    }

    const extension = resolveImageExtension(file)
    const path = `${crypto.randomUUID()}.${extension}`

    const { data, error } = await supabase.storage
      .from(COURSE_COVERS_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        contentType: file.type || `image/${extension === 'jpg' ? 'jpeg' : extension}`,
        upsert: false,
      })

    if (error) throw new Error(mapStorageUploadError(error.message))

    const { data: publicUrl } = supabase.storage
      .from(COURSE_COVERS_BUCKET)
      .getPublicUrl(data.path)

    return publicUrl.publicUrl
  },

  createAnnouncement: async (payload: CreateAnnouncementPayload) => {
    const { data, error } = await supabase
      .from('announcements')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return data
  },
}
