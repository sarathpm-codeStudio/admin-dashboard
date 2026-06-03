import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'
import type { FacultyRevenueSummary } from '@/features/financial/data/mockFacultyRevenue'
import { MdOutlineAccountBalanceWallet, MdPendingActions } from 'react-icons/md'

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
  ]
}
