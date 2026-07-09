import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { FacultyTransactionType, PayoutDetailRow } from '@/api/financial/financial.api'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { StatusBadgeVariant } from '@/components/ui/StatusBadge'
import { Header2, Paragraph } from '@/components/ui/Typography'
import { useGetPayoutDetail } from '@/features/financial/hooks/useFinancialManagement'

const typeBadge: Record<FacultyTransactionType, { label: string; variant: StatusBadgeVariant }> = {
  COURSE_SALE: { label: 'Course Sale', variant: 'active' },
  BUNDLE_SALE: { label: 'Bundle Sale', variant: 'active' },
  PLATFORM_FEE: { label: 'Platform Fee', variant: 'info' },
  PLATFORM_EARNING: { label: 'Platform Earning', variant: 'info' },
  PAYOUT: { label: 'Payout', variant: 'pending' },
  REFUND: { label: 'Refund', variant: 'rejected' },
}

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`

type PayoutDetailsModalProps = {
  open: boolean
  onClose: () => void
  payoutId: string | null
}

export function PayoutDetailsModal({ open, onClose, payoutId }: PayoutDetailsModalProps) {
  const { data: detail, isLoading, isError, error } = useGetPayoutDetail(open ? payoutId : null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const columns: DataTableColumn<PayoutDetailRow>[] = [
    {
      id: 'transactionId',
      header: 'Transaction ID',
      width: '12rem',
      className: 'align-top',
      cell: (row) => (
        <span className="text-ink-heading whitespace-nowrap text-sm font-semibold">
          {row.transactionId}
        </span>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      width: '8.5rem',
      className: 'align-top',
      cell: (row) => {
        const badge = typeBadge[row.type]
        return <StatusBadge label={badge.label} variant={badge.variant} />
      },
    },
    {
      id: 'item',
      header: 'Course / Bundle',
      width: '18rem',
      className: 'align-top',
      cell: (row) => (
        <span className="text-sm leading-snug text-[#334155]">{row.item}</span>
      ),
    },
    {
      id: 'gross',
      header: 'Gross',
      width: '6.5rem',
      align: 'right',
      headerClassName: 'text-right',
      className: 'align-top',
      cell: (row) => (
        <span className="whitespace-nowrap text-sm text-[#64748B]">{money(row.grossAmount)}</span>
      ),
    },
    {
      id: 'gst',
      header: 'GST',
      width: '5.5rem',
      align: 'right',
      headerClassName: 'text-right',
      className: 'align-top',
      cell: (row) => (
        <span className="whitespace-nowrap text-sm text-[#64748B]">{money(row.gstAmount)}</span>
      ),
    },
    {
      id: 'commission',
      header: 'Comm. %',
      width: '5.5rem',
      align: 'right',
      headerClassName: 'text-right',
      className: 'align-top',
      cell: (row) => (
        <span className="whitespace-nowrap text-sm text-[#64748B]">
          {row.commissionPercent != null ? `${row.commissionPercent}%` : '—'}
        </span>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      width: '7.5rem',
      align: 'right',
      headerClassName: 'text-right',
      className: 'align-top',
      cell: (row) => (
        <span className="whitespace-nowrap text-sm font-semibold text-[#1E1B4B]">
          {row.amountDisplay}
        </span>
      ),
    },
  ]

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payout-detail-title"
        className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-card border border-[#e2e8f0]/60 bg-surface-card shadow-lg"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-nav p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" aria-hidden />
        </button>

        {/* Branded header bar */}
        <div className="bg-[#2c1452] px-6 py-4">
          <Header2 size="section" id="payout-detail-title" className="text-white">
            Payout Details
          </Header2>
        </div>

        {/* Summary */}
        <div className="border-b border-[#e2e8f0]/70 px-6 pb-5 pt-5">
          {detail ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl bg-[#EFF6FF] p-4 sm:grid-cols-3 lg:grid-cols-6">
              <SummaryItem label="Faculty" value={detail.faculty} strong />
              <SummaryItem label="Period" value={detail.period} strong />
              <SummaryItem label="Date" value={detail.date} />
              <SummaryItem label="Total Gross" value={detail.grossTotalDisplay} strong />
              <SummaryItem label="Total GST" value={detail.gstTotalDisplay} strong />
              <SummaryItem label="Paid to Faculty" value={detail.payoutTotalDisplay} accent="green" />
              {/* Row 2: Payment Ref sits right after Payout ID */}
              <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                <SummaryItem
                  label="Platform Earning"
                  value={detail.platformEarningDisplay}
                  accent="blue"
                />
              </div>
              <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                <SummaryItem label="Payout ID" value={detail.payoutId} mono wrap />
              </div>
              <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                <SummaryItem label="Payment Ref" value={detail.paymentId} mono wrap />
              </div>
            </div>
          ) : (
            <Paragraph variant="muted" className="mt-3">
              {isError ? (error?.message ?? 'Failed to load payout.') : 'Loading payout…'}
            </Paragraph>
          )}
        </div>

        {/* Breakdown table */}
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
            Transaction breakdown
          </p>
          <div className="scrollbar-thin overflow-x-auto">
            <DataTable
              bare
              columns={columns}
              data={detail?.rows ?? []}
              isLoading={isLoading}
              loadingRowCount={5}
              getRowKey={(row) => row.id}
              emptyMessage="No transactions in this payout."
              showFooter={false}
              totalCount={detail?.rows.length ?? 0}
              page={1}
              totalPages={1}
              onPageChange={() => {}}
              className="rounded-none border-0 shadow-none"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function SummaryItem({
  label,
  value,
  mono,
  strong,
  accent,
  wrap,
}: {
  label: string
  value: string
  mono?: boolean
  strong?: boolean
  accent?: 'green' | 'blue'
  /** Show the full value (wraps) instead of truncating to one line. */
  wrap?: boolean
}) {
  const valueColor =
    accent === 'green'
      ? 'text-[#15803D]'
      : accent === 'blue'
        ? 'text-[#2563EB]'
        : strong
          ? 'text-[#1E1B4B]'
          : 'text-[#334155]'
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">{label}</p>
      <p
        className={[
          'mt-1',
          wrap ? 'break-all' : 'truncate',
          accent ? 'text-base font-bold' : 'text-sm',
          strong && !accent ? 'font-semibold' : '',
          mono ? 'font-mono text-xs' : '',
          valueColor,
        ].join(' ')}
        title={value}
      >
        {value}
      </p>
    </div>
  )
}
