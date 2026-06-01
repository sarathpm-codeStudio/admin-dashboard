import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardBody, cardPaddingClass } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ChartPeriodFilter } from '@/features/dashboard/components/ChartPeriodFilter'
import { enrollmentTrendsByPeriod } from '@/features/dashboard/data/chartTrends'
import { useTrendPeriod } from '@/features/dashboard/hooks/useTrendPeriod'
import { cn } from '@/utils/cn'

type EnrollmentTrendsChartProps = { className?: string }

export function EnrollmentTrendsChart({ className }: EnrollmentTrendsChartProps) {
  const { period, setPeriod, data, subtitle } = useTrendPeriod(enrollmentTrendsByPeriod)

  return (
    <Card className={cn('w-full', cardPaddingClass, className)}>
      <CardBody>
        <SectionHeader
          title="Enrollment Trends"
          subtitle={subtitle}
          action={<ChartPeriodFilter value={period} onChange={setPeriod} />}
        />
        <div className="flex items-center gap-4 text-xs text-nav">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary" />
            Students
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary-300" />
            Faculty
          </span>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="students"
                name="Students"
                stroke="#000b60"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="faculty"
                name="Faculty"
                stroke="#a5b4fc"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  )
}
