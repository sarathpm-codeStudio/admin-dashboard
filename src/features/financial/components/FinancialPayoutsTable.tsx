import { useMemo, useState } from 'react'
import type { FinancialPayoutRow, PayoutStatus } from '@/api/financial/financial.api'
import { Card } from '@/components/ui/Card'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { StatusBadgeVariant } from '@/components/ui/StatusBadge'
import { PayoutDetailsModal } from '@/features/financial/components/PayoutDetailsModal'
import { useGetFinancialPayouts } from '@/features/financial/hooks/useFinancialManagement'

type StatusFilter = 'ALL' | PayoutStatus

const statusBadge: Record<PayoutStatus, { label: string; variant: StatusBadgeVariant }> = {
  SUCCESS: { label: 'Paid', variant: 'active' },
  PENDING: { label: 'Pending', variant: 'pending' },
  FAILED: { label: 'Failed', variant: 'rejected' },
}

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All Status' },
  { value: 'SUCCESS', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
]

export function FinancialPayoutsTable() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [period, setPeriod] = useState('ALL')
  const [detailPayoutId, setDetailPayoutId] = useState<string | null>(null)

  const { data: payouts, isLoading } = useGetFinancialPayouts()

  // Distinct payout periods (e.g. "June 2026"), newest first.
  const periodOptions = useMemo(() => {
    const set = new Set<string>()
    for (const p of payouts ?? []) {
      if (p.period && p.period !== '—') set.add(p.period)
    }
    return [...set].sort(
      (a, b) => new Date(`1 ${b}`).getTime() - new Date(`1 ${a}`).getTime(),
    )
  }, [payouts])

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (payouts ?? []).filter((row) => {
      const matchesStatus = status === 'ALL' || row.status === status
      const matchesPeriod = period === 'ALL' || row.period === period
      const matchesSearch =
        !query ||
        row.payoutId.toLowerCase().includes(query) ||
        row.paymentId.toLowerCase().includes(query) ||
        row.faculty.toLowerCase().includes(query)
      return matchesStatus && matchesPeriod && matchesSearch
    })
  }, [payouts, search, status, period])

  const columns = useMemo<DataTableColumn<FinancialPayoutRow>[]>(
    () => [
      {
        id: 'payoutId',
        header: 'Payout ID',
        width: '11rem',
        cell: (row) => (
          <span className="text-ink-heading text-sm font-semibold">{row.payoutId}</span>
        ),
      },
      {
        id: 'paymentId',
        header: 'Payment ID',
        width: '11rem',
        cell: (row) => <span className="text-sm text-[#334155]">{row.paymentId}</span>,
      },
      {
        id: 'faculty',
        header: 'Faculty',
        cell: (row) => <span className="text-sm font-medium text-[#1E1B4B]">{row.faculty}</span>,
      },
      {
        id: 'period',
        header: 'Period',
        width: '9rem',
        cell: (row) => <span className="text-sm text-[#334155]">{row.period}</span>,
      },
      {
        id: 'sales',
        header: 'Sales',
        width: '6rem',
        cell: (row) => <span className="text-sm text-[#334155]">{row.salesCount}</span>,
      },
      {
        id: 'commission',
        header: 'Commission',
        width: '8rem',
        cell: (row) => (
          <span className="text-sm text-[#334155]">
            {row.commissionPercent != null ? `${row.commissionPercent}%` : '—'}
          </span>
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
        id: 'date',
        header: 'Date',
        width: '9rem',
        cell: (row) => <span className="text-sm text-[#64748B]">{row.date}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        width: '8rem',
        cell: (row) => {
          const badge = statusBadge[row.status]
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
              onClick={() => setDetailPayoutId(row.payoutId)}
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
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <SearchInput
          placeholder="Payout ID / Payment ID / Faculty"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          wrapperClassName="w-full min-w-[12rem] sm:w-72"
          className="rounded-lg border-0 bg-[#F8FAFC] shadow-none focus:border-0 focus:bg-[#F8FAFC] focus:ring-0"
        />
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
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-[#F8FAFC] py-2"
          wrapperClassName="w-full sm:w-auto"
        >
          <option value="ALL">All Periods</option>
          {periodOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </div>

      <DataTable
        bare
        columns={columns}
        data={rows}
        isLoading={isLoading}
        getRowKey={(row) => row.id}
        totalCount={rows.length}
        page={1}
        totalPages={1}
        onPageChange={() => {}}
        emptyMessage="No payouts found."
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
