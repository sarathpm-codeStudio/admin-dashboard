import { FacultyEarningsGrowthChart } from '@/features/financial/components/FacultyEarningsGrowthChart'
import { FacultyRevenueSourceCard } from '@/features/financial/components/FacultyRevenueSourceCard'
import { cn } from '@/utils/cn'

type FacultyRevenueAnalyticsPanelProps = {
  facultyId: string
  className?: string
}

/** Earnings Growth 70% + Revenue Source 30% */
export function FacultyRevenueAnalyticsPanel({
  facultyId,
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
        <FacultyEarningsGrowthChart facultyId={facultyId} />
      </div>
      <div className="min-w-0">
        <FacultyRevenueSourceCard facultyId={facultyId} />
      </div>
    </div>
  )
}
