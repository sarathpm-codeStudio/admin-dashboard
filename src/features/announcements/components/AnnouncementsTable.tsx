import { Pencil, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/StatusBadge'
import { TableRowActionsMenu } from '@/components/ui/TableRowActionsMenu'
import { Paragraph } from '@/components/ui/Typography'
import type { AnnouncementRecord, AnnouncementStatus } from '@/features/announcements/types'
import {
  ANNOUNCEMENTS_PAGE_SIZE,
  ANNOUNCEMENTS_TABLE_SCROLL_MAX_HEIGHT,
} from '@/features/announcements/utils/constants'
import { cn } from '@/utils/cn'

const statusLabel: Record<AnnouncementStatus, string> = {
  scheduled: 'Scheduled',
  active: 'Active',
  expired: 'Expired',
  draft: 'Draft',
}

const statusVariant: Record<AnnouncementStatus, StatusBadgeVariant> = {
  scheduled: 'pending',
  active: 'active',
  expired: 'rejected',
  draft: 'draft',
}

const statusDotClass: Record<AnnouncementStatus, string> = {
  scheduled: 'bg-amber-500',
  active: 'bg-emerald-500',
  expired: 'bg-red-500',
  draft: 'bg-[#656464]',
}

const COL_WIDTH = `${100 / 7}%`
const tableTextClass = 'font-bold text-[#44474E]'

type AnnouncementsTableProps = {
  announcements: AnnouncementRecord[]
  totalCount: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onEdit: (announcement: AnnouncementRecord) => void
  onDelete: (announcement: AnnouncementRecord) => void
  isLoading?: boolean
}

function AnnouncementStatusBadge({ status }: { status: AnnouncementStatus }) {
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

export function AnnouncementsTable({
  announcements,
  totalCount,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  isLoading = false,
}: AnnouncementsTableProps) {
  const columns = useMemo<DataTableColumn<AnnouncementRecord>[]>(
    () => [
      {
        id: 'name',
        header: 'Announcement Name',
        width: '18%',
        cell: (row) => (
          <Paragraph variant="emphasis" className={cn('truncate text-sm font-extrabold', tableTextClass)}>
            {row.name}
          </Paragraph>
        ),
      },
      {
        id: 'audience',
        header: 'Audience',
        width: COL_WIDTH,
        cell: (row) => (
          <Paragraph variant="muted" className={tableTextClass}>
            {row.audience}
          </Paragraph>
        ),
      },
      {
        id: 'course',
        header: 'Course',
        width: COL_WIDTH,
        cell: (row) => (
          <Paragraph variant="muted" className={cn('truncate', tableTextClass)}>
            {row.course}
          </Paragraph>
        ),
      },
      {
        id: 'date',
        header: 'Date',
        width: COL_WIDTH,
        align: 'center',
        cell: (row) => (
          <div className="flex justify-center">
            <Paragraph variant="muted" className={tableTextClass}>
              {row.date}
            </Paragraph>
          </div>
        ),
      },
      {
        id: 'timePeriod',
        header: 'Time Period',
        width: '14%',
        align: 'center',
        cell: (row) => (
          <div className="flex justify-center">
            <Paragraph variant="muted" className={cn('whitespace-nowrap', tableTextClass)}>
              {row.timePeriod}
            </Paragraph>
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        width: COL_WIDTH,
        align: 'center',
        cell: (row) => (
          <div className="flex justify-center">
            <AnnouncementStatusBadge status={row.status} />
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        width: COL_WIDTH,
        align: 'center',
        cell: (row) => (
          <div className="flex justify-center">
            <TableRowActionsMenu
              ariaLabel={`Actions for ${row.name}`}
              actions={[
                {
                  id: 'edit',
                  label: 'Edit',
                  icon: Pencil,
                  onClick: () => onEdit(row),
                },
                {
                  id: 'delete',
                  label: 'Delete',
                  icon: Trash2,
                  variant: 'danger',
                  onClick: () => onDelete(row),
                },
              ]}
            />
          </div>
        ),
      },
    ],
    [onDelete, onEdit],
  )

  return (
    <DataTable
      columns={columns}
      data={announcements}
      getRowKey={(row) => row.id}
      totalCount={totalCount}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      isLoading={isLoading}
      loadingRowCount={ANNOUNCEMENTS_PAGE_SIZE}
      animateRows={!isLoading}
      scrollableBody
      scrollBodyMaxHeight={ANNOUNCEMENTS_TABLE_SCROLL_MAX_HEIGHT}
      className="shrink-0 [&_thead_th]:font-bold [&_thead_th]:text-[#44474E] [&_tbody_td]:font-bold"
      footerClassName="[&_p]:font-bold [&_p]:text-[#44474E]"
      rowAnimationKey={`${page}-${announcements.length}-${announcements[0]?.id ?? 'empty'}`}
      tableClassName="table-fixed"
    />
  )
}
