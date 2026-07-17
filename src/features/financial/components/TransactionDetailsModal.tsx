import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Coins, TicketPercent, X } from 'lucide-react'
import type { FinancialTransactionRow, PaymentStatus } from '@/api/financial/financial.api'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { StatusBadgeVariant } from '@/components/ui/StatusBadge'
import { Header2 } from '@/components/ui/Typography'
import { useGetTransactionSettlement } from '@/features/financial/hooks/useFinancialManagement'

const statusBadge: Record<PaymentStatus, { label: string; variant: StatusBadgeVariant }> = {
  SUCCESS: { label: 'Success', variant: 'active' },
  PENDING: { label: 'Pending', variant: 'pending' },
  FAILED: { label: 'Failed', variant: 'rejected' },
}

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`

type TransactionDetailsModalProps = {
  open: boolean
  onClose: () => void
  transaction: FinancialTransactionRow | null
}

/**
 * Purchase breakdown for one transaction row — shows the admin exactly what
 * the student did at checkout: original course price, platform-offer discount,
 * coin redemption (admin-funded, workflow §9), GST inside the payment, and
 * what was finally paid. All data comes from the row itself (no extra fetch).
 */
export function TransactionDetailsModal({ open, onClose, transaction }: TransactionDetailsModalProps) {
  // Settled sales return the recorded payout figures; unpaid ones an estimate
  // at the current commission rate (labelled as such below).
  const { data: settlement } = useGetTransactionSettlement(open ? transaction : null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !transaction) return null

  const t = transaction
  const badge = statusBadge[t.status]
  const usedCoins = t.coinsUsed > 0
  const usedOffer = t.offerDiscountAmount > 0
  // Coupon: coupon_redemptions (linked via enrollment_id) is authoritative;
  // fall back to the enrollment's own coupon fields.
  const couponCode = settlement?.coupon?.code ?? t.couponCode
  const couponSave = settlement?.coupon?.saveAmount ?? t.couponDiscountAmount
  const usedCoupon = couponCode !== null || couponSave > 0
  const adminSubsidy = t.coinRedeemAmount + t.offerDiscountAmount

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
        aria-labelledby="transaction-detail-title"
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-card border border-[#e2e8f0]/60 bg-surface-card shadow-lg"
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
          <Header2 size="section" id="transaction-detail-title" className="text-white">
            Transaction Details
          </Header2>
        </div>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
          {/* Who / what */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-[#e2e8f0]/70 px-6 py-5 sm:grid-cols-3">
            <SummaryItem label="Student" value={t.student} strong />
            <SummaryItem label="Faculty" value={t.faculty} />
            <SummaryItem label={t.isBundle ? 'Bundle' : 'Course'} value={t.course} strong />
            <SummaryItem label="Date" value={t.date} />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">Status</p>
              <div className="mt-1">
                <StatusBadge label={badge.label} variant={badge.variant} />
              </div>
            </div>
            <SummaryItem label="Payment ID" value={t.paymentId} mono wrap />
          </div>

          {/* Purchase breakdown */}
          <div className="px-6 py-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
              Purchase breakdown
            </p>
            <div className="overflow-hidden rounded-2xl border border-[#e2e8f0]/70">
              {t.coursePrice != null && t.coursePrice > 0 && (
                <BreakdownRow label="Course Price" value={money(t.coursePrice)} />
              )}
              {usedCoupon && (
                <BreakdownRow
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      <TicketPercent className="size-3.5 text-[#7C3AED]" aria-hidden />
                      Coupon{couponCode ? ` (${couponCode})` : ''}
                    </span>
                  }
                  value={couponSave > 0 ? `− ${money(couponSave)}` : 'applied'}
                  accent="green"
                  hint="faculty-funded"
                />
              )}
              {usedOffer && (
                <BreakdownRow
                  label="Platform Offer"
                  value={`− ${money(t.offerDiscountAmount)}`}
                  accent="green"
                  hint="admin-funded"
                />
              )}
              {usedCoins && (
                <BreakdownRow
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      <Coins className="size-3.5 text-[#B45309]" aria-hidden />
                      Coin Redemption ({t.coinsUsed} coins)
                    </span>
                  }
                  value={`− ${money(t.coinRedeemAmount)}`}
                  accent="green"
                  hint="admin-funded"
                />
              )}
              {t.gstAmount > 0 && (
                <BreakdownRow label="GST (included)" value={money(t.gstAmount)} muted />
              )}
              <BreakdownRow label="Paid Amount" value={t.amountDisplay} total />
            </div>

            {adminSubsidy > 0 && (
              <p className="mt-3 text-xs leading-relaxed text-[#64748B]">
                The student used {usedCoins ? `${t.coinsUsed} coins` : ''}
                {usedCoins && usedOffer ? ' and ' : ''}
                {usedOffer ? 'a platform offer' : ''} worth {money(adminSubsidy)} in total.
                This is funded by the platform — the faculty payout is calculated as if the
                student had paid full price (workflow §9).
              </p>
            )}
            {usedCoupon && (
              <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                Coupon {couponCode ? <b>{couponCode}</b> : null} saved the student{' '}
                {couponSave > 0 ? <b>{money(couponSave)}</b> : 'money'} — it is a faculty-created
                discount and reduces the faculty&apos;s payout, not the platform&apos;s commission.
              </p>
            )}
            {adminSubsidy === 0 && !usedCoupon && (
              <p className="mt-3 text-xs leading-relaxed text-[#64748B]">
                No coins, offers or coupons were used on this purchase.
              </p>
            )}
          </div>

          {/* Money split — where the paid amount goes (workflow §9/§10) */}
          {settlement && (
            <div className="border-t border-[#e2e8f0]/70 px-6 py-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Money split
                </p>
                {settlement.settled ? (
                  <span className="rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#15803D]">
                    Settled{settlement.period ? ` · ${settlement.period}` : ''}
                  </span>
                ) : (
                  <span className="rounded-full bg-[#FFFBEB] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#D97706]">
                    Estimated · settles at next payout run
                  </span>
                )}
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#e2e8f0]/70">
                <BreakdownRow label="Paid Amount" value={t.amountDisplay} />
                {t.gstAmount > 0 && (
                  <BreakdownRow label="GST → government" value={`− ${money(t.gstAmount)}`} muted />
                )}
                <BreakdownRow
                  label={`Faculty share (${100 - settlement.commissionPercent}%)`}
                  value={`− ${money(settlement.facultyShare)}`}
                />
                {settlement.adminSubsidy > 0 && (
                  <BreakdownRow
                    label={`Admin commission (${settlement.commissionPercent}% gross)`}
                    value={money(settlement.commission)}
                    muted
                  />
                )}
                {settlement.adminSubsidy > 0 && (
                  <BreakdownRow
                    label="Coin & offer subsidy funded"
                    value={`− ${money(settlement.adminSubsidy)}`}
                    muted
                  />
                )}
                <BreakdownRow
                  label={`Admin gets${settlement.adminSubsidy > 0 ? ' (net)' : ` (${settlement.commissionPercent}%)`}`}
                  value={money(settlement.adminNet)}
                  total
                />
              </div>

              {settlement.settled ? (
                <p className="mt-3 text-xs leading-relaxed text-[#64748B]">
                  Figures are the recorded payout values (rate frozen at {settlement.commissionPercent}%).
                  {settlement.payoutId ? <> Payout ref: <b>{settlement.payoutId}</b>.</> : null}
                </p>
              ) : (
                <p className="mt-3 text-xs leading-relaxed text-[#64748B]">
                  Estimated at the faculty&apos;s current rate ({settlement.commissionPercent}%) —
                  the final figures are fixed by the monthly payout run.
                </p>
              )}
            </div>
          )}
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
  wrap,
}: {
  label: string
  value: string
  mono?: boolean
  strong?: boolean
  wrap?: boolean
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">{label}</p>
      <p
        className={[
          'mt-1',
          wrap ? 'break-all' : 'truncate',
          'text-sm',
          strong ? 'font-semibold text-[#1E1B4B]' : 'text-[#334155]',
          mono ? 'font-mono text-xs' : '',
        ].join(' ')}
        title={value}
      >
        {value}
      </p>
    </div>
  )
}

function BreakdownRow({
  label,
  value,
  accent,
  muted,
  total,
  hint,
}: {
  label: React.ReactNode
  value: string
  accent?: 'green'
  muted?: boolean
  total?: boolean
  hint?: string
}) {
  return (
    <div
      className={[
        'flex items-center justify-between gap-4 px-4 py-3',
        total ? 'bg-[#F8FAFC]' : 'border-b border-[#e2e8f0]/60',
      ].join(' ')}
    >
      <span
        className={[
          'text-sm',
          total ? 'font-semibold text-[#1E1B4B]' : muted ? 'text-[#94A3B8]' : 'text-[#334155]',
        ].join(' ')}
      >
        {label}
        {hint && (
          <span className="ml-2 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2563EB]">
            {hint}
          </span>
        )}
      </span>
      <span
        className={[
          'whitespace-nowrap text-sm',
          total
            ? 'text-base font-bold text-[#1E1B4B]'
            : accent === 'green'
              ? 'font-semibold text-[#15803D]'
              : muted
                ? 'text-[#94A3B8]'
                : 'font-medium text-[#334155]',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  )
}
