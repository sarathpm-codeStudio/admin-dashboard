import { MoreVertical } from 'lucide-react'
import { useMemo } from 'react'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Paragraph } from '@/components/ui/Typography'
import {
  STUDENT_COURSES_PAGE_SIZE,
  STUDENT_COURSES_TABLE_SCROLL_MAX_HEIGHT,
} from '@/features/student/utils/constants'
import { cn } from '@/utils/cn'

type StudentCourseRow = {
  id: string
  title?: string
  name?: string
  facultyName?: string
  progress?: number
  progressPercent?: number
  test_score?: number | undefined
  status: string
}

const courseStatusClass: Record<string, string> = {
  Completed: 'font-medium text-[#22C55E]',
  completed: 'font-medium text-[#22C55E]',
  Active: 'font-medium text-[#B49C00]',
  active: 'font-medium text-[#B49C00]',
  'Not start': 'font-medium text-[#BA1A1A]',
}

const courseStatusLabel: Record<string, string> = {
  Completed: 'Completed',
  completed: 'Completed',
  Active: 'Active',
  active: 'Active',
  'Not start': 'Not started',
}

const enrolledCourseHeaderClass = 'bg-surface-input'

type EnrolledCoursesTableProps = {
  courses: StudentCourseRow[]
  totalCount: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

// function formatTestScore(course: StudentCourseRow) {
//   const score = course.test_score ?? course.avgTestScore
//   if (score === '-' || score == null || score === 0) return '-'
//   return `${score}%`
// }

function getProgressPercent(course: StudentCourseRow) {
  return course.progress ?? course.progressPercent ?? 0
}

function progressFillClass(percent: number) {
  if (percent < 25) return 'bg-red-500'
  return 'bg-primary-gradient-r'
}

function progressPercentTextClass(percent: number) {
  if (percent < 25) return 'text-sm font-bold text-[#BA1A1A]'
  return 'text-sm font-bold text-[#000B60]'
}

export function EnrolledCoursesTable({
  courses,
  totalCount,
  page,
  totalPages,
  onPageChange,
  isLoading = false,
}: EnrolledCoursesTableProps) {
  const columns = useMemo<DataTableColumn<StudentCourseRow>[]>(
    () => [
      {
        id: 'course',
        header: 'Course details',
        headerClassName: enrolledCourseHeaderClass,
        width: '32%',
        cell: (course) => (
          <div className="min-w-0">
            <Paragraph variant="emphasis" className="text-ink-heading">
              {course.title ?? course.name}
            </Paragraph>
            <Paragraph variant="caption" className="mt-0.5 text-[#64748B]">
              Faculty: {course.facultyName ?? '—'}
            </Paragraph>
          </div>
        ),
      },
      {
        id: 'progress',
        header: 'Current progress',
        headerClassName: enrolledCourseHeaderClass,
        width: '28%',
        cell: (course) => {
          const pct = getProgressPercent(course)
          return (
            <div className="flex min-w-0 flex-col gap-1.5 pr-2">
              <span className={cn('text-xs', progressPercentTextClass(pct))}>
                {pct}%
              </span>
              <ProgressBar
                value={pct}
                className="w-full"
                fillClassName={progressFillClass(pct)}
              />
            </div>
          )
        },
      },
      {
        id: 'score',
        header: 'Avg test score',
        headerClassName: enrolledCourseHeaderClass,
        width: '14%',
        align: 'center',
        cell: (course) => (
          <Paragraph className="text-sm font-normal leading-normal text-[#94A3B8]">
            {/* {formatTestScore(course ?? { test_score: 0 })} */}
            {course.test_score ?? '-'}%
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
            {courseStatusLabel[course.status] ?? course.status}
          </span>
        ),
      },
      // {
      //   id: 'actions',
      //   header: 'Actions',
      //   headerClassName: enrolledCourseHeaderClass,
      //   width: '12%',
      //   align: 'center',
      //   cell: () => (
      //     <button
      //       type="button"
      //       aria-label="Course actions"
      //       className="inline-flex size-8 items-center justify-center rounded-nav text-nav transition-colors hover:bg-surface-input hover:text-ink-heading"
      //     >
      //       <MoreVertical className="size-4" aria-hidden />
      //     </button>
      //   ),
      // },
    ],
    [],
  )

  return (
    <DataTable
      columns={columns}
      data={courses}
      getRowKey={(course) => course.id}
      totalCount={totalCount}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      isLoading={isLoading}
      loadingRowCount={STUDENT_COURSES_PAGE_SIZE}
      animateRows={!isLoading}
      scrollableBody
      scrollBodyMaxHeight={STUDENT_COURSES_TABLE_SCROLL_MAX_HEIGHT}
      className="shrink-0"
      rowAnimationKey={`${page}-${courses.length}-${courses[0]?.id ?? 'empty'}`}
      alwaysShowPagination
      emptyMessage="No enrolled courses."
    />
  )
}
