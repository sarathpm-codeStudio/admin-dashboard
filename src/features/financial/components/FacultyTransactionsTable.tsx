import { useMemo, useState } from 'react'
import type { FacultyPayoutStatus, FacultyPayoutTransaction } from '@/api/FacultyManagement/facultyManagement.api'
import { Card } from '@/components/ui/Card'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { SearchInput } from '@/components/ui/SearchInput'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { StatusBadgeVariant } from '@/components/ui/StatusBadge'
import { Header2 } from '@/components/ui/Typography'
import { PayoutDetailsModal } from '@/features/financial/components/PayoutDetailsModal'
import { JoinedDateFilter } from '@/features/users/components/JoinedDateFilter'

const statusBadge: Record<FacultyPayoutStatus, { label: string; variant: StatusBadgeVariant }> = {
  SUCCESS: { label: 'SUCCESS', variant: 'active' },
  PENDING: { label: 'PENDING', variant: 'pending' },
  FAILED: { label: 'FAILED', variant: 'rejected' },
}

type FacultyTransactionsTableProps = {
  rows: FacultyPayoutTransaction[]
  totalCount: number
  page: number
  totalPages: number
  search: string
  dateFrom: string
  dateTo: string
  onSearchChange: (value: string) => void
  onDateChange: (from: string, to: string) => void
  onPageChange: (page: number) => void
  isLoading?: boolean
  isError?: boolean
}

export function FacultyTransactionsTable({
  rows,
  totalCount,
  page,
  totalPages,
  search,
  dateFrom,
  dateTo,
  onSearchChange,
  onDateChange,
  onPageChange,
  isLoading = false,
  isError = false,
}: FacultyTransactionsTableProps) {
  const [detailPayoutId, setDetailPayoutId] = useState<string | null>(null)

  const columns = useMemo<DataTableColumn<FacultyPayoutTransaction>[]>(
    () => [
      {
        id: 'transactionId',
        header: 'Transaction ID',
        width: '14rem',
        cell: (row) => (
          <span className="text-sm font-semibold text-[#1E1B4B]">{row.transactionId}</span>
        ),
      },
      {
        id: 'amount',
        header: 'Payout Amount',
        width: '10rem',
        cell: (row) => (
          <span className="text-sm font-semibold text-[#1E1B4B]">{row.amountDisplay}</span>
        ),
      },
      {
        id: 'gross',
        header: 'Gross Amount',
        width: '10rem',
        cell: (row) => (
          <span className="text-sm text-[#334155]">{row.grossDisplay}</span>
        ),
      },
      {
        id: 'date',
        header: 'Date',
        width: '10rem',
        cell: (row) => (
          <span className="text-sm text-[#334155]">{row.dateDisplay}</span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        width: '8.5rem',
        cell: (row) => {
          const badge = statusBadge[row.status] ?? statusBadge.PENDING
          return <StatusBadge label={badge.label} variant={badge.variant} />
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        width: '6rem',
        align: 'right',
        headerClassName: 'text-right',
        cell: (row) => (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setDetailPayoutId(row.transactionId)}
              className="text-ink-heading text-sm font-semibold outline-none transition-colors hover:opacity-70 focus-visible:underline"
            >
              View
            </button>
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
          Payout Transactions
        </Header2>
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            placeholder="Search by transaction ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            wrapperClassName="w-full min-w-[12rem] sm:w-72"
            className="rounded-lg border-0 bg-[#F8FAFC] shadow-none focus:border-0 focus:bg-[#F8FAFC] focus:ring-0"
          />
          <JoinedDateFilter
            label="Date Range"
            from={dateFrom}
            to={dateTo}
            onChange={onDateChange}
            className="shrink-0"
            fieldClassName="h-10 rounded-lg border-0 bg-[#F8FAFC] px-3 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
          />
        </div>
      </div>

      <DataTable
        bare
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
            ? 'Could not load payout transactions. Please try again.'
            : 'No payout transactions found.'
        }
        footerLayout="between"
        alwaysShowPagination
        className="rounded-none border-0 shadow-none"
      />

      <PayoutDetailsModal
        open={detailPayoutId !== null}
        payoutId={detailPayoutId}
        onClose={() => setDetailPayoutId(null)}
      />
    </Card>
  )
}
