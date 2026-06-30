import { useMemo, useState } from 'react'
import { Card, CardBody } from '@/components/ui/Card'
import {
  EarningsGrowthBarChart,
  toRelativeBarHeights,
} from '@/components/ui/EarningsGrowthBarChart'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { ChartPeriodFilter } from '@/features/dashboard/components/ChartPeriodFilter'
import {
  periodSubtitles,
  type RevenueTrendPoint,
  type TrendPeriod,
} from '@/features/dashboard/data/chartTrends'
import { DASHBOARD_TRENDS_CHART_HEIGHT_CLASS } from '@/features/dashboard/constants/chartHeights'
import { useGetRevenueTrends } from '@/features/dashboard/hooks/useDashboardmanagement'
import { cn } from '@/utils/cn'

type RevenueTrendsChartProps = {
  className?: string
  fillHeight?: boolean
}

const EMPTY_TRENDS: RevenueTrendPoint[] = []

/**
 * Index + value of the bucket to pin the tooltip badge on.
 * Defaults to the current bucket (last day/week/month) so an all-equal or
 * all-zero dataset highlights "today" rather than the first bucket. A strictly
 * higher earlier bucket still wins as the peak.
 */
function getPeakPoint(data: RevenueTrendPoint[]) {
  if (data.length === 0) return null
  let peakIndex = data.length - 1
  for (let i = data.length - 2; i >= 0; i--) {
    if ((data[i]?.revenue ?? 0) > (data[peakIndex]?.revenue ?? 0)) peakIndex = i
  }
  return { index: peakIndex, value: data[peakIndex]?.revenue ?? 0 }
}

/** Period-over-period growth %, comparing the last bucket to the previous one. */
function RevenueChartSkeleton() {
  const barHeights = ['40%', '60%', '50%', '85%', '70%', '45%']

  return (
    <div className="flex h-full w-full items-end justify-between gap-3 px-2 pb-6">
      {barHeights.map((height, index) => (
        <Skeleton key={index} className="w-full max-w-[44px]" style={{ height }} />
      ))}
    </div>
  )
}

export function RevenueTrendsChart({ className, fillHeight = false }: RevenueTrendsChartProps) {
  const [period, setPeriod] = useState<TrendPeriod>('month')
  const { data: trends = EMPTY_TRENDS, isLoading, isError } = useGetRevenueTrends(period)
  const subtitle = periodSubtitles[period]

  const chartData = useMemo(
    () => toRelativeBarHeights(trends.map((p) => ({ label: p.label ?? '', revenue: p.revenue }))),
    [trends],
  )
  const peak = useMemo(() => getPeakPoint(trends), [trends])
  return (
    <Card className={cn('w-full p-6', fillHeight && 'flex min-h-0 flex-col', className)}>
      <CardBody className={cn('gap-5', fillHeight && 'min-h-0 flex-1')}>
        <div className="flex flex-col gap-0.5">
          <SectionHeader
            title="Revenue Trends"
            titleClassName="text-[#191c1e]"
            subtitle={subtitle}
            action={<ChartPeriodFilter value={period} onChange={setPeriod} />}
          />
          <div className="flex justify-end">
            <span className="flex items-center gap-1 text-xs font-medium text-[#3A3A3A]">
              {/* <TrendingUp className="size-3.5" aria-hidden />
              {growthPercent}% {growthPercent >= 0 ? 'increase' : 'decrease'} {growthLabel} */}
            </span>
          </div>
        </div>

        <div
          className={cn(
            fillHeight
              ? 'min-h-[300px] flex-1 sm:min-h-[340px]'
              : cn('shrink-0', DASHBOARD_TRENDS_CHART_HEIGHT_CLASS),
          )}
        >
          {isLoading ? (
            <RevenueChartSkeleton />
          ) : isError ? (
            <div className="flex h-full items-center justify-center text-sm text-[#dc2626]">
              Failed to load revenue trends.
            </div>
          ) : (
            <EarningsGrowthBarChart
              data={chartData}
              heightClassName="h-full w-full"
              pinnedLabel={peak ?? undefined}
            />
          )}
        </div>
      </CardBody>
    </Card>
  )
}
