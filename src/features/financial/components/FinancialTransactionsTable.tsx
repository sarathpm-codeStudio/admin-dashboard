import { useMemo, useState } from 'react'
import { Coins, TicketPercent } from 'lucide-react'
import type { FinancialTransactionRow, PaymentStatus } from '@/api/financial/financial.api'
import { Card } from '@/components/ui/Card'
import { TransactionDetailsModal } from '@/features/financial/components/TransactionDetailsModal'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { StatusBadgeVariant } from '@/components/ui/StatusBadge'
import { useGetFinancialTransactions } from '@/features/financial/hooks/useFinancialManagement'
import { JoinedDateFilter } from '@/features/users/components/JoinedDateFilter'

type TypeFilter = 'ALL' | 'SINGLE' | 'BUNDLE'
type StatusFilter = 'ALL' | PaymentStatus

const typeOptions: { value: TypeFilter; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'SINGLE', label: 'Single Course' },
  { value: 'BUNDLE', label: 'Bundle' },
]

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All Status' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
]

const statusBadge: Record<PaymentStatus, { label: string; variant: StatusBadgeVariant }> = {
  SUCCESS: { label: 'Success', variant: 'active' },
  PENDING: { label: 'Pending', variant: 'pending' },
  FAILED: { label: 'Failed', variant: 'rejected' },
}

export function FinancialTransactionsTable() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<TypeFilter>('ALL')
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [detailRow, setDetailRow] = useState<FinancialTransactionRow | null>(null)

  const { data: transactions, isLoading } = useGetFinancialTransactions()

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    const fromTs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null
    const toTs = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null
    return (transactions ?? []).filter((row) => {
      const matchesType =
        type === 'ALL' || (type === 'BUNDLE' ? row.isBundle : !row.isBundle)
      const matchesStatus = status === 'ALL' || row.status === status
      const matchesSearch =
        !query ||
        row.paymentId.toLowerCase().includes(query) ||
        row.student.toLowerCase().includes(query) ||
        row.faculty.toLowerCase().includes(query)
      const matchesDate = (() => {
        if (fromTs === null && toTs === null) return true
        if (!row.createdAt) return false
        const ts = new Date(row.createdAt).getTime()
        if (fromTs !== null && ts < fromTs) return false
        if (toTs !== null && ts > toTs) return false
        return true
      })()
      return matchesType && matchesStatus && matchesSearch && matchesDate
    })
  }, [transactions, search, type, status, dateFrom, dateTo])

  const columns = useMemo<DataTableColumn<FinancialTransactionRow>[]>(
    () => [
      {
        id: 'paymentId',
        header: 'Payment ID',
        width: '11rem',
        cell: (row) => (
          <span className="text-ink-heading text-sm font-semibold">{row.paymentId}</span>
        ),
      },
      {
        id: 'student',
        header: 'Student',
        cell: (row) => <span className="text-sm font-medium text-[#1E1B4B]">{row.student}</span>,
      },
      {
        id: 'faculty',
        header: 'Faculty',
        cell: (row) => <span className="text-sm text-[#334155]">{row.faculty}</span>,
      },
      {
        id: 'course',
        header: 'Course',
        cell: (row) => <span className="text-sm text-[#334155]">{row.course}</span>,
      },
      {
        id: 'coursePrice',
        header: 'Course Price',
        width: '8rem',
        cell: (row) => (
          <span className="text-sm text-[#334155]">{row.coursePriceDisplay}</span>
        ),
      },
      {
        id: 'amount',
        header: 'Paid Amount',
        width: '9rem',
        cell: (row) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-[#1E1B4B]">{row.amountDisplay}</span>
            {row.coinsUsed > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#B45309]">
                <Coins className="size-3" aria-hidden />
                {row.coinsUsed} coins used
              </span>
            )}
            {row.couponCode && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#7C3AED]">
                <TicketPercent className="size-3" aria-hidden />
                {row.couponCode}
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'type',
        header: 'Type',
        width: '9rem',
        cell: (row) =>
          row.isBundle ? (
            <StatusBadge label="Bundle" variant="pending" />
          ) : (
            <StatusBadge label="Single Course" variant="active" />
          ),
      },
      {
        id: 'date',
        header: 'Date',
        width: '9rem',
        cell: (row) => <span className="text-sm text-[#64748B]">{row.date}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        width: '9rem',
        align: 'right',
        headerClassName: 'text-right',
        cell: (row) => {
          const badge = statusBadge[row.status]
          return (
            <div className="flex justify-end">
              <StatusBadge label={badge.label} variant={badge.variant} />
            </div>
          )
        },
      },
    ],
    [],
  )

  return (
    <Card className="overflow-hidden p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <SearchInput
          placeholder="Payment ID / Student / Faculty"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          wrapperClassName="w-full min-w-[12rem] sm:w-72"
          className="rounded-lg border-0 bg-[#F8FAFC] shadow-none focus:border-0 focus:bg-[#F8FAFC] focus:ring-0"
        />
        <Select
          value={type}
          onChange={(e) => setType(e.target.value as TypeFilter)}
          className="bg-[#F8FAFC] py-2"
          wrapperClassName="w-full sm:w-auto"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="bg-[#F8FAFC] py-2"
          wrapperClassName="w-full sm:w-auto"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <JoinedDateFilter
          label="Date Range"
          from={dateFrom}
          to={dateTo}
          onChange={(from, to) => {
            setDateFrom(from)
            setDateTo(to)
          }}
          className="shrink-0"
          fieldClassName="h-10 rounded-lg border-0 bg-[#F8FAFC] px-3 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
        />
      </div>

      <DataTable
        bare
        columns={columns}
        data={rows}
        isLoading={isLoading}
        getRowKey={(row) => row.id}
        onRowClick={(row) => setDetailRow(row)}
        totalCount={rows.length}
        page={1}
        totalPages={1}
        onPageChange={() => {}}
        emptyMessage="No transactions found."
        footerLayout="between"
        alwaysShowPagination
        className="rounded-none border-0 shadow-none"
      />

      <TransactionDetailsModal
        open={detailRow !== null}
        onClose={() => setDetailRow(null)}
        transaction={detailRow}
      />
    </Card>
  )
}
