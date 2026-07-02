import { supabase } from '@/config/supabase'

/**
 * Reports & Analytics data layer.
 *
 * Mirrors the aggregation style used in `dashboard.api.ts` and
 * `facultyManagement.api.ts`: raw rows are fetched from Supabase and the
 * counts / sums / growth figures are computed in JS. Admin-only surface, so
 * loading full result sets is acceptable (same pattern as the dashboard).
 */

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const monthBounds = () => {
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return { thisMonthStart, lastMonthStart }
}

/** Period-over-period growth %, rounded to 1 decimal. */
const growthPct = (current: number, previous: number): number => {
  if (previous > 0) {
    return parseFloat((((current - previous) / previous) * 100).toFixed(1))
  }
  return current > 0 ? 100 : 0
}

type DatedAmount = { amount: number; date: string | null }

/** Sum `amount` for rows whose `date` falls in [start, end). */
const sumInRange = (rows: DatedAmount[], start: Date, end?: Date): number =>
  rows.reduce((sum, row) => {
    if (!row.date) return sum
    const d = new Date(row.date)
    if (d >= start && (!end || d < end)) return sum + row.amount
    return sum
  }, 0)

/** Count rows whose `date` falls in [start, end). */
const countInRange = (rows: DatedAmount[], start: Date, end?: Date): number =>
  rows.reduce((count, row) => {
    if (!row.date) return count
    const d = new Date(row.date)
    if (d >= start && (!end || d < end)) return count + 1
    return count
  }, 0)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MetricWithGrowth = {
  amount: number
  growth: number
}

export type ReportsSummary = {
  /** All money collected from students (single + bundle enrollments). */
  grossRevenue: MetricWithGrowth
  /** Admin commission kept by the platform (PLATFORM_FEE rows). */
  platformEarnings: MetricWithGrowth
  /** Total enrollments (single + bundle). */
  totalEnrollments: MetricWithGrowth
  /** Published, approved and live courses. */
  activeCourses: number
}

export type CourseStatusSlice = {
  id: string
  label: string
  count: number
  color: string
}

export type CategoryRevenue = {
  category: string
  amount: number
  /** Share of the total across all returned categories. */
  percent: number
}

export type TopCourseRow = {
  id: string
  title: string
  faculty: string
  category: string
  enrollments: number
  revenue: number
  rating: number
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const reportsAnalyticsFunctions = {
  /** Top KPI row: gross revenue, platform earnings, enrollments, active courses. */
  getReportsSummary: async (): Promise<ReportsSummary> => {
    try {
      const { thisMonthStart, lastMonthStart } = monthBounds()

      const [
        { data: feeRows, error: feeError },
        { data: enrollments, error: enrollmentsError },
        { data: bundles, error: bundlesError },
        { count: activeCourses, error: coursesError },
      ] = await Promise.all([
        supabase
          .from('faculty_transactions')
          .select('amount, transacted_at')
          .eq('type', 'PLATFORM_FEE'),
        supabase.from('enrollments').select('amount_paid, enrolled_at'),
        supabase.from('bundle_enrollments').select('amount_paid, created_at'),
        supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })
          .eq('is_deleted', false)
          .eq('is_draft', false)
          .eq('status', 'APPROVED'),
      ])

      if (feeError) throw new Error(feeError.message)
      if (enrollmentsError) throw new Error(enrollmentsError.message)
      if (bundlesError) throw new Error(bundlesError.message)
      if (coursesError) throw new Error(coursesError.message)

      // Platform earnings (admin commission)
      const feeAmounts: DatedAmount[] = (feeRows ?? []).map((r) => ({
        amount: r.amount ?? 0,
        date: r.transacted_at ?? null,
      }))
      const platformTotal = feeAmounts.reduce((sum, r) => sum + r.amount, 0)
      const platformGrowth = growthPct(
        sumInRange(feeAmounts, thisMonthStart),
        sumInRange(feeAmounts, lastMonthStart, thisMonthStart),
      )

      // Gross revenue (single + bundle enrollments)
      const grossRows: DatedAmount[] = [
        ...(enrollments ?? []).map((r) => ({
          amount: r.amount_paid ?? 0,
          date: r.enrolled_at ?? null,
        })),
        ...(bundles ?? []).map((r) => ({
          amount: r.amount_paid ?? 0,
          date: r.created_at ?? null,
        })),
      ]
      const grossTotal = grossRows.reduce((sum, r) => sum + r.amount, 0)
      const grossGrowth = growthPct(
        sumInRange(grossRows, thisMonthStart),
        sumInRange(grossRows, lastMonthStart, thisMonthStart),
      )

      // Total enrollments (count of the same rows)
      const enrollmentTotal = grossRows.length
      const enrollmentGrowth = growthPct(
        countInRange(grossRows, thisMonthStart),
        countInRange(grossRows, lastMonthStart, thisMonthStart),
      )

      return {
        grossRevenue: { amount: grossTotal, growth: grossGrowth },
        platformEarnings: { amount: platformTotal, growth: platformGrowth },
        totalEnrollments: { amount: enrollmentTotal, growth: enrollmentGrowth },
        activeCourses: activeCourses ?? 0,
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error))
    }
  },

  /** Course lifecycle distribution for the donut breakdown. */
  getCourseStatusBreakdown: async (): Promise<CourseStatusSlice[]> => {
    try {
      const published = supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .eq('is_draft', false)
        .eq('status', 'APPROVED')

      const pending = supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .eq('is_draft', false)
        .eq('status', 'PENDING')

      const resubmit = supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .eq('is_draft', false)
        .eq('status', 'RESUBMIT')

      const rejected = supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .eq('is_draft', false)
        .eq('status', 'REJECTED')

      const draft = supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .eq('is_draft', true)

      const [
        { count: publishedCount, error: publishedError },
        { count: pendingCount, error: pendingError },
        { count: resubmitCount, error: resubmitError },
        { count: rejectedCount, error: rejectedError },
        { count: draftCount, error: draftError },
      ] = await Promise.all([published, pending, resubmit, rejected, draft])

      const firstError =
        publishedError || pendingError || resubmitError || rejectedError || draftError
      if (firstError) throw new Error(firstError.message)

      return [
        { id: 'published', label: 'Published', count: publishedCount ?? 0, color: '#16A34A' },
        { id: 'pending', label: 'Pending Review', count: pendingCount ?? 0, color: '#F59E0B' },
        { id: 'resubmit', label: 'Resubmitted', count: resubmitCount ?? 0, color: '#6366F1' },
        { id: 'rejected', label: 'Rejected', count: rejectedCount ?? 0, color: '#DC2626' },
        { id: 'draft', label: 'Draft', count: draftCount ?? 0, color: '#94A3B8' },
      ]
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error))
    }
  },

  /** Top course categories ranked by gross enrollment revenue. */
  getRevenueByCategory: async (): Promise<CategoryRevenue[]> => {
    try {
      const [
        { data: courses, error: coursesError },
        { data: enrollments, error: enrollmentsError },
      ] = await Promise.all([
        supabase.from('courses').select('id, category').eq('is_deleted', false),
        supabase.from('enrollments').select('course_id, amount_paid'),
      ])

      if (coursesError) throw new Error(coursesError.message)
      if (enrollmentsError) throw new Error(enrollmentsError.message)

      const categoryByCourse = new Map<string, string>()
      for (const course of courses ?? []) {
        categoryByCourse.set(course.id, course.category || 'Uncategorized')
      }

      const amountByCategory = new Map<string, number>()
      for (const row of enrollments ?? []) {
        if (!row.course_id) continue
        const category = categoryByCourse.get(row.course_id) ?? 'Uncategorized'
        amountByCategory.set(
          category,
          (amountByCategory.get(category) ?? 0) + (row.amount_paid ?? 0),
        )
      }

      const total = Array.from(amountByCategory.values()).reduce((sum, v) => sum + v, 0)

      return Array.from(amountByCategory.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percent: total > 0 ? Math.round((amount / total) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6)
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error))
    }
  },

  /** Top courses ranked by number of enrollments. */
  getTopCourses: async (): Promise<TopCourseRow[]> => {
    try {
      const [
        { data: courses, error: coursesError },
        { data: enrollments, error: enrollmentsError },
      ] = await Promise.all([
        supabase
          .from('courses')
          .select('id, title, category, avg_rating, faculty_id')
          .eq('is_deleted', false)
          .eq('is_draft', false),
        supabase.from('enrollments').select('course_id, amount_paid'),
      ])

      if (coursesError) throw new Error(coursesError.message)
      if (enrollmentsError) throw new Error(enrollmentsError.message)

      const stats = new Map<string, { count: number; revenue: number }>()
      for (const row of enrollments ?? []) {
        if (!row.course_id) continue
        const current = stats.get(row.course_id) ?? { count: 0, revenue: 0 }
        current.count += 1
        current.revenue += row.amount_paid ?? 0
        stats.set(row.course_id, current)
      }

      const ranked = (courses ?? [])
        .map((course) => {
          const stat = stats.get(course.id) ?? { count: 0, revenue: 0 }
          return { course, stat }
        })
        .sort((a, b) => b.stat.count - a.stat.count)
        .slice(0, 8)

      // Resolve faculty names for the ranked courses only.
      const facultyIds = Array.from(
        new Set(ranked.map(({ course }) => course.faculty_id).filter(Boolean)),
      ) as string[]

      const nameById = new Map<string, string>()
      if (facultyIds.length > 0) {
        const { data: faculty, error: facultyError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', facultyIds)

        if (facultyError) throw new Error(facultyError.message)

        for (const person of faculty ?? []) {
          const name =
            [person.first_name, person.last_name].filter(Boolean).join(' ') || 'Unknown'
          nameById.set(person.id, name)
        }
      }

      return ranked.map(({ course, stat }) => ({
        id: course.id,
        title: course.title ?? 'Untitled course',
        faculty: course.faculty_id ? (nameById.get(course.faculty_id) ?? 'Unknown') : 'Unknown',
        category: course.category || 'Uncategorized',
        enrollments: stat.count,
        revenue: stat.revenue,
        rating: course.avg_rating ?? 0,
      }))
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error))
    }
  },
}
