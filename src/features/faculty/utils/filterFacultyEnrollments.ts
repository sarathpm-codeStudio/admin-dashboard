import type { FacultyEnrollment } from '@/features/faculty/data/mockFacultyEnrollments'

export type FacultyEnrollmentFilterValues = {
  search: string
  course: string
  enrollmentDate: string
  progressSort: string
}

export function filterFacultyEnrollments(
  rows: FacultyEnrollment[],
  filters: FacultyEnrollmentFilterValues,
): FacultyEnrollment[] {
  const query = filters.search.trim().toLowerCase()

  let result = rows.filter((row) => {
    if (query) {
      const matchesQuery =
        row.name.toLowerCase().includes(query) ||
        row.studentId.toLowerCase().includes(query) ||
        row.courseName.toLowerCase().includes(query)
      if (!matchesQuery) return false
    }

    if (filters.course !== 'all' && row.courseName !== filters.course) {
      return false
    }

    if (filters.enrollmentDate !== 'all') {
      const year = filters.enrollmentDate
      if (!row.enrollmentDate.includes(year)) return false
    }

    return true
  })

  if (filters.progressSort === 'high' || filters.progressSort === 'none') {
    result = [...result].sort((a, b) => b.progressPercent - a.progressPercent)
  } else if (filters.progressSort === 'low') {
    result = [...result].sort((a, b) => a.progressPercent - b.progressPercent)
  }

  return result
}
