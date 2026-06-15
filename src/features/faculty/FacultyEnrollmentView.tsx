import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { PageWithFixedTableScroll } from '@/components/ui/PageWithFixedTableScroll'
import { FacultyEnrollmentFiltersBar } from '@/features/faculty/components/FacultyEnrollmentFiltersBar'
import { FacultyEnrollmentPageHeader } from '@/features/faculty/components/FacultyEnrollmentPageHeader'
import { FacultyEnrollmentTable } from '@/features/faculty/components/FacultyEnrollmentTable'
import { defaultEnrollmentFilters } from '@/features/faculty/components/FacultyEnrollmentFiltersBar'
import { type FacultyEnrollmentFilterValues } from '@/features/faculty/utils/filterFacultyEnrollments'
import {
  useGetFacultyById,
  useGetFacultyStudents,
} from '@/features/faculty/hooks/useFacultyManagement'

const PAGE_SIZE = 25

export function FacultyEnrollmentView() {
  const { facultyId } = useParams<{ facultyId: string }>()
  const [filters, setFilters] = useState<FacultyEnrollmentFilterValues>(
    defaultEnrollmentFilters,
  )
  const [page, setPage] = useState(1)

  // Debounce search so we don't hit Supabase on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(filters.search), 350)
    return () => clearTimeout(id)
  }, [filters.search])

  const { data: facultyData } = useGetFacultyById(facultyId ?? '')

  const { data, isFetching, isError } = useGetFacultyStudents(
    facultyId ?? '',
    page,
    { search: debouncedSearch, courseId: filters.course },
    PAGE_SIZE,
  )

  const rows = data?.items ?? []
  const courseOptions = useMemo(() => data?.courseOptions ?? [], [data])
  const totalCount = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const handleFiltersChange = (next: FacultyEnrollmentFilterValues) => {
    setFilters(next)
    setPage(1)
  }

  if (!facultyId) {
    return <Navigate to="/users" replace />
  }

  const facultyName = facultyData?.faculty.name ?? ''
  const totalStudents = facultyData?.analytics.totalStudents.total ?? 0
  const facultyProfilePath = `/userdetails/faculty/${facultyId}`

  return (
    <PageWithFixedTableScroll
      fixed={
        <>
          <Breadcrumbs
            items={[
              { label: 'Faculty Directory', to: '/users' },
              { label: facultyName, to: facultyProfilePath },
              { label: 'Total Students Enrollment' },
            ]}
          />

          <FacultyEnrollmentPageHeader
            facultyName={facultyName}
            totalStudents={totalStudents}
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
          rows={rows}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          isLoading={isFetching}
          isError={isError}
        />
      }
    />
  )
}
