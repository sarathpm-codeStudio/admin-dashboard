import { useMemo } from 'react'
import { Checkbox } from '@/components/ui/Checkbox'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/StatusBadge'
import { Paragraph } from '@/components/ui/Typography'
import {
  COURSES_PAGE_SIZE,
  COURSES_TABLE_SCROLL_MAX_HEIGHT,
} from '@/features/courses/utils/constants'
import type { CourseRecord } from '@/features/courses/types'
import type { CourseApprovalStatus } from '@/features/courses/types'
import { cn } from '@/utils/cn'

const statusLabel: Record<CourseApprovalStatus, string> = {
  APPROVED: 'Approved',
  PENDING: 'Pending',
  REJECTED: 'Rejected',
  RESUBMIT: 'Resubmitted',
}

const statusVariant: Record<CourseApprovalStatus, StatusBadgeVariant> = {
  APPROVED: 'active',
  PENDING: 'pending',
  REJECTED: 'rejected',
  RESUBMIT: 'info',
}

const statusDotClass: Record<CourseApprovalStatus, string> = {
  APPROVED: 'bg-emerald-500',
  PENDING: 'bg-amber-500',
  REJECTED: 'bg-red-500',
  RESUBMIT: 'bg-blue-500',
}

const COL_WIDTH = `${100 / 7}%`
const tableTextClass = 'font-bold text-[#44474E]'

type CoursesTableProps = {
  courses: CourseRecord[]
  totalCount: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  selectedIds: Set<string>
  onToggleRow: (id: string, checked: boolean) => void
  onToggleAll: (checked: boolean) => void
  onRowClick?: (course: CourseRecord) => void
}

function CourseStatusBadge({ status }: { status: CourseApprovalStatus }) {
  return (
    <StatusBadge
      label={
        <span className="inline-flex items-center gap-1.5">
          <span className={cn('size-1.5 rounded-full', statusDotClass[status])} aria-hidden />
          {statusLabel[status]}
        </span>
      }
      variant={statusVariant[status]}
      appearance="filled"
      className="font-bold"
    />
  )
}

function CategoryBadges({ category }: { category: string }) {
  const tags = category
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  if (tags.length === 0) {
    return (
      <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#44474E]">
        —
      </span>
    )
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#44474E]"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

export function CoursesTable({
  courses,
  totalCount,
  page,
  totalPages,
  onPageChange,
  isLoading = false,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onRowClick,
}: CoursesTableProps) {
  const allSelected = courses.length > 0 && courses.every((course) => selectedIds.has(course.id))
  const someSelected = courses.some((course) => selectedIds.has(course.id))

  const columns = useMemo<DataTableColumn<CourseRecord>[]>(
    () => [
      {
        id: 'select',
        header: (
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={(e) => onToggleAll(e.target.checked)}
            aria-label="Select all courses on this page"
          />
        ),
        width: '2.25rem',
        className: 'pr-0',
        cell: (course) => (
          <span
            className="inline-flex"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <Checkbox
              checked={selectedIds.has(course.id)}
              onChange={(e) => onToggleRow(course.id, e.target.checked)}
              aria-label={`Select ${course.title}`}
            />
          </span>
        ),
      },
      {
        id: 'course',
        header: 'Course Name & Stats',
        width: '24%',
        className: 'pl-0',
        headerClassName: 'pl-0',
        cell: (course) => (
          <div className="flex min-w-0 items-center gap-3">
            {course.coverImage ? (
              <img
                src={course.coverImage}
                alt={course.title}
                className="h-14 w-20 shrink-0 rounded-lg bg-[#F1F5F9] object-contain"
              />
            ) : (
              <div className="h-14 w-20 shrink-0 rounded-lg bg-[#F1F5F9]" aria-hidden />
            )}
            <div className="min-w-0">
              <Paragraph variant="emphasis" className="truncate text-sm font-extrabold text-[#44474E]">
                {course.title}
              </Paragraph>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <span
                  className={cn(
                    'rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px]',
                    tableTextClass,
                  )}
                >
                  {course.studentsCount} Students
                </span>
                <span
                  className={cn(
                    'rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px]',
                    tableTextClass,
                  )}
                >
                  {course.revenueDisplay} Rev.
                </span>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'faculty',
        header: 'Faculty',
        width: COL_WIDTH,
        cell: (course) => (
          <Paragraph variant="muted" className={cn('capitalize', tableTextClass)}>
            {course.facultyName}
          </Paragraph>
        ),
      },
      {
        id: 'category',
        header: 'Category',
        width: COL_WIDTH,
        cell: (course) => <CategoryBadges category={course.category} />,
      },
      {
        id: 'price',
        header: 'Price',
        width: COL_WIDTH,
        align: 'center',
        cell: (course) => (
          <div className="flex justify-center">
            <Paragraph variant="emphasis" className={tableTextClass}>
              {course.priceDisplay}
            </Paragraph>
          </div>
        ),
      },
      {
        id: 'validity',
        header: 'Validity',
        width: COL_WIDTH,
        align: 'center',
        cell: (course) => (
          <div className="flex justify-center">
            <Paragraph variant="emphasis" className={tableTextClass}>
              {course.validityDisplay}
            </Paragraph>
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        width: COL_WIDTH,
        align: 'center',
        cell: (course) => (
          <div className="flex justify-center">
            <CourseStatusBadge status={course.status} />
          </div>
        ),
      },
    ],
    [allSelected, someSelected, onToggleAll, onToggleRow, selectedIds],
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
      onRowClick={onRowClick}
      loadingRowCount={COURSES_PAGE_SIZE}
      animateRows={!isLoading}
      scrollableBody
      scrollBodyMaxHeight={COURSES_TABLE_SCROLL_MAX_HEIGHT}
      className="shrink-0 [&_thead_th]:font-bold [&_thead_th]:text-[#44474E] [&_tbody_td]:font-bold"
      footerClassName="[&_p]:font-bold [&_p]:text-[#44474E]"
      rowAnimationKey={`${page}-${courses.length}-${courses[0]?.id ?? 'empty'}`}
      headerRowClassName="[&_th:first-child]:px-4"
      tableClassName="table-fixed"
    />
  )
}
