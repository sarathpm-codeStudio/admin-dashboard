import { useMemo, useState } from 'react'
import {
  EarningsGrowthBarChart,
  EARNINGS_GROWTH_CHART_HEIGHT_CLASS,
  toRelativeBarHeights,
} from '@/components/ui/EarningsGrowthBarChart'
import { Skeleton } from '@/components/ui/Skeleton'
import { ChartPeriodFilter } from '@/features/dashboard/components/ChartPeriodFilter'
import type { RevenueTrendPoint, TrendPeriod } from '@/features/dashboard/data/chartTrends'
import { useGetFacultyRevenueTrends } from '@/features/faculty/hooks/useFacultyManagement'
import { cn } from '@/utils/cn'

const CHART_TITLE_CLASS = 'text-[18px] font-bold leading-7 text-[#1E1B4B]'

const EMPTY_TRENDS: RevenueTrendPoint[] = []

const PERIOD_SUBTITLES: Record<TrendPeriod, string> = {
  week: 'Daily earnings (last 7 days)',
  month: 'Weekly earnings (last 4 weeks)',
  year: 'Monthly earnings (last 12 months)',
}

/**
 * Index + value of the bucket to pin the tooltip badge on. Defaults to the
 * current (last) bucket so an all-equal or all-zero dataset highlights the
 * latest period; a strictly higher earlier bucket still wins as the peak.
 */
function getPeakPoint(data: RevenueTrendPoint[]) {
  if (data.length === 0) return null
  let peakIndex = data.length - 1
  for (let i = data.length - 2; i >= 0; i--) {
    if ((data[i]?.revenue ?? 0) > (data[peakIndex]?.revenue ?? 0)) peakIndex = i
  }
  return { index: peakIndex, value: data[peakIndex]?.revenue ?? 0 }
}

function EarningsChartSkeleton() {
  const barHeights = ['40%', '60%', '50%', '85%', '70%', '45%']

  return (
    <div className="flex h-full w-full items-end justify-between gap-3 px-2 pb-6">
      {barHeights.map((height, index) => (
        <Skeleton key={index} className="w-full max-w-[44px]" style={{ height }} />
      ))}
    </div>
  )
}

type FacultyEarningsGrowthChartProps = {
  facultyId: string
  className?: string
}

export function FacultyEarningsGrowthChart({
  facultyId,
  className,
}: FacultyEarningsGrowthChartProps) {
  const [period, setPeriod] = useState<TrendPeriod>('year')
  const {
    data: trends = EMPTY_TRENDS,
    isLoading,
    isError,
  } = useGetFacultyRevenueTrends(facultyId, period)

  const chartData = useMemo(
    () => toRelativeBarHeights(trends.map((p) => ({ label: p.label ?? '', revenue: p.revenue }))),
    [trends],
  )
  const peak = useMemo(() => getPeakPoint(trends), [trends])

  return (
    <div
      className={cn(
        'flex flex-col rounded-card border border-[#e2e8f0]/60 bg-surface-card p-6 shadow-sm',
        className,
      )}
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 className={CHART_TITLE_CLASS}>Earnings Growth</h2>
          <p className="mt-1 text-sm text-[#64748B]">{PERIOD_SUBTITLES[period]}</p>
        </div>
        <ChartPeriodFilter value={period} onChange={setPeriod} />
      </div>

      <div className={cn('shrink-0', EARNINGS_GROWTH_CHART_HEIGHT_CLASS)}>
        {isLoading ? (
          <EarningsChartSkeleton />
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-sm text-[#dc2626]">
            Failed to load earnings.
          </div>
        ) : (
          <EarningsGrowthBarChart
            data={chartData}
            heightClassName="h-full w-full"
            pinnedLabel={peak ?? undefined}
          />
        )}
      </div>
    </div>
  )
}
