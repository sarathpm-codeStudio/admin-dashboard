import { useMemo } from 'react'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { ProfileAvatar } from '@/components/ui/ProfileAvatar'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'
import { useNavigate } from 'react-router-dom'

export type FacultyStudentRow = {
  id: string
  studentId: string
  account_id: string
  name: string
  initials: string
  avatarUrl?: string
  avatarClassName?: string
  email: string
  phoneNumber: string
  enrolledCoursesCount: number
}

const cellTextClass = 'text-[#334155]'

/** Squircle avatars — Figma enrollment table */
const enrollmentAvatarRound = 'rounded-xl'

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

type FacultyEnrollmentTableProps = {
  rows: FacultyStudentRow[]
  totalCount: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  isError?: boolean
}

export function FacultyEnrollmentTable({
  rows,
  totalCount,
  page,
  totalPages,
  onPageChange,
  isLoading = false,
  isError = false,
}: FacultyEnrollmentTableProps) {

  const navigate = useNavigate()

  const columns = useMemo<DataTableColumn<FacultyStudentRow>[]>(
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
                  row.avatarClassName ?? fallbackAvatarClass(row.studentId || row.name),
                )}
              >
                {row.initials}
              </div>
            )}
            <div className="min-w-0 cursor-pointer" onClick={() => navigate(`/userdetails/student/${row.id}`)}>
              <p className="truncate text-sm font-semibold text-[#1E1B4B]">{row.name}</p>
              <Paragraph variant="caption" className={cn('mt-0.5', cellTextClass)}>
                {row.account_id}
              </Paragraph>
            </div>
          </div>
        ),
      },
      {
        id: 'courses',
        header: 'Enrolled courses',
        width: '10rem',
        className: 'py-4 pl-1 pr-4',
        headerClassName: 'py-3 pl-1 pr-4',
        cell: (row) => (
          <p className={cn('text-sm font-normal', cellTextClass)}>{row.enrolledCoursesCount}</p>
        ),
      },
      {
        id: 'email',
        header: 'Email',
        width: '16rem',
        cell: (row) => (
          <p className={cn('truncate text-sm font-normal', cellTextClass)}>{row.email}</p>
        ),
      },
      {
        id: 'phone',
        header: 'Phone Number',
        width: '12rem',
        cell: (row) => (
          <p className={cn('text-sm font-normal', cellTextClass)}>{row.phoneNumber}</p>
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
      isLoading={isLoading}
      emptyMessage={
        isError
          ? 'Could not load enrolled students. Please try again.'
          : 'No enrolled students match your filters.'
      }
      showTotalCount
      footerLayout="between"
      alwaysShowPagination
      scrollableBody
      className="min-h-0 flex-1 border-0 bg-surface-page shadow-none"
    />
  )
}
