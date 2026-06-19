import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { StatusBadgeVariant } from '@/components/ui/StatusBadge'
import {
  financialTransactions,
  type FinancialTransaction,
  type FinancialTransactionStatus,
} from '@/features/financial/data/mockFinancialManagement'

const statusBadge: Record<FinancialTransactionStatus, { label: string; variant: StatusBadgeVariant }> = {
  SUCCESS: { label: 'Success', variant: 'active' },
  PENDING: { label: 'Pending', variant: 'pending' },
  FAILED: { label: 'Failed', variant: 'rejected' },
}

const statusOptions: { value: 'ALL' | FinancialTransactionStatus; label: string }[] = [
  { value: 'ALL', label: 'All Status' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
]

export function FinancialTransactionsTable() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | FinancialTransactionStatus>('ALL')

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return financialTransactions.filter((row) => {
      const matchesStatus = status === 'ALL' || row.status === status
      const matchesSearch =
        !query ||
        row.transactionId.toLowerCase().includes(query) ||
        row.student.toLowerCase().includes(query)
      return matchesStatus && matchesSearch
    })
  }, [search, status])

  const columns = useMemo<DataTableColumn<FinancialTransaction>[]>(
    () => [
      {
        id: 'transactionId',
        header: 'Transaction ID',
        width: '11rem',
        cell: (row) => (
          <span className="text-sm font-semibold text-[#4338CA]">{row.transactionId}</span>
        ),
      },
      {
        id: 'student',
        header: 'Student',
        cell: (row) => <span className="text-sm font-medium text-[#1E1B4B]">{row.student}</span>,
      },
      {
        id: 'course',
        header: 'Course',
        cell: (row) => <span className="text-sm text-[#334155]">{row.course}</span>,
      },
      {
        id: 'amount',
        header: 'Amount',
        width: '8rem',
        cell: (row) => <span className="text-sm font-semibold text-[#1E1B4B]">{row.amount}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        width: '9rem',
        cell: (row) => {
          const badge = statusBadge[row.status]
          return <StatusBadge label={badge.label} variant={badge.variant} />
        },
      },
      {
        id: 'date',
        header: 'Date',
        width: '9rem',
        cell: (row) => <span className="text-sm text-[#64748B]">{row.date}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        width: '6rem',
        align: 'right',
        headerClassName: 'text-right',
        cell: () => (
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm font-semibold text-[#4338CA] outline-none transition-colors hover:text-[#1E1B4B] focus-visible:underline"
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
          placeholder="Txn ID / Student Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          wrapperClassName="w-full min-w-[12rem] sm:w-72"
          className="rounded-lg border-0 bg-[#F8FAFC] shadow-none focus:border-0 focus:bg-[#F8FAFC] focus:ring-0"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'ALL' | FinancialTransactionStatus)}
          className="bg-[#F8FAFC] py-2"
          wrapperClassName="w-full sm:w-auto"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <DataTable
        bare
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
        totalCount={rows.length}
        page={1}
        totalPages={1}
        onPageChange={() => {}}
        emptyMessage="No transactions found."
        footerLayout="between"
        alwaysShowPagination
        className="rounded-none border-0 shadow-none"
      />
    </Card>
  )
}
