import type { CourseFilterValues } from '@/features/courses/components/CourseFiltersBar'
import type { CourseRecord } from '@/features/courses/types'
import {
  mapPriceFilterToApi,
  mapStatusFilterToApi,
} from '@/features/courses/utils/mapCourseFromApi'

export function filterCourses(
  courses: CourseRecord[],
  filters: CourseFilterValues,
): CourseRecord[] {
  const query = filters.search.trim().toLowerCase()
  const status = mapStatusFilterToApi(filters.status)
  const price = mapPriceFilterToApi(filters.price)

  return courses.filter((course) => {
    if (query) {
      const matchesQuery =
        course.title.toLowerCase().includes(query) ||
        course.facultyName.toLowerCase().includes(query) ||
        course.id.toLowerCase().includes(query)
      if (!matchesQuery) return false
    }

    if (filters.category !== 'all') {
      const categories = course.category.split(',').map((tag) => tag.trim())
      if (!categories.includes(filters.category)) return false
    }

    if (filters.faculty !== 'all' && course.facultyId !== filters.faculty) {
      return false
    }

    if (status !== 'all' && course.status !== status) return false

    if (price === 'free' && course.price > 0) return false
    if (price === 'paid' && course.price <= 0) return false

    return true
  })
}

export function paginateCourses<T>(items: T[], page: number, pageSize: number) {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize

  return {
    data: items.slice(start, start + pageSize),
    total,
    totalPages,
    page: safePage,
  }
}
