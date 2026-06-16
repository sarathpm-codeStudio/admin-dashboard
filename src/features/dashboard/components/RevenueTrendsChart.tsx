import { TrendingUp } from 'lucide-react'
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

type RevenueTrendsChartProps = { className?: string }

const EMPTY_TRENDS: RevenueTrendPoint[] = []

/** Index + value of the highest revenue bucket, for the pinned tooltip badge. */
function getPeakPoint(data: RevenueTrendPoint[]) {
  if (data.length === 0) return null
  let peakIndex = 0
  for (let i = 1; i < data.length; i++) {
    if ((data[i]?.revenue ?? 0) > (data[peakIndex]?.revenue ?? 0)) peakIndex = i
  }
  return { index: peakIndex, value: data[peakIndex]?.revenue ?? 0 }
}

/** Period-over-period growth %, comparing the last bucket to the previous one. */
function getGrowthPercent(data: RevenueTrendPoint[]) {
  if (data.length < 2) return 0
  const last = data[data.length - 1]?.revenue ?? 0
  const prev = data[data.length - 2]?.revenue ?? 0
  if (prev > 0) return parseFloat((((last - prev) / prev) * 100).toFixed(1))
  return last > 0 ? 100 : 0
}

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

export function RevenueTrendsChart({ className }: RevenueTrendsChartProps) {
  const [period, setPeriod] = useState<TrendPeriod>('month')
  const { data: trends = EMPTY_TRENDS, isLoading, isError } = useGetRevenueTrends(period)
  const subtitle = periodSubtitles[period]

  const chartData = useMemo(
    () => toRelativeBarHeights(trends.map((p) => ({ label: p.label ?? '', revenue: p.revenue }))),
    [trends],
  )
  const peak = useMemo(() => getPeakPoint(trends), [trends])
  const growthPercent = useMemo(() => getGrowthPercent(trends), [trends])

  const growthLabel =
    period === 'week' ? 'from last week' : period === 'month' ? 'from last month' : 'from last year'

  return (
    <Card className={cn('w-full p-6', className)}>
      <CardBody className="gap-5">
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

        <div className={cn('shrink-0', DASHBOARD_TRENDS_CHART_HEIGHT_CLASS)}>
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
