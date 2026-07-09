import { AlertTriangle, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import type { FinancialSummary } from '@/api/financial/financial.api'
import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'

/** Growth footer — green when up, red when down. */
const growthFooter = (display: string | null, suffix?: string) => {
  if (!display) return suffix
    ? <span className="text-[10px] font-medium text-[#94A3B8]">{suffix}</span>
    : undefined
  const isNegative = display.includes('↓')
  const Icon = isNegative ? TrendingDown : TrendingUp
  return (
    <span
      className={`flex items-center gap-1 text-xs font-semibold ${isNegative ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}
    >
      <Icon className="size-3.5" aria-hidden />
      {display}
      {suffix ? (
        <span className="text-[10px] font-medium text-[#94A3B8]">{suffix}</span>
      ) : null}
    </span>
  )
}

/**
 * Top KPI cards for Financial Management (Platform Earnings intentionally omitted).
 * Converts the `getFinancialSummary` API response into grid items;
 * returns an empty array while data is absent (loading).
 */
export function financialStatItems(data?: FinancialSummary): SummaryStatItem[] {
  if (!data) return []

  return [
    {
      id: 'totalRevenue',
      layout: 'inline',
      label: 'Total Revenue',
      value: data.totalRevenue.display,
      icon: Wallet,
      iconTileClassName: 'bg-[#EEF2FF]',
      iconClassName: 'text-[#4338CA]',
      footer: (
        <span className="flex flex-col items-end gap-1.5">
          {growthFooter(data.totalRevenue.growthDisplay)}
          {data.totalRevenue.pending > 0 ? (
            <span className="whitespace-nowrap rounded-full bg-[#FFFBEB] px-3 py-1 text-[11px] font-semibold text-[#D97706]">
              {data.totalRevenue.pendingDisplay} pending
            </span>
          ) : null}
        </span>
      ),
    },
    {
      id: 'todaysRevenue',
      layout: 'inline',
      label: "Today's Revenue",
      value: data.todaysRevenue.display,
      icon: TrendingUp,
      iconTileClassName: 'bg-[#F0FDF4]',
      iconClassName: 'text-[#15803D]',
      footer: growthFooter(data.todaysRevenue.growthDisplay, 'vs. yesterday'),
    },
    {
      id: 'pendingPayouts',
      layout: 'inline',
      label: 'Pending Payouts',
      value: data.pendingPayouts.display,
      icon: AlertTriangle,
      iconTileClassName: 'bg-[#FEF2F2]',
      iconClassName: 'text-[#DC2626]',
      footer: (
        <span className="flex flex-col items-end gap-1.5">
          {data.pendingPayouts.previousMonth > 0 ? (
            <>
              <span className="whitespace-nowrap rounded-full bg-[#FEF2F2] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#DC2626]">
                Needs Action
              </span>
              <span className="whitespace-nowrap rounded-full bg-[#FFF7ED] px-3 py-1 text-[11px] font-semibold text-[#C2410C]">
                {data.pendingPayouts.previousMonthLabel}: {data.pendingPayouts.previousMonthDisplay} ready
              </span>
            </>
          ) : (
            <span className="whitespace-nowrap rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#15803D]">
              All Settled
            </span>
          )}
        </span>
      ),
    },
  ]
}
