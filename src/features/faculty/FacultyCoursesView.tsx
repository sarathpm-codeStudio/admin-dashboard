import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Pagination } from '@/components/ui/Pagination'
import { FacultyCourseCard } from '@/features/faculty/components/FacultyCourseCard'
import { FacultyCourseCardSkeleton } from '@/features/faculty/components/FacultyCourseCardSkeleton'
import { FacultyCoursesFiltersBar } from '@/features/faculty/components/FacultyCoursesFiltersBar'
import { FacultyCoursesPageHeader } from '@/features/faculty/components/FacultyCoursesPageHeader'
import type { FacultyCourseFilterValues } from '@/features/faculty/utils/filterFacultyCourses'
import {
  useGetFacultyById,
  useGetFacultyCourseCategories,
  useGetFacultyCourses,
} from './hooks/useFacultyManagement'

const defaultFilters: FacultyCourseFilterValues = {
  search: '',
  status: 'all',
  category: 'all',
}

const PAGE_SIZE = 8

export function FacultyCoursesView() {
  const { facultyId } = useParams<{ facultyId: string }>()
  const [filters, setFilters] = useState<FacultyCourseFilterValues>(defaultFilters)
  const [page, setPage] = useState(1)

  // Debounce the search term so we don't hit Supabase on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(filters.search), 350)
    return () => clearTimeout(id)
  }, [filters.search])

  // Reset to the first page whenever the filters change
  const handleFiltersChange = (next: FacultyCourseFilterValues) => {
    setFilters(next)
    setPage(1)
  }

  const { data: facultyData } = useGetFacultyById(facultyId ?? '')
  const { data: categories } = useGetFacultyCourseCategories(facultyId ?? '')

  const { data, isLoading, isError } = useGetFacultyCourses(
    facultyId ?? '',
    page,
    {
      search: debouncedSearch,
      status: filters.status,
      category: filters.category,
    },
    PAGE_SIZE,
  )

  const courses = useMemo(() => data?.items ?? [], [data])
  const totalCount = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  if (!facultyId) {
    return <Navigate to="/users" replace />
  }

  const facultyName = facultyData?.faculty.name ?? 'Faculty'
  const facultyProfilePath = `/userdetails/faculty/${facultyId}`

  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto">
      <Breadcrumbs
        items={[
          { label: 'Faculty Directory', to: '/users' },
          { label: facultyName, to: facultyProfilePath },
          { label: 'Courses Created' },
        ]}
      />

      <FacultyCoursesPageHeader />

      <FacultyCoursesFiltersBar
        values={filters}
        onChange={handleFiltersChange}
        categories={categories ?? []}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <FacultyCourseCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <p className="py-12 text-center text-sm text-nav">
          Error loading courses.
        </p>
      ) : courses.length === 0 ? (
        <p className="py-12 text-center text-sm text-nav">
          No courses match your filters.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {courses.map((course) => (
              <FacultyCourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e2e8f0]/60 pt-3">
            <p className="text-sm text-[#94a3b8]">
              {isLoading ? 'Loading…' : `Total ${totalCount.toLocaleString()}`}
            </p>
            {totalPages > 1 ? (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                disabled={isLoading}
              />
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}
