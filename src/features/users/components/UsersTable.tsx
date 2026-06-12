import { MoreVertical } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/StatusBadge'
import { Paragraph } from '@/components/ui/Typography'
import { USERS_TABLE_SCROLL_MAX_HEIGHT, USERS_PAGE_SIZE } from '@/features/users/utils/constants'
import type { UserRecord, UserStatus } from '@/features/users/types'
import { cn } from '@/utils/cn'
import { ProfileAvatar } from '@/components/ui/ProfileAvatar'


const statusVariant: Record<UserStatus, StatusBadgeVariant> = {
  active: 'active',
  pending: 'pending',
  rejected: 'rejected',
  suspended: 'suspended',
}

const statusLabel: Record<UserStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  rejected: 'Rejected',
  suspended: 'Suspended',
}

/** Equal column width so spacing between headers and cells is uniform */
const COL_WIDTH = `${100 / 6}%`

type UsersTableProps = {
  users: UserRecord[]
  totalCount: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function UsersTable({
  users,
  totalCount,
  page,
  totalPages,
  onPageChange,
  isLoading = false,
}: UsersTableProps) {
  const columns = useMemo<DataTableColumn<UserRecord>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        width: COL_WIDTH,
        cell: (user) => (
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                user.avatarClassName,
              )}
            >
              {user.avatarUrl ? <ProfileAvatar src={user.avatarUrl} alt={user.name} sizeClassName="size-10" roundedClassName="rounded-full" /> : user.initials}
            </div>
            <div className="min-w-0">
              {user.role === 'Faculty' ? (
                <Link
                  to={`/userdetails/faculty/${user.id}`}
                  className="block truncate no-underline hover:text-primary"
                >
                  <Paragraph variant="emphasis" className="truncate">
                    {user.name}
                  </Paragraph>
                </Link>
              ) : user.role === 'Student' ? (
                <Link
                  to={`/userdetails/student/${user.id}`}
                  className="block truncate no-underline hover:text-primary"
                >
                  <Paragraph variant="emphasis" className="truncate">
                    {user.name}
                  </Paragraph>
                </Link>
              ) : (
                <Paragraph variant="emphasis" className="truncate">
                  {user.name}
                </Paragraph>
              )}
              <Paragraph variant="caption" className="truncate">
                {user.email}
              </Paragraph>
            </div>
          </div>
        ),
      },
      {
        id: 'role',
        header: 'Role',
        width: COL_WIDTH,
        align: 'center',
        cell: (user) => (
          <div className="flex justify-center">
            <Paragraph
              className={user.role === 'Faculty' ? 'font-medium text-[#2c1452]' : undefined}
            >
              {user.role}
            </Paragraph>
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        width: COL_WIDTH,
        align: 'center',
        cell: (user) => (
          <div className="flex justify-center">
            <StatusBadge
              label={statusLabel[user.status]}
              variant={statusVariant[user.status]}
              appearance="text"
            />
          </div>
        ),
      },
      {
        id: 'courses',
        header: 'Courses',
        width: COL_WIDTH,
        align: 'center',
        cell: (user) => (
          <div className="flex justify-center">
            <Paragraph variant="muted">
              {/* {user.coursesCount} Courses */}
              {user.coursesCount === 0 ? 'No courses' : user.coursesCount + ' Courses'}
            </Paragraph>
          </div>
        ),
      },
      {
        id: 'joined',
        header: 'Joined Date',
        width: COL_WIDTH,
        align: 'center',
        cell: (user) => (
          <div className="flex justify-center">
            <Paragraph variant="muted">{user.joinedDate}</Paragraph>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        width: COL_WIDTH,
        align: 'center',
        cell: () => (
          <div className="flex justify-center">
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-nav text-nav transition-colors hover:bg-surface-input hover:text-ink-heading"
              aria-label="Row actions"
            >
              <MoreVertical className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DataTable
      columns={columns}
      data={users}
      getRowKey={(user) => user.id}
      totalCount={totalCount}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      isLoading={isLoading}
      loadingRowCount={USERS_PAGE_SIZE}
      animateRows={!isLoading}
      scrollableBody
      scrollBodyMaxHeight={USERS_TABLE_SCROLL_MAX_HEIGHT}
      className="shrink-0"
      rowAnimationKey={`${page}-${users.length}-${users[0]?.id ?? 'empty'}`}
    />
  )
}
