import { Pencil, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { CommissionFacultyRow } from '@/api/platformSettings/platformSettings.api'
import {
  PLATFORM_SETTING_DEFAULTS,
  PLATFORM_SETTING_KEYS,
} from '@/api/platformSettings/platformSettings.api'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/Input'
import { ProfileAvatar } from '@/components/ui/ProfileAvatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Paragraph } from '@/components/ui/Typography'
import { FacultyCommissionEditModal } from '@/features/platform-settings/components/FacultyCommissionEditModal'
import {
  useGetCommissionFaculties,
  useGetPlatformSettings,
  useResetFacultyCommission,
  useUpdateFacultyCommission,
} from '@/features/platform-settings/hooks/usePlatformSettings'
import { USERS_PAGE_SIZE } from '@/features/users/utils/constants'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

const PAGE_SIZE = USERS_PAGE_SIZE

const avatarPalette = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
] as const

function avatarClass(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i)) % avatarPalette.length
  }
  return avatarPalette[hash]!
}

function formatAccountStatus(status: string): string {
  return status
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function CommissionFacultiesTable() {
  const toast = useToast()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editingFaculty, setEditingFaculty] = useState<CommissionFacultyRow | null>(null)

  const { data: settings } = useGetPlatformSettings()
  const { data, isLoading, isError, error } = useGetCommissionFaculties(page, PAGE_SIZE, search)
  const updateCommission = useUpdateFacultyCommission()
  const resetCommission = useResetFacultyCommission()

  const defaultCommissionPercent = Number(
    settings?.[PLATFORM_SETTING_KEYS.defaultCommissionPercent] ??
      PLATFORM_SETTING_DEFAULTS[PLATFORM_SETTING_KEYS.defaultCommissionPercent],
  )

  const faculties = data?.data ?? []
  const totalCount = data?.pagination.total ?? 0
  const totalPages = Math.max(1, data?.pagination.total_pages ?? 1)
  const isSaving = updateCommission.isPending || resetCommission.isPending

  const handleSaveCommission = async (commissionPercent: number) => {
    if (!editingFaculty) return
    try {
      await updateCommission.mutateAsync({
        facultyId: editingFaculty.id,
        commissionPercent,
      })
      toast.success('Faculty commission updated')
      setEditingFaculty(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save commission rate')
    }
  }

  const handleResetToDefault = async () => {
    if (!editingFaculty) return
    try {
      await resetCommission.mutateAsync(editingFaculty.id)
      toast.success('Faculty now uses the platform default commission')
      setEditingFaculty(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not reset commission rate')
    }
  }

  const columns = useMemo<DataTableColumn<CommissionFacultyRow>[]>(
    () => [
      {
        id: 'name',
        header: 'Faculty information',
        width: '15rem',
        cell: (faculty) => (
          <div className="flex min-w-0 items-center gap-3">
            {faculty.avatarUrl ? (
              <ProfileAvatar
                src={faculty.avatarUrl}
                alt={faculty.name}
                sizeClassName="size-10"
                roundedClassName="rounded-xl"
              />
            ) : (
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold',
                  avatarClass(faculty.id),
                )}
              >
                {faculty.initials}
              </div>
            )}
            <div className="min-w-0">
              <Link
                to={`/userdetails/faculty/${faculty.id}`}
                className="block truncate text-sm font-semibold text-[#1E1B4B] no-underline hover:text-primary"
              >
                {faculty.name}
              </Link>
              <Paragraph variant="caption" className="truncate text-[#64748B]">
                {faculty.email ?? '—'}
              </Paragraph>
            </div>
          </div>
        ),
      },
      {
        id: 'phone',
        header: 'Mobile',
        width: '9rem',
        cell: (faculty) => (
          <Paragraph className="text-sm text-[#64748B]">{faculty.phone ?? '—'}</Paragraph>
        ),
      },
      {
        id: 'commission',
        header: 'Commission rate',
        width: '10rem',
        align: 'center',
        cell: (faculty) => (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <Paragraph className="text-sm font-semibold text-[#1E1B4B]">
                {faculty.commissionPercent}%
              </Paragraph>
              <button
                type="button"
                aria-label={`Edit commission for ${faculty.name}`}
                onClick={() => setEditingFaculty(faculty)}
                className="rounded-nav p-1 text-nav transition-colors hover:bg-surface-input hover:text-primary"
              >
                <Pencil className="size-3.5" aria-hidden />
              </button>
            </div>
            {faculty.hasCustomCommission ? (
              <StatusBadge label="Custom" variant="info" appearance="filled" />
            ) : (
              <Paragraph variant="caption" className="text-nav">
                Default
              </Paragraph>
            )}
          </div>
        ),
      },
      {
        id: 'courses',
        header: 'Courses',
        width: '6rem',
        align: 'center',
        cell: (faculty) => (
          <Paragraph className="text-sm text-[#64748B]">{faculty.coursesCount}</Paragraph>
        ),
      },
      {
        id: 'joined',
        header: 'Joined',
        width: '8rem',
        cell: (faculty) => (
          <Paragraph className="text-sm text-[#64748B]">{faculty.joinedDate}</Paragraph>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        width: '9.5rem',
        align: 'center',
        cell: (faculty) => {
          if (faculty.isSuspended) {
            return <StatusBadge label="Suspended" variant="suspended" appearance="filled" />
          }
          if (faculty.accountVerified === 'APPROVED') {
            return <StatusBadge label="Active" variant="active" appearance="filled" />
          }
          if (faculty.accountVerified === 'PENDING' || faculty.accountVerified === 'RESUBMITTED') {
            return <StatusBadge label="Pending" variant="pending" appearance="filled" />
          }
          if (faculty.accountVerified === 'REJECTED') {
            return <StatusBadge label="Rejected" variant="rejected" appearance="filled" />
          }
          return (
            <StatusBadge
              label={formatAccountStatus(faculty.accountVerified)}
              variant="info"
              appearance="filled"
            />
          )
        },
      },
    ],
    [],
  )

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Paragraph variant="emphasis" className="text-base text-ink-heading">
            Faculties who receive commission
          </Paragraph>
          <Paragraph variant="caption" className="mt-0.5 text-[13px]">
            Faculty members eligible for enrollment revenue share (excluding suspended).
          </Paragraph>
        </div>
        <span className="inline-flex items-center rounded-full bg-surface-input px-3 py-1 text-xs font-semibold text-nav">
          {totalCount} {totalCount === 1 ? 'faculty' : 'faculties'}
        </span>
      </div>

      <div className="relative max-w-md">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <Input
          placeholder="Search faculty by name, email, or mobile"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="pl-9"
        />
      </div>

      {isError ? (
        <Paragraph className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Could not load faculties.'}
        </Paragraph>
      ) : null}

      <DataTable
        columns={columns}
        data={faculties}
        getRowKey={(faculty) => faculty.id}
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={isLoading}
        loadingRowCount={PAGE_SIZE}
        scrollableBody
        scrollBodyMaxHeight="max-h-[22rem]"
        emptyMessage={
          isError
            ? 'Could not load faculties.'
            : 'No faculty found. Add faculty in User Management or check they are not suspended.'
        }
      />

      <FacultyCommissionEditModal
        faculty={editingFaculty}
        defaultCommissionPercent={defaultCommissionPercent}
        isSaving={isSaving}
        onClose={() => setEditingFaculty(null)}
        onSave={handleSaveCommission}
        onResetToDefault={handleResetToDefault}
      />
    </div>
  )
}
