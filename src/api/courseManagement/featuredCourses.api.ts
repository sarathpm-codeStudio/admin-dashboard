import { supabase } from '@/config/supabase'

/** A course currently in the featured list, with its display details. */
export type FeaturedCourseRow = {
  /** featured_courses.id (row id, used for remove / reorder) */
  id: string
  courseId: string
  position: number
  title: string
  coverImage: string | null
  category: string
  facultyName: string
  isFree: boolean
  priceDisplay: string
}

/** A published course that can be added to the featured list. */
export type PublishableCourseOption = {
  id: string
  title: string
  coverImage: string | null
  category: string
  facultyName: string
  isFree: boolean
  priceDisplay: string
}

const formatCurrency = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const facultyNameOf = (raw: unknown): string => {
  const profile = Array.isArray(raw) ? raw[0] : raw
  const first = (profile as { first_name?: string } | null)?.first_name
  const last = (profile as { last_name?: string } | null)?.last_name
  return [first, last].filter(Boolean).join(' ') || 'Unknown'
}

export const featuredCoursesFunctions = {
  // Current featured list, ordered by listing position.
  getFeaturedCourses: async (): Promise<FeaturedCourseRow[]> => {
    try {
      const { data, error } = await supabase
        .from('featured_courses')
        .select(
          `
          id,
          course_id,
          position,
          course:courses!featured_courses_course_id_fkey (
            id,
            title,
            cover_image,
            category,
            price,
            final_price,
            is_free,
            faculty:profiles!courses_faculty_id_fkey (
              first_name,
              last_name
            )
          )
        `,
        )
        .order('position', { ascending: true })

      if (error) throw new Error(error.message)

      return (data ?? []).map((row) => {
        const course = Array.isArray(row.course) ? row.course[0] : row.course
        const priceAmount = course?.final_price ?? course?.price ?? 0

        return {
          id: row.id,
          courseId: row.course_id,
          position: row.position ?? 0,
          title: course?.title ?? 'Untitled course',
          coverImage: course?.cover_image ?? null,
          category: course?.category ?? '',
          facultyName: facultyNameOf(course?.faculty),
          isFree: course?.is_free ?? false,
          priceDisplay: formatCurrency(priceAmount),
        }
      })
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load featured courses')
    }
  },

  // Published (APPROVED, non-draft) courses that are not already featured —
  // candidates the admin can add to the featured list.
  getPublishableCourses: async (search = ''): Promise<PublishableCourseOption[]> => {
    try {
      const { data: featured, error: featuredError } = await supabase
        .from('featured_courses')
        .select('course_id')

      if (featuredError) throw new Error(featuredError.message)
      const featuredIds = new Set((featured ?? []).map((row) => row.course_id))

      let query = supabase
        .from('courses')
        .select(
          `
          id,
          title,
          cover_image,
          category,
          price,
          final_price,
          is_free,
          faculty:profiles!courses_faculty_id_fkey (
            first_name,
            last_name
          )
        `,
        )
        .eq('is_deleted', false)
        .eq('is_draft', false)
        .eq('status', 'APPROVED')
        .order('title', { ascending: true })

      if (search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`)
      }

      const { data, error } = await query
      if (error) throw new Error(error.message)

      return (data ?? [])
        .filter((course) => !featuredIds.has(course.id))
        .map((course) => {
          const priceAmount = course.final_price ?? course.price ?? 0
          return {
            id: course.id,
            title: course.title ?? 'Untitled course',
            coverImage: course.cover_image ?? null,
            category: course.category ?? '',
            facultyName: facultyNameOf(course.faculty),
            isFree: course.is_free ?? false,
            priceDisplay: formatCurrency(priceAmount),
          }
        })
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load courses')
    }
  },

  // Add a course to the featured list at the end (next position).
  addFeaturedCourse: async (courseId: string): Promise<{ success: true }> => {
    try {
      const { data: last, error: posError } = await supabase
        .from('featured_courses')
        .select('position')
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (posError) throw new Error(posError.message)

      const nextPosition = (last?.position ?? 0) + 1

      const { error } = await supabase
        .from('featured_courses')
        .insert({ course_id: courseId, position: nextPosition })

      if (error) throw new Error(error.message)

      return { success: true }
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : 'Failed to add featured course')
    }
  },

  // Remove a course from the featured list.
  removeFeaturedCourse: async (id: string): Promise<{ success: true }> => {
    try {
      const { error } = await supabase.from('featured_courses').delete().eq('id', id)
      if (error) throw new Error(error.message)
      return { success: true }
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : 'Failed to remove featured course')
    }
  },

  // Persist a new ordering — positions become 1..N in the given id order.
  reorderFeaturedCourses: async (orderedIds: string[]): Promise<{ success: true }> => {
    try {
      const results = await Promise.all(
        orderedIds.map((id, index) =>
          supabase
            .from('featured_courses')
            .update({ position: index + 1 })
            .eq('id', id),
        ),
      )
      const failed = results.find((result) => result.error)
      if (failed?.error) throw new Error(failed.error.message)
      return { success: true }
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : 'Failed to reorder featured courses')
    }
  },
}
