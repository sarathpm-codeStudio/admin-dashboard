import { Download, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CourseEnrollmentRow } from '@/api/courseManagement/courseManagement.api'
import { Button } from '@/components/ui/Button'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { ProfileAvatar } from '@/components/ui/ProfileAvatar'
import { Paragraph } from '@/components/ui/Typography'
import {
  useExportCourseEnrollments,
  useGetCourseEnrollments,
} from '@/features/courses/hooks/useCourseManagement'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

const cellTextClass = 'text-[#334155]'
const enrollmentAvatarRound = 'rounded-xl'
const PAGE_SIZE = 25

/** Stable fallback avatar colour when the API has no avatar image. */
const avatarPalette = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
]

function fallbackAvatarClass(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return avatarPalette[Math.abs(hash) % avatarPalette.length]
}

export function CourseEnrollmentSection({
  courseId,
  courseTitle,
}: {
  courseId: string | null
  courseTitle?: string
}) {
  const navigate = useNavigate()
  const toast = useToast()
  const { data: rows = [], isLoading, isError } = useGetCourseEnrollments(courseId)
  const { mutate: exportEnrollments, isPending: isExporting } = useExportCourseEnrollments()

  const [page, setPage] = useState(1)

  const handleExport = () => {
    if (!courseId) return
    exportEnrollments(
      { courseId, courseTitle },
      {
        onSuccess: () => toast.success('Enrollment sheet downloaded.'),
        onError: (error) =>
          toast.error(
            error instanceof Error ? error.message : 'Failed to export enrollments.',
          ),
      },
    )
  }

  const totalCount = rows.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  // Keep the current page valid when the underlying data changes.
  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const pagedRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page],
  )

  const columns = useMemo<DataTableColumn<CourseEnrollmentRow>[]>(
    () => [
      {
        id: 'student',
        header: 'Student information',
        width: '15rem',
        className: 'py-4 pl-4 pr-1',
        headerClassName: 'py-3 pl-4 pr-1',
        cell: (row) => (
          <div className="flex w-max max-w-[15rem] items-center gap-2">
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
                  fallbackAvatarClass(row.studentId || row.name),
                )}
              >
                {row.initials}
              </div>
            )}
            <div
              className="min-w-0 cursor-pointer"
              onClick={() => row.studentId && navigate(`/userdetails/student/${row.studentId}`)}
            >
              <p className="truncate text-sm font-semibold text-[#1E1B4B]">{row.name}</p>
              <Paragraph variant="caption" className={cn('mt-0.5', cellTextClass)}>
                {row.account_id || '—'}
              </Paragraph>
            </div>
          </div>
        ),
      },
      {
        id: 'email',
        header: 'Email',
        width: '15rem',
        cell: (row) => (
          <p className={cn('truncate text-sm font-normal', cellTextClass)}>{row.email || '—'}</p>
        ),
      },
      {
        id: 'amount',
        header: 'Amount Paid',
        width: '9rem',
        cell: (row) => (
          <p className={cn('text-sm font-semibold', cellTextClass)}>{row.amountPaidDisplay}</p>
        ),
      },
      {
        id: 'enrolledAt',
        header: 'Enrolled On',
        width: '9rem',
        cell: (row) => (
          <p className={cn('text-sm font-normal', cellTextClass)}>{row.enrolledAtDisplay}</p>
        ),
      },
      {
        id: 'expiresAt',
        header: 'Expires On',
        width: '9rem',
        cell: (row) => (
          <p className={cn('text-sm font-normal', cellTextClass)}>{row.expiresAtDisplay}</p>
        ),
      },
    ],
    [navigate],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Paragraph variant="emphasis" className="text-ink-heading">
            Enrolled Students
          </Paragraph>
          <Paragraph variant="caption" className={cn('mt-0.5', cellTextClass)}>
            {totalCount} student{totalCount === 1 ? '' : 's'}
          </Paragraph>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleExport}
          disabled={isExporting || totalCount === 0 || !courseId}
        >
          {isExporting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          {isExporting ? 'Exporting…' : 'Export Data'}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={pagedRows}
        getRowKey={(row) => row.id}
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage={
          isError
            ? 'Could not load enrolled students. Please try again.'
            : 'No students are enrolled in this course yet.'
        }
        showTotalCount
        footerLayout="between"
        alwaysShowPagination
        scrollableBody
        className="min-h-0 flex-1 border-0 bg-surface-page shadow-none"
      />
    </div>
  )
}
