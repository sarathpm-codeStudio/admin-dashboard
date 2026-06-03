import { useMemo } from 'react'
import filterIcon from '@/asset/image/filter.png'
import { Card } from '@/components/ui/Card'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { ProfileAvatar } from '@/components/ui/ProfileAvatar'
import { SearchInput } from '@/components/ui/SearchInput'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Header2 } from '@/components/ui/Typography'
import type { FacultyTransaction } from '@/features/financial/data/mockFacultyRevenue'
import { cn } from '@/utils/cn'

const typeBadgeVariant = {
  bundle: 'bundle',
  individual: 'individual',
} as const

type FacultyTransactionsTableProps = {
  rows: FacultyTransaction[]
  totalCount: number
  page: number
  totalPages: number
  search: string
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
}

export function FacultyTransactionsTable({
  rows,
  totalCount,
  page,
  totalPages,
  search,
  onSearchChange,
  onPageChange,
}: FacultyTransactionsTableProps) {
  const columns = useMemo<DataTableColumn<FacultyTransaction>[]>(
    () => [
      {
        id: 'transactionId',
        header: 'Transaction ID',
        width: '12rem',
        cell: (row) => (
          <span className="text-sm text-[#94a3b8]">#{row.transactionId}</span>
        ),
      },
      {
        id: 'courseName',
        header: 'Course Name',
        cell: (row) => (
          <span className="text-sm font-semibold text-[#1E1B4B]">{row.courseName}</span>
        ),
      },
      {
        id: 'student',
        header: 'Student',
        width: '14rem',
        cell: (row) => (
          <div className="flex items-center gap-2.5">
            {row.studentAvatarUrl ? (
              <ProfileAvatar
                src={row.studentAvatarUrl}
                alt=""
                sizeClassName="size-8"
                roundedClassName="rounded-full"
              />
            ) : (
              <div
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  row.studentAvatarClassName,
                )}
              >
                {row.studentInitials}
              </div>
            )}
            <span className="text-sm font-medium text-[#334155]">{row.studentName}</span>
          </div>
        ),
      },
      {
        id: 'date',
        header: 'Date',
        width: '9.5rem',
        cell: (row) => (
          <span className="text-sm text-[#334155]">{row.date}</span>
        ),
      },
      {
        id: 'type',
        header: 'Type',
        width: '8.5rem',
        align: 'right',
        headerClassName: 'text-right',
        cell: (row) => (
          <div className="flex justify-end">
            <StatusBadge
              label={row.type === 'bundle' ? 'BUNDLE' : 'INDIVIDUAL'}
              variant={typeBadgeVariant[row.type]}
            />
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <Card className="overflow-hidden p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Header2 size="card" className="text-[#1E1B4B]">
          Recent Transactions
        </Header2>
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            wrapperClassName="w-full min-w-[12rem] sm:w-72"
            className="rounded-lg border-0 bg-[#F8FAFC] shadow-none focus:border-0 focus:bg-[#F8FAFC] focus:ring-0"
          />
          <button
            type="button"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border-0 bg-[#F8FAFC] transition-colors hover:bg-[#F1F5F9]"
            aria-label="Filter transactions"
          >
            <img src={filterIcon} alt="" className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <DataTable
        bare
        appearance="minimal"
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        footerLayout="between"
        footerSummary={`Showing ${rows.length} of ${totalCount.toLocaleString()} transactions`}
        paginationVariant="labeled"
        alwaysShowPagination
        className="rounded-none border-0 shadow-none"
      />
    </Card>
  )
}
