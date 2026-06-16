import { supabase } from '@/config/supabase'
import type { CourseApprovalStatus, CoursesAnalytics } from '@/features/courses/types'

export type CourseListRow = {
  id: string
  title: string
  facultyId: string
  facultyName: string
  category: string
  price: number
  priceDisplay: string
  status: CourseApprovalStatus
  isDraft: boolean
  studentsCount: number
  revenueDisplay: string
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

const formatCurrency = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatRevenue = (amount: number): string => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`
  return formatCurrency(amount)
}

const growthDisplay = (percent: number): string => {
  const arrow = percent >= 0 ? '↑' : '↓'
  return `${arrow} ${Math.abs(percent)}% from last month`
}

const toDbCourseStatus = (status: CourseApprovalStatus): string =>
  status === 'RESUBMIT' ? 'resubmit' : status

const fromDbCourseStatus = (raw: string | null | undefined): CourseApprovalStatus => {
  const value = (raw ?? 'PENDING').toLowerCase()
  if (value === 'resubmit') return 'RESUBMIT'
  const upper = value.toUpperCase()
  if (upper === 'APPROVED' || upper === 'PENDING' || upper === 'REJECTED') {
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
          category,
          status,
          is_draft,
          price,
          final_price,
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
        .order('created_at', { ascending: false })
        .range(from, to)

      // 2. Filters — skip if 'all' / 'any'
      if (category && category !== 'all') query = query.eq('category', category)
      if (facultyId && facultyId !== 'all') query = query.eq('faculty_id', facultyId)
      if (status && status !== 'all') query = query.eq('status', toDbCourseStatus(status))
      if (price && price !== 'any') {
        if (price === 'free') query = query.or('final_price.eq.0,price.eq.0')
        else if (price === 'paid') query = query.gt('final_price', 0)
      }

      // 3. Search
      if (search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`)
      }

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
          facultyId: course.faculty_id,
          facultyName,
          category: course.category ?? '',
          price: priceAmount,
          priceDisplay: formatCurrency(priceAmount),
          status: fromDbCourseStatus(rawStatus),
          isDraft: course.is_draft === true,
          studentsCount,
          revenueDisplay: formatRevenue(revenue),
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

  updateCoursesStatus: async (
    courseIds: string[],
    status: CourseApprovalStatus,
    options?: { rejectReason?: string },
  ) => {
    try {
      if (courseIds.length === 0) return { success: true }

      const updates: Record<string, unknown> = { status: toDbCourseStatus(status) }

      if (status === 'REJECTED') {
        updates.rejection_reason = options?.rejectReason ?? null
      }

      if (status === 'APPROVED') {
        updates.rejection_reason = null
      }

      const { error } = await supabase.from('courses').update(updates).in('id', courseIds)

      if (error) throw new Error(error.message)

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


