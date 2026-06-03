import { TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { Card, CardBody } from '@/components/ui/Card'
import {
  EarningsGrowthBarChart,
  toFigmaBarHeights,
  toRelativeBarHeights,
} from '@/components/ui/EarningsGrowthBarChart'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ChartPeriodFilter } from '@/features/dashboard/components/ChartPeriodFilter'
import type { TrendPeriod } from '@/features/dashboard/data/chartTrends'
import { revenueGrowthByPeriod, revenueTrendsByPeriod } from '@/features/dashboard/data/chartTrends'
import { useTrendPeriod } from '@/features/dashboard/hooks/useTrendPeriod'
import { cn } from '@/utils/cn'

const MARCH_INDEX = 2
const MARCH_TOOLTIP_VALUE = 64366

type RevenueTrendsChartProps = { className?: string }

function buildChartData(period: TrendPeriod, data: { label: string; revenue: number }[]) {
  if (period === 'month') {
    return toFigmaBarHeights(data)
  }
  return toRelativeBarHeights(data)
}

export function RevenueTrendsChart({ className }: RevenueTrendsChartProps) {
  const { period, setPeriod, data, subtitle } = useTrendPeriod(revenueTrendsByPeriod)
  const growthPercent = revenueGrowthByPeriod[period]

  const chartData = useMemo(() => buildChartData(period, data), [period, data])

  const growthLabel =
    period === 'week' ? 'from last week' : period === 'month' ? 'from last month' : 'from last year'

  return (
    <Card className={cn('w-full p-6', className)}>
      <CardBody className="gap-6">
        <SectionHeader
          title="Revenue Trends"
          subtitle={subtitle}
          action={<ChartPeriodFilter value={period} onChange={setPeriod} />}
        />
        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
          <TrendingUp className="size-3.5" aria-hidden />
          {growthPercent}% increase {growthLabel}
        </span>
        <EarningsGrowthBarChart
          data={chartData}
          pinnedLabel={
            period === 'month'
              ? { index: MARCH_INDEX, value: MARCH_TOOLTIP_VALUE }
              : undefined
          }
        />
      </CardBody>
    </Card>
  )
}
