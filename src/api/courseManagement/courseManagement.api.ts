import { supabase } from '@/config/supabase'
import type { CourseApprovalStatus, CoursesAnalytics } from '@/features/courses/types'

export type CourseListRow = {
  id: string
  title: string
  coverImage: string | null
  facultyId: string
  facultyName: string
  category: string
  price: number
  priceDisplay: string
  status: CourseApprovalStatus
  isDraft: boolean
  studentsCount: number
  revenueDisplay: string
  validity: string
  validityDisplay: string
}

export type CourseDetail = {
  id: string
  title: string
  facultyName: string
  category: string
  description: string
  priceDisplay: string
  finalPriceDisplay: string
  hasDiscount: boolean
  status: CourseApprovalStatus
  postedOnDisplay: string
  coverImage: string | null
  introVideoAssetId: string | null
  videoCount: number
  pdfCount: number
  testCount: number
  /** Average learner rating, 0–5 (courses.avg_rating) */
  avgRating: number
  /** Number of reviews the average is based on (courses.total_reviews) */
  totalReviews: number
}

export type CourseContentItem = {
  id: string
  item_type: 'folder' | 'material'
  title: string
  sort_order: number
  // Folder-only
  total_video?: number
  total_test?: number
  total_notes?: number
  duration?: number | null
  // Material-only
  type?: 'VIDEO' | 'PDF' | 'IMAGE' | 'NOTES' | 'LINK' | 'TEST'
  file_url?: string | null
  external_url?: string | null
  file_size?: number | null
  duration_sec?: number | null
  video_asset_id?: string | null
  video_cover_img?: string | null
  video_uploading_status?: string | null
  material_status?: string | null
}

export type CoursesListPagination = {
  total: number
  total_pages: number
  current_page: number
  limit: number
  has_next: boolean
  has_prev: boolean
}

export type CoursesListResponse = {
  data: CourseListRow[]
  pagination: CoursesListPagination
}

export type CourseFilterOptions = {
  categories: string[]
  faculty: { id: string; name: string }[]
}

export type CourseSelectOption = {
  id: string
  name: string
}

const formatCurrency = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatRevenue = (amount: number): string => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`
  return formatCurrency(amount)
}

const formatValidity = (raw: string | null | undefined): string => {
  const value = (raw ?? '').trim()
  if (!value) return '—'
  if (value.toLowerCase() === 'lifetime') return 'Lifetime'
  const months = Number(value)
  if (Number.isFinite(months)) return `${months} ${months === 1 ? 'month' : 'months'}`
  return value
}

const growthDisplay = (percent: number): string => {
  const arrow = percent >= 0 ? '↑' : '↓'
  return `${arrow} ${Math.abs(percent)}% from last month`
}

const fromDbCourseStatus = (raw: string | null | undefined): CourseApprovalStatus => {
  const upper = (raw ?? 'PENDING').toUpperCase()
  if (
    upper === 'APPROVED' ||
    upper === 'PENDING' ||
    upper === 'REJECTED' ||
    upper === 'RESUBMIT'
  ) {
    return upper as CourseApprovalStatus
  }
  return 'PENDING'
}

export const courseManagementFunctions = {
  getCourseManagementAnalytics: async (): Promise<CoursesAnalytics> => {
    try {
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

      const baseQuery = () =>
        supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })
          .eq('is_deleted', false)
          .eq('is_draft', false)

      const [
        { count: totalCourses, error: totalError },
        { count: thisMonthCount, error: thisMonthError },
        { count: lastMonthCount, error: lastMonthError },
        { count: pendingCount, error: pendingError },
        { count: activeCount, error: activeError },
        { count: rejectedCount, error: rejectedError },
      ] = await Promise.all([
        baseQuery(),
        baseQuery().gte('created_at', thisMonthStart),
        baseQuery().gte('created_at', lastMonthStart).lt('created_at', thisMonthStart),
        baseQuery().eq('status', 'PENDING'),
        baseQuery().eq('status', 'APPROVED'),
        baseQuery().eq('status', 'REJECTED'),
      ])

      if (totalError) throw new Error(totalError.message)
      if (thisMonthError) throw new Error(thisMonthError.message)
      if (lastMonthError) throw new Error(lastMonthError.message)
      if (pendingError) throw new Error(pendingError.message)
      if (activeError) throw new Error(activeError.message)
      if (rejectedError) throw new Error(rejectedError.message)

      const total = totalCourses ?? 0
      const last = lastMonthCount ?? 0
      const current = thisMonthCount ?? 0
      const growthPercent =
        last > 0
          ? parseFloat((((current - last) / last) * 100).toFixed(1))
          : current > 0
            ? 100
            : 0

      const active = activeCount ?? 0
      const engagementRate = total > 0 ? Math.round((active / total) * 100) : 0

      return {
        totalCourses: total,
        growth: { percent: growthPercent, display: growthDisplay(growthPercent) },
        pendingApproval: pendingCount ?? 0,
        activeCourses: active,
        engagementRate,
        engagementDisplay: `${engagementRate}% Engagement rate`,
        rejectedCourses: rejectedCount ?? 0,
        rejectedDisplay: 'Policy violations',
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to load course analytics'
      throw new Error(message)
    }
  },

  getCourseFilterOptions: async (): Promise<CourseFilterOptions> => {
    try {
      const [{ data: categories, error: catError }, { data: faculty, error: facultyError }] =
        await Promise.all([
          supabase
            .from('courses')
            .select('category')
            .eq('is_deleted', false)
            .eq('is_draft', false)
            .not('category', 'is', null),
          supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .eq('role', 'FACULTY')
            .order('first_name', { ascending: true }),
        ])

      if (catError) throw new Error(catError.message)
      if (facultyError) throw new Error(facultyError.message)

      return {
        categories: Array.from(
          new Set((categories ?? []).map((row) => row.category).filter(Boolean) as string[]),
        ).sort(),
        faculty: (faculty ?? []).map((row) => ({
          id: row.id,
          name: [row.first_name, row.last_name].filter(Boolean).join(' ') || 'Unknown',
        })),
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to load course filter options'
      throw new Error(message)
    }
  },

  getCourseSelectOptions: async (): Promise<CourseSelectOption[]> => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('is_deleted', false)
        .eq('is_draft', false)
        .order('title', { ascending: true })

      if (error) throw new Error(error.message)

      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.title?.trim() || 'Untitled course',
      }))
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to load courses'
      throw new Error(message)
    }
  },

  getAllCourses: async ({
    page = 1,
    limit = 10,
    search = '',
    category,
    facultyId,
    price,
    status,
  }: {
    page?: number
    limit?: number
    search?: string
    category?: string | 'all'
    facultyId?: string | 'all'
    price?: 'any' | 'free' | 'paid'
    status?: CourseApprovalStatus | 'all'
  }): Promise<CoursesListResponse> => {
    try {
      const from = (page - 1) * limit
      const to = from + limit - 1

      // 1. Base query
      let query = supabase
        .from('courses')
        .select(
          `
          id,
          title,
          cover_image,
          category,
          status,
          is_draft,
          price,
          final_price,
          validity,
          faculty_id,
          faculty:profiles!courses_faculty_id_fkey (
            id,
            first_name,
            last_name
          )
        `,
          { count: 'exact' },
        )
        .eq('is_deleted', false)
        .eq('is_draft', false)

      // 2. Filters — skip if 'all' / 'any' (before range so count + pagination are correct)
      if (category && category !== 'all') query = query.eq('category', category)
      if (facultyId && facultyId !== 'all') query = query.eq('faculty_id', facultyId)
      if (status && status !== 'all') query = query.eq('status', status)
      if (price && price !== 'any') {
        if (price === 'free') query = query.or('final_price.eq.0,price.eq.0')
        else if (price === 'paid') query = query.gt('final_price', 0)
      }

      // 3. Search
      if (search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`)
      }

      query = query.order('created_at', { ascending: false }).range(from, to)

      const { data: courses, error, count } = await query
      if (error) throw new Error(error.message)

      if (!courses || courses.length === 0) {
        return {
          data: [],
          pagination: {
            total: 0,
            total_pages: 0,
            current_page: page,
            limit,
            has_next: false,
            has_prev: false,
          },
        }
      }

      // 4. Enrollments — per-course students + revenue
      const courseIds = courses.map((course) => course.id)

      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('course_id, student_id, amount_paid')
        .in('course_id', courseIds)

      if (enrollError) throw new Error(enrollError.message)

      // 5. Build final result
      const data: CourseListRow[] = courses.map((course) => {
        const facultyRaw = course.faculty
        const facultyProfile = Array.isArray(facultyRaw) ? facultyRaw[0] : facultyRaw
        const facultyName =
          [facultyProfile?.first_name, facultyProfile?.last_name].filter(Boolean).join(' ') ||
          'Unknown'
        const courseEnrollments = (enrollments ?? []).filter((e) => e.course_id === course.id)
        const studentsCount = new Set(courseEnrollments.map((e) => e.student_id)).size
        const revenue = courseEnrollments.reduce((sum, e) => sum + (e.amount_paid ?? 0), 0)
        const priceAmount = course.final_price ?? course.price ?? 0
        const rawStatus = course.status as string | null

        return {
          id: course.id,
          title: course.title ?? '',
          coverImage: course.cover_image ?? null,
          facultyId: course.faculty_id,
          facultyName,
          category: course.category ?? '',
          price: priceAmount,
          priceDisplay: formatCurrency(priceAmount),
          status: fromDbCourseStatus(rawStatus),
          isDraft: course.is_draft === true,
          studentsCount,
          revenueDisplay: formatRevenue(revenue),
          validity: (course.validity as string | null) ?? '',
          validityDisplay: formatValidity(course.validity as string | null),
        }
      })

      const totalPages = Math.ceil((count ?? 0) / limit)

      return {
        data,
        pagination: {
          total: count ?? 0,
          total_pages: totalPages,
          current_page: page,
          limit,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  getCourseDetail: async (courseId: string): Promise<CourseDetail> => {
    try {
      const { data: course, error } = await supabase
        .from('courses')
        .select(
          `
          id,
          title,
          description,
          category,
          status,
          price,
          final_price,
          cover_image,
          video_asset_id,
          avg_rating,
          total_reviews,
          created_at,
          faculty:profiles!courses_faculty_id_fkey (
            first_name,
            last_name
          )
        `,
        )
        .eq('id', courseId)
        .single()

      if (error) throw new Error(error.message)

      // Material counts (video / pdf / test) — derived from course_materials by type.
      const { data: materials, error: materialsError } = await supabase
        .from('course_materials')
        .select('type')
        .eq('course_id', courseId)
        .eq('is_deleted', false)

      if (materialsError) throw new Error(materialsError.message)

      const videoCount = (materials ?? []).filter((m) => m.type === 'VIDEO').length
      const pdfCount = (materials ?? []).filter((m) => m.type === 'PDF').length
      const testCount = (materials ?? []).filter((m) => m.type === 'TEST').length

      const facultyRaw = course.faculty
      const facultyProfile = Array.isArray(facultyRaw) ? facultyRaw[0] : facultyRaw
      const facultyName =
        [facultyProfile?.first_name, facultyProfile?.last_name].filter(Boolean).join(' ') ||
        'Unknown'
      const originalPrice = course.price ?? 0
      const finalPrice = course.final_price ?? originalPrice
      const postedOnDisplay = course.created_at
        ? new Date(course.created_at).toLocaleDateString('en-GB')
        : '—'

      return {
        id: course.id,
        title: course.title ?? '',
        facultyName,
        category: course.category ?? '',
        description: course.description ?? '',
        priceDisplay: formatCurrency(originalPrice),
        finalPriceDisplay: formatCurrency(finalPrice),
        hasDiscount: finalPrice < originalPrice,
        status: fromDbCourseStatus(course.status as string | null),
        postedOnDisplay,
        coverImage: course.cover_image ?? null,
        introVideoAssetId: course.video_asset_id ?? null,
        videoCount,
        pdfCount,
        testCount,
        avgRating: Number(course.avg_rating ?? 0),
        totalReviews: course.total_reviews ?? 0,
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  // Read-only academic structure: folders + materials at a given level.
  getCourseContent: async (
    courseId: string,
    parentId: string | null = null,
  ): Promise<CourseContentItem[]> => {
    try {
      let folderQuery = supabase
        .from('course_folders')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_deleted', false)
        .order('sort_order', { ascending: true })

      let materialQuery = supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_deleted', false)
        .order('sort_order', { ascending: true })

      if (parentId === null) {
        folderQuery = folderQuery.is('parent_id', null)
        materialQuery = materialQuery.is('folder_id', null)
      } else {
        folderQuery = folderQuery.eq('parent_id', parentId)
        materialQuery = materialQuery.eq('folder_id', parentId)
      }

      const [{ data: folders, error: folderError }, { data: materials, error: matError }] =
        await Promise.all([folderQuery, materialQuery])

      if (folderError) throw new Error(folderError.message)
      if (matError) throw new Error(matError.message)

      const taggedFolders = (folders ?? []).map(
        (f): CourseContentItem => ({ ...f, item_type: 'folder' }),
      )
      const taggedMaterials = (materials ?? []).map(
        (m): CourseContentItem => ({ ...m, item_type: 'material' }),
      )

      return [...taggedFolders, ...taggedMaterials].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      )
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  updateCoursesStatus: async (
    courseIds: string[],
    status: CourseApprovalStatus,
    options?: { rejectReason?: string },
  ) => {
    try {
      if (courseIds.length === 0) return { success: true }

      const updates: Record<string, unknown> = { status }

      if (status === 'REJECTED') {
        updates.rejection_reason = options?.rejectReason ?? null
      }

      if (status === 'APPROVED') {
        updates.rejection_reason = null
      }

      const { data: updatedCourses, error } = await supabase
        .from('courses')
        .update(updates)
        .in('id', courseIds)
        .select('id, title, faculty_id')

      if (error) throw new Error(error.message)

      // Notify each course's faculty about the status change.
      const notifications = (updatedCourses ?? [])
        .filter((course) => course.faculty_id)
        .map((course) => {
          const courseTitle = course.title ?? 'your course'
          let title: string
          let body: string

          switch (status) {
            case 'APPROVED':
              title = 'Course approved'
              body = `Your course "${courseTitle}" has been approved and is now live.`
              break
            case 'REJECTED':
              title = 'Course rejected'
              body = options?.rejectReason
                ? `Your course "${courseTitle}" was rejected. Reason: ${options.rejectReason}`
                : `Your course "${courseTitle}" was rejected.`
              break
            case 'RESUBMIT':
              title = 'Course needs changes'
              body = `Your course "${courseTitle}" requires changes before it can be approved.`
              break
            default:
              title = 'Course status updated'
              body = `The status of your course "${courseTitle}" has been updated.`
          }

          return {
            user_id: course.faculty_id,
            type: 'COURSE' as const,
            title,
            body,
            data: { course_id: course.id, status },
            is_admin: false,
          }
        })

      if (notifications.length > 0) {
        const { error: notifyError } = await supabase.from('notifications').insert(notifications)
        if (notifyError) throw new Error(notifyError.message)
      }

      return { success: true }
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  deleteCourses: async (courseIds: string[]) => {
    try {
      if (courseIds.length === 0) return { success: true }

      const { error } = await supabase
        .from('courses')
        .update({ is_deleted: true })
        .in('id', courseIds)

      if (error) throw new Error(error.message)

      return { success: true }
    } catch (error: any) {
      throw new Error(error.message)
    }
  },
}


