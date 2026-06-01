import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardBody, cardPaddingClass } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ChartPeriodFilter } from '@/features/dashboard/components/ChartPeriodFilter'
import { revenueGrowthByPeriod, revenueTrendsByPeriod } from '@/features/dashboard/data/chartTrends'
import { useTrendPeriod } from '@/features/dashboard/hooks/useTrendPeriod'
import { cn } from '@/utils/cn'

type RevenueTrendsChartProps = { className?: string }

export function RevenueTrendsChart({ className }: RevenueTrendsChartProps) {
  const { period, setPeriod, data, subtitle } = useTrendPeriod(revenueTrendsByPeriod)
  const growthPercent = revenueGrowthByPeriod[period]

  const growthLabel =
    period === 'week' ? 'from last week' : period === 'month' ? 'from last month' : 'from last year'

  return (
    <Card className={cn('w-full', cardPaddingClass, className)}>
      <CardBody>
        <SectionHeader
          title="Revenue Trends"
          subtitle={subtitle}
          action={<ChartPeriodFilter value={period} onChange={setPeriod} />}
        />
        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
          <TrendingUp className="size-3.5" aria-hidden />
          {growthPercent}% increase {growthLabel}
        </span>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(v) => `₹${v}L`}
              />
              <Tooltip
                formatter={(value: number) => [`₹${value} L`, 'Revenue']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="revenue" fill="#000b60" radius={[6, 6, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  )
}
