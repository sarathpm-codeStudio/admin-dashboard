import { FacultyEarningsGrowthChart } from '@/features/financial/components/FacultyEarningsGrowthChart'
import { FacultyRevenueSourceCard } from '@/features/financial/components/FacultyRevenueSourceCard'
import type { FacultyEarningsMonth, FacultyRevenueSource } from '@/features/financial/data/mockFacultyRevenue'
import { cn } from '@/utils/cn'

type FacultyRevenueAnalyticsPanelProps = {
  earnings: FacultyEarningsMonth[]
  source: FacultyRevenueSource
  className?: string
}

/** Earnings Growth 70% + Revenue Source 30% */
export function FacultyRevenueAnalyticsPanel({
  earnings,
  source,
  className,
}: FacultyRevenueAnalyticsPanelProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:items-start',
        className,
      )}
    >
      <div className="min-w-0">
        <FacultyEarningsGrowthChart data={earnings} />
      </div>
      <div className="min-w-0">
        <FacultyRevenueSourceCard source={source} />
      </div>
    </div>
  )
}
