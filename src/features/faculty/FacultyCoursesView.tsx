import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { FacultyCourseCard } from '@/features/faculty/components/FacultyCourseCard'
import { FacultyCoursesFiltersBar } from '@/features/faculty/components/FacultyCoursesFiltersBar'
import { FacultyCoursesPageHeader } from '@/features/faculty/components/FacultyCoursesPageHeader'
import { getFacultyCourses } from '@/features/faculty/data/mockFacultyCourses'
import { getFacultyById } from '@/features/faculty/data/mockFacultyDetail'
import {
  filterFacultyCourses,
  type FacultyCourseFilterValues,
} from '@/features/faculty/utils/filterFacultyCourses'

const defaultFilters: FacultyCourseFilterValues = {
  search: '',
  status: 'all',
  category: 'all',
}

export function FacultyCoursesView() {
  const { facultyId } = useParams<{ facultyId: string }>()
  const faculty = facultyId ? getFacultyById(facultyId) : undefined
  const [filters, setFilters] = useState<FacultyCourseFilterValues>(defaultFilters)

  const allCourses = useMemo(
    () => (facultyId ? getFacultyCourses(facultyId) : []),
    [facultyId],
  )

  const filteredCourses = useMemo(
    () => filterFacultyCourses(allCourses, filters),
    [allCourses, filters],
  )

  if (!faculty || !facultyId) {
    return <Navigate to="/users" replace />
  }

  const facultyProfilePath = `/userdetails/faculty/${facultyId}`

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Faculty Directory', to: '/users' },
          { label: faculty.name, to: facultyProfilePath },
          { label: 'Courses Created' },
        ]}
      />

      <FacultyCoursesPageHeader />

      <FacultyCoursesFiltersBar values={filters} onChange={setFilters} />

      {filteredCourses.length === 0 ? (
        <p className="py-12 text-center text-sm text-nav">No courses match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredCourses.map((course) => (
            <FacultyCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
