import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { PageWithFixedTableScroll } from '@/components/ui/PageWithFixedTableScroll'
import { FacultyEnrollmentFiltersBar } from '@/features/faculty/components/FacultyEnrollmentFiltersBar'
import { FacultyEnrollmentPageHeader } from '@/features/faculty/components/FacultyEnrollmentPageHeader'
import { FacultyEnrollmentTable } from '@/features/faculty/components/FacultyEnrollmentTable'
import {
  ENROLLMENT_DISPLAY_TOTAL,
  ENROLLMENT_PAGE_SIZE,
  getEnrollmentCourseOptions,
  getFacultyEnrollmentPage,
  getFacultyEnrollments,
} from '@/features/faculty/data/mockFacultyEnrollments'
import { getFacultyById } from '@/features/faculty/data/mockFacultyDetail'
import {
  defaultEnrollmentFilters,
} from '@/features/faculty/components/FacultyEnrollmentFiltersBar'
import {
  filterFacultyEnrollments,
  type FacultyEnrollmentFilterValues,
} from '@/features/faculty/utils/filterFacultyEnrollments'

function hasActiveFilters(filters: FacultyEnrollmentFilterValues) {
  return (
    filters.search.trim() !== '' ||
    filters.course !== 'all' ||
    filters.enrollmentDate !== 'all' ||
    filters.progressSort !== 'high'
  )
}

export function FacultyEnrollmentView() {
  const { facultyId } = useParams<{ facultyId: string }>()
  const faculty = facultyId ? getFacultyById(facultyId) : undefined
  const [filters, setFilters] = useState<FacultyEnrollmentFilterValues>(
    defaultEnrollmentFilters,
  )
  const [page, setPage] = useState(1)

  const allEnrollments = useMemo(
    () => (facultyId ? getFacultyEnrollments(facultyId) : []),
    [facultyId],
  )

  const courseOptions = useMemo(
    () => getEnrollmentCourseOptions(allEnrollments),
    [allEnrollments],
  )

  const filteredRows = useMemo(
    () => filterFacultyEnrollments(allEnrollments, filters),
    [allEnrollments, filters],
  )

  const usingFilters = hasActiveFilters(filters)
  const displayTotal = usingFilters ? filteredRows.length : ENROLLMENT_DISPLAY_TOTAL
  const totalPages = Math.max(1, Math.ceil(displayTotal / ENROLLMENT_PAGE_SIZE))

  const tableRows = useMemo(() => {
    if (!facultyId) return []

    if (usingFilters) {
      const start = (page - 1) * ENROLLMENT_PAGE_SIZE
      return filteredRows.slice(start, start + ENROLLMENT_PAGE_SIZE)
    }

    return getFacultyEnrollmentPage(
      facultyId,
      page,
      ENROLLMENT_PAGE_SIZE,
      filteredRows,
      displayTotal,
    )
  }, [facultyId, usingFilters, filteredRows, page, displayTotal])

  const handleFiltersChange = (next: FacultyEnrollmentFilterValues) => {
    setFilters(next)
    setPage(1)
  }

  if (!faculty || !facultyId) {
    return <Navigate to="/users" replace />
  }

  const facultyProfilePath = `/userdetails/faculty/${facultyId}`

  return (
    <PageWithFixedTableScroll
      fixed={
        <>
          <Breadcrumbs
            items={[
              { label: 'Faculty Directory', to: '/users' },
              { label: faculty.name, to: facultyProfilePath },
              { label: 'Total Students Enrollment' },
            ]}
          />

          <FacultyEnrollmentPageHeader
            facultyName={faculty.name}
            totalStudents={faculty.stats.totalStudents}
          />

          <FacultyEnrollmentFiltersBar
            values={filters}
            onChange={handleFiltersChange}
            courseOptions={courseOptions}
          />
        </>
      }
      table={
        <FacultyEnrollmentTable
          rows={tableRows}
          totalCount={displayTotal}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      }
    />
  )
}
