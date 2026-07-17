import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'
import type { FacultyRevenueSummary } from '@/features/financial/data/mockFacultyRevenue'
import { MdOutlineAccountBalanceWallet, MdOutlineLocalOffer, MdPendingActions } from 'react-icons/md'

const growthBadgeClass =
  'inline-flex rounded-full bg-[#A8EDFF] px-2.5 py-0.5 text-xs font-semibold text-[#00A6BF]'

export function getFacultyRevenueStatItems(
  summary: FacultyRevenueSummary,
): SummaryStatItem[] {
  return [
    {
      id: 'total-revenue',
      label: 'Total Revenue',
      value: summary.totalRevenue,
      headerAdornment: (
        <div
          className="mb-3 flex size-10 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#4338CA]"
          aria-hidden
        >
          <MdOutlineAccountBalanceWallet className="size-5" />
        </div>
      ),
      className: 'relative',
      footerClassName: 'absolute right-5 top-5',
      footer: (
        <span className={growthBadgeClass}>+{summary.revenueGrowthPercent}%</span>
      ),
    },
    {
      id: 'pending-payout',
      label: 'Pending Payout',
      value: summary.pendingPayout,
      headerAdornment: (
        <div
          className="mb-3 flex size-10 items-center justify-center rounded-lg bg-[#FFFBEB] text-[#D97706]"
          aria-hidden
        >
          <MdPendingActions className="size-5" />
        </div>
      ),
    },
    {
      // Coin/offer discounts the PLATFORM funded on this faculty's sales.
      // Added back to the payout base, so the faculty is paid as if students
      // paid full price (workflow §9) — value overridden from live stats.
      id: 'promo-support',
      label: 'Platform Promo Support',
      value: '—',
      headerAdornment: (
        <div
          className="mb-3 flex size-10 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#B45309]"
          aria-hidden
        >
          <MdOutlineLocalOffer className="size-5" />
        </div>
      ),
    },
  ]
}
