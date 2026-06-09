import { useMemo } from 'react'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { ProfileAvatar } from '@/components/ui/ProfileAvatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusDotBadge } from '@/components/ui/StatusDotBadge'
import { Paragraph } from '@/components/ui/Typography'
import type { FacultyEnrollment } from '@/features/faculty/data/mockFacultyEnrollments'
import { cn } from '@/utils/cn'

const cellTextClass = 'text-[#334155]'

/** Squircle avatars — Figma enrollment table */
const enrollmentAvatarRound = 'rounded-xl'

const statusLabel: Record<FacultyEnrollment['status'], string> = {
  active: 'Active',
  pending: 'Draft/Pending',
  completed: 'Completed',
}

function progressFillClass(percent: number) {
  if (percent < 25) return 'bg-red-500'
  return 'bg-primary-gradient-r'
}

function progressPercentTextClass(percent: number) {
  if (percent < 25) return 'text-sm font-bold text-[#BA1A1A]'
  return 'text-sm font-bold text-[#000B60]'
}

type FacultyEnrollmentTableProps = {
  rows: FacultyEnrollment[]
  totalCount: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function FacultyEnrollmentTable({
  rows,
  totalCount,
  page,
  totalPages,
  onPageChange,
}: FacultyEnrollmentTableProps) {
  const columns = useMemo<DataTableColumn<FacultyEnrollment>[]>(
    () => [
      {
        id: 'student',
        header: 'Student information',
        width: '13.5rem',
        className: 'py-4 pl-4 pr-1',
        headerClassName: 'py-3 pl-4 pr-1',
        cell: (row) => (
          <div className="flex w-max max-w-[13.5rem] items-center gap-2">
            {row.avatarUrl ? (
              <ProfileAvatar
                src={row.avatarUrl}
                alt=""
                sizeClassName="size-10"
                roundedClassName={enrollmentAvatarRound}
              />
            ) : (
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center text-xs font-bold',
                  enrollmentAvatarRound,
                  row.avatarClassName,
                )}
              >
                {row.initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#1E1B4B]">{row.name}</p>
              <Paragraph variant="caption" className={cn('mt-0.5', cellTextClass)}>
                #{row.studentId}
              </Paragraph>
            </div>
          </div>
        ),
      },
      {
        id: 'course',
        header: 'Enrolled course',
        width: '16rem',
        className: 'py-4 pl-1 pr-4',
        headerClassName: 'py-3 pl-1 pr-4',
        cell: (row) => (
          <p className={cn('text-sm font-normal', cellTextClass)}>{row.courseName}</p>
        ),
      },
      {
        id: 'date',
        header: 'Enrollment date',
        width: '9.5rem',
        cell: (row) => (
          <p className={cn('text-sm font-normal', cellTextClass)}>{row.enrollmentDate}</p>
        ),
      },
      {
        id: 'progress',
        header: 'Current progress',
        width: '14.5rem',
        align: 'center',
        cell: (row) => (
          <div className="mx-auto flex w-full max-w-[12.5rem] items-center justify-center gap-3">
            <ProgressBar
              value={row.progressPercent}
              className="min-w-0 flex-1"
              trackClassName="h-2"
              fillClassName={progressFillClass(row.progressPercent)}
            />
            <span className={cn('shrink-0', progressPercentTextClass(row.progressPercent))}>
              {row.progressPercent}%
            </span>
          </div>
        ),
      },
      {
        id: 'test_score',
        header: 'Test score',
        width: '14.5rem',
        align: 'center',
        cell: (row) => (
          <div className="mx-auto flex w-full max-w-[12.5rem] items-center justify-center gap-3">
            <span className={cn('shrink-0', cellTextClass)}>
              {row.test_score}%
            </span> 
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        width: '6.5rem',
        align: 'center',
        cell: (row) => (
          <div className="flex justify-center">
            <StatusDotBadge label={statusLabel[row.status]} variant={row.status} />
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowKey={(row) => row.id}
      totalCount={totalCount}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyMessage="No enrolled students match your filters."
      showTotalCount={false}
      footerLayout="end"
      scrollableBody
      className="min-h-0 flex-1 border-0 bg-surface-page shadow-none"
    />
  )
}
