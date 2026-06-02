import type { FacultyCourse } from '@/features/faculty/data/mockFacultyCourses'

export type FacultyCourseFilterValues = {
  search: string
  status: string
  category: string
}

export function filterFacultyCourses(
  courses: FacultyCourse[],
  filters: FacultyCourseFilterValues,
): FacultyCourse[] {
  const query = filters.search.trim().toLowerCase()

  return courses.filter((course) => {
    if (query) {
      const matchesQuery =
        course.name.toLowerCase().includes(query) ||
        course.id.toLowerCase().includes(query)
      if (!matchesQuery) return false
    }

    if (filters.status !== 'all' && course.status !== filters.status) {
      return false
    }

    if (filters.category !== 'all' && course.category !== filters.category) {
      return false
    }

    return true
  })
}
