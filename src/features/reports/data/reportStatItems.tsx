import type { LucideIcon } from 'lucide-react'
import { BookOpen, IndianRupee, TrendingUp, Wallet } from 'lucide-react'
import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'
import type { ReportsSummary } from '@/api/reports/reports.api'
import { formatGrowth, formatINRCompact } from '@/utils/formatCurrency'

type StatVisual = {
  label: string
  icon: LucideIcon
  iconTileClassName: string
  iconClassName: string
}

const statVisuals: Record<
  'grossRevenue' | 'platformEarnings' | 'totalEnrollments' | 'activeCourses',
  StatVisual
> = {
  grossRevenue: {
    label: 'Gross Revenue',
    icon: IndianRupee,
    iconTileClassName: 'bg-[#EEF2FF]',
    iconClassName: 'text-[#4338CA]',
  },
  platformEarnings: {
    label: 'Platform Earnings',
    icon: Wallet,
    iconTileClassName: 'bg-[#F0FDF4]',
    iconClassName: 'text-[#15803D]',
  },
  totalEnrollments: {
    label: 'Total Enrollments',
    icon: TrendingUp,
    iconTileClassName: 'bg-[#FFF7ED]',
    iconClassName: 'text-[#C2410C]',
  },
  activeCourses: {
    label: 'Active Courses',
    icon: BookOpen,
    iconTileClassName: 'bg-[#FEFCE8]',
    iconClassName: 'text-[#4D7C0F]',
  },
}

/** Growth badge, colored by direction. */
const growthFooter = (growth: number) => {
  const isNegative = growth < 0
  return {
    footer: <span className="text-xs font-semibold">{formatGrowth(growth)}</span>,
    footerClassName: isNegative ? 'text-[#DC2626]' : 'text-[#16A34A]',
  }
}

/**
 * Convert the reports summary API response into KPI grid items.
 * Returns an empty array while data is absent (loading).
 */
export function reportStatItems(data?: ReportsSummary): SummaryStatItem[] {
  if (!data) return []

  return [
    {
      id: 'grossRevenue',
      layout: 'inline',
      ...statVisuals.grossRevenue,
      value: formatINRCompact(data.grossRevenue.amount),
      ...growthFooter(data.grossRevenue.growth),
    },
    {
      id: 'platformEarnings',
      layout: 'inline',
      ...statVisuals.platformEarnings,
      value: formatINRCompact(data.platformEarnings.amount),
      ...growthFooter(data.platformEarnings.growth),
    },
    {
      id: 'totalEnrollments',
      layout: 'inline',
      ...statVisuals.totalEnrollments,
      value: data.totalEnrollments.amount.toLocaleString('en-IN'),
      ...growthFooter(data.totalEnrollments.growth),
    },
    {
      id: 'activeCourses',
      layout: 'inline',
      ...statVisuals.activeCourses,
      value: data.activeCourses.toLocaleString('en-IN'),
    },
  ]
}
