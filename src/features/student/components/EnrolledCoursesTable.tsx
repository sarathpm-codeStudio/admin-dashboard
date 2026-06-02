import { MoreVertical } from 'lucide-react'
import { useMemo } from 'react'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Paragraph } from '@/components/ui/Typography'
import type { EnrolledCourse } from '@/features/student/data/mockStudentDetail'
import { cn } from '@/utils/cn'

const courseStatusClass: Record<EnrolledCourse['status'], string> = {
  completed: 'font-medium text-[#22C55E]',
  active: 'font-medium text-[#B49C00]',
}

const courseStatusLabel: Record<EnrolledCourse['status'], string> = {
  completed: 'Completed',
  active: 'Active',
}

const enrolledCourseHeaderClass = 'bg-surface-input'

type EnrolledCoursesTableProps = {
  courses: EnrolledCourse[]
}

function formatAvgTestScore(score: EnrolledCourse['avgTestScore']) {
  return typeof score === 'number' ? `${score}%` : score
}

export function EnrolledCoursesTable({ courses }: EnrolledCoursesTableProps) {
  const columns = useMemo<DataTableColumn<EnrolledCourse>[]>(
    () => [
      {
        id: 'course',
        header: 'Course details',
        headerClassName: enrolledCourseHeaderClass,
        width: '32%',
        cell: (course) => (
          <div className="min-w-0">
            <Paragraph variant="emphasis" className="text-ink-heading">
              {course.name}
            </Paragraph>
            <Paragraph variant="caption" className="mt-0.5 text-[#64748B]">
              Faculty: {course.facultyName}
            </Paragraph>
          </div>
        ),
      },
      {
        id: 'progress',
        header: 'Current progress',
        headerClassName: enrolledCourseHeaderClass,
        width: '28%',
        cell: (course) => (
          <div className="min-w-0 pr-2">
            <ProgressBar value={course.progressPercent} />
            <Paragraph
              variant="caption"
              className={cn(
                'mt-1.5',
                course.status === 'completed' && 'font-medium text-[#22C55E]',
                course.status === 'active' && 'font-normal text-[#94A3B8]',
              )}
            >
              {course.progressLabel}
            </Paragraph>
          </div>
        ),
      },
      {
        id: 'score',
        header: 'Avg test score',
        headerClassName: enrolledCourseHeaderClass,
        width: '14%',
        align: 'center',
        cell: (course) => (
          <Paragraph className="text-sm font-normal leading-normal text-[#94A3B8]">
            {formatAvgTestScore(course.avgTestScore)}
          </Paragraph>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        headerClassName: enrolledCourseHeaderClass,
        width: '14%',
        align: 'center',
        cell: (course) => (
          <span className={cn('text-sm', courseStatusClass[course.status])}>
            {courseStatusLabel[course.status]}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        headerClassName: enrolledCourseHeaderClass,
        width: '12%',
        align: 'center',
        cell: () => (
          <button
            type="button"
            aria-label="Course actions"
            className="inline-flex size-8 items-center justify-center rounded-nav text-nav transition-colors hover:bg-surface-input hover:text-ink-heading"
          >
            <MoreVertical className="size-4" aria-hidden />
          </button>
        ),
      },
    ],
    [],
  )

  return (
    <DataTable
      columns={columns}
      data={courses}
      getRowKey={(course) => course.id}
      totalCount={courses.length}
      page={1}
      totalPages={1}
      onPageChange={() => {}}
      showFooter={false}
      emptyMessage="No enrolled courses."
    />
  )
}
