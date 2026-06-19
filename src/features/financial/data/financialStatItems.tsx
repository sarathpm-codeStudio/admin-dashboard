import { AlertTriangle, TrendingUp, Wallet } from 'lucide-react'
import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'

/** Top KPI cards for Financial Management (Platform Earnings intentionally omitted). */
export const financialStatItems: SummaryStatItem[] = [
  {
    id: 'totalRevenue',
    layout: 'inline',
    label: 'Total Revenue',
    value: '₹2.4 Cr',
    icon: Wallet,
    iconTileClassName: 'bg-[#EEF2FF]',
    iconClassName: 'text-[#4338CA]',
    footer: (
      <span className="flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
        <TrendingUp className="size-3.5" aria-hidden />
        +12%
      </span>
    ),
  },
  {
    id: 'todaysRevenue',
    layout: 'inline',
    label: "Today's Revenue",
    value: '₹1.2 L',
    icon: TrendingUp,
    iconTileClassName: 'bg-[#F0FDF4]',
    iconClassName: 'text-[#15803D]',
    footer: <span className="text-[10px] font-medium text-[#94A3B8]">vs. yesterday</span>,
  },
  {
    id: 'pendingPayouts',
    layout: 'inline',
    label: 'Pending Payouts',
    value: '₹18 L',
    icon: AlertTriangle,
    iconTileClassName: 'bg-[#FEF2F2]',
    iconClassName: 'text-[#DC2626]',
    footer: (
      <span className="rounded-full bg-[#FEF2F2] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#DC2626]">
        Needs Action
      </span>
    ),
  },
]
