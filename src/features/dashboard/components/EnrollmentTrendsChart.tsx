import { useMemo, useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardBody } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { ChartPeriodFilter } from '@/features/dashboard/components/ChartPeriodFilter'
import {
  enrollmentSubtitles,
  enrollmentWeekTooltipLabels,
  type EnrollmentTrendPoint,
  type TrendPeriod,
} from '@/features/dashboard/data/chartTrends'
import { DASHBOARD_TRENDS_CHART_HEIGHT_CLASS } from '@/features/dashboard/constants/chartHeights'
import { useGetEnrollmentTrends } from '@/features/dashboard/hooks/useDashboardmanagement'
import { cn } from '@/utils/cn'

const STUDENTS_STROKE = '#2c1452'
const FACULTY_STROKE = '#22D3EE'

const ENROLLMENT_PERIOD_OPTIONS: { value: TrendPeriod; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

function getEnrollmentChartMargin(period: TrendPeriod) {
  return {
    top: 40,
    right: period === 'month' ? 48 : 16,
    left: 8,
    bottom: period === 'year' ? 12 : 28,
  }
}

type EnrollmentTrendsChartProps = { className?: string }

function formatYAxisTick(value: number) {
  if (value === 0) return '0'
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(value)
}

function formatXAxisTick(label: string, period: TrendPeriod) {
  if (period === 'month') {
    return label
  }
  return label.toUpperCase()
}

type EnrollmentTooltipPayloadEntry = {
  dataKey?: string | number
  value?: unknown
}

type EnrollmentTooltipContentProps = {
  active?: boolean
  payload?: ReadonlyArray<EnrollmentTooltipPayloadEntry>
  label?: string | number
  period: TrendPeriod
}

function tooltipValue(entry: EnrollmentTooltipPayloadEntry | undefined) {
  const value = entry?.value
  return typeof value === 'number' && !Number.isNaN(value) ? value : undefined
}

function EnrollmentTooltip({
  active,
  payload,
  label,
  period,
}: EnrollmentTooltipContentProps) {
  if (!active || !payload?.length || label == null) return null

  const students = tooltipValue(payload.find((entry) => entry.dataKey === 'students'))
  const faculty = tooltipValue(payload.find((entry) => entry.dataKey === 'faculty'))
  const heading =
    period === 'month' && typeof label === 'string'
      ? (enrollmentWeekTooltipLabels[label] ?? label)
      : String(label).toUpperCase()

  return (
    <div className="rounded-lg border border-[#e2e8f0]/80 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
      <p className="text-sm font-bold text-[#2c1452]">{heading}</p>
      <div className="mt-2.5 space-y-1.5">
        <div className="flex items-center justify-between gap-8 text-sm">
          <span className="text-[#64748B]">Students</span>
          <span className="font-bold text-[#2c1452]">
            {students != null ? students.toLocaleString() : '—'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-8 text-sm">
          <span className="text-[#64748B]">Faculty</span>
          <span className="font-bold text-[#2c1452]">
            {faculty != null ? faculty.toLocaleString() : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

function getYAxisConfig(_period: TrendPeriod, data: EnrollmentTrendPoint[]) {
  const max = Math.max(
    ...data.flatMap((point) => [point.students, point.faculty]),
    1,
  )
  const ceiling = Math.ceil(max / 500) * 500
  const ticks = Array.from({ length: 6 }, (_, index) => Math.round((ceiling / 5) * index))

  return { domain: [0, ceiling] as [number, number], ticks }
}

const EMPTY_TRENDS: EnrollmentTrendPoint[] = []

function EnrollmentChartSkeleton() {
  const barHeights = ['45%', '70%', '55%', '85%', '60%', '90%', '75%']

  return (
    <div className="flex h-full w-full gap-3">
      <div className="flex flex-col justify-between py-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-2.5 w-8" />
        ))}
      </div>
      <div className="flex flex-1 items-end justify-between gap-3 border-l border-b border-slate-100 px-2 pb-6">
        {barHeights.map((height, index) => (
          <Skeleton key={index} className="w-full max-w-[36px]" style={{ height }} />
        ))}
      </div>
    </div>
  )
}

export function EnrollmentTrendsChart({ className }: EnrollmentTrendsChartProps) {
  const [period, setPeriod] = useState<TrendPeriod>('month')
  const { data: trends = EMPTY_TRENDS, isLoading, isError } = useGetEnrollmentTrends(period)
  const subtitle = enrollmentSubtitles[period]
  const yAxis = useMemo(() => getYAxisConfig(period, trends), [period, trends])
  const chartMargin = useMemo(() => getEnrollmentChartMargin(period), [period])

  return (
    <Card className={cn('w-full p-6', className)}>
      <CardBody className="gap-5">
        <div className="flex flex-col gap-0.5">
          <SectionHeader
            title="Enrollment Trends"
            titleClassName="text-[#191c1e]"
            subtitle={subtitle}
            action={
              <ChartPeriodFilter
                value={period}
                onChange={setPeriod}
                periods={ENROLLMENT_PERIOD_OPTIONS}
              />
            }
          />
          <div className="flex justify-end">
            <div className="flex items-center gap-4 text-xs font-medium text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: STUDENTS_STROKE }}
                  aria-hidden
                />
                Students
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: FACULTY_STROKE }}
                  aria-hidden
                />
                Faculty
              </span>
            </div>
          </div>
        </div>

        <div className={cn('shrink-0 overflow-visible', DASHBOARD_TRENDS_CHART_HEIGHT_CLASS)}>
          {isLoading ? (
            <EnrollmentChartSkeleton />
          ) : isError ? (
            <div className="flex h-full items-center justify-center text-sm text-[#dc2626]">
              Failed to load enrollment trends.
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart key={period} data={trends} margin={chartMargin}>
            <defs>
              <linearGradient id="enrollmentStudentsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="enrollmentFacultyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#E2E8F0" vertical={false} />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: '#5F5E5E',
                fontSize: period === 'month' ? 10 : 11,
                fontWeight: 500,
              }}
              tickFormatter={(value) => formatXAxisTick(String(value), period)}
              dy={4}
              interval={0}
              padding={period === 'month' ? { left: 20, right: 36 } : { left: 8, right: 8 }}
              height={period === 'month' ? 40 : 30}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={formatYAxisTick}
              domain={yAxis.domain}
              ticks={yAxis.ticks}
              width={44}
            />

            <Tooltip
              content={(props) => (
                <EnrollmentTooltip
                  active={props.active}
                  payload={props.payload}
                  label={props.label}
                  period={period}
                />
              )}
              cursor={{ stroke: '#CBD5E1', strokeWidth: 1 }}
            />

            <Area
              type="monotone"
              dataKey="faculty"
              stroke="none"
              fill="url(#enrollmentFacultyFill)"
              fillOpacity={1}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            />

            <Area
              type="monotone"
              dataKey="students"
              stroke="none"
              fill="url(#enrollmentStudentsFill)"
              fillOpacity={1}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            />

            <Line
              type="monotone"
              dataKey="faculty"
              name="Faculty"
              stroke={FACULTY_STROKE}
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              activeDot={{ r: 5, fill: FACULTY_STROKE, stroke: '#fff', strokeWidth: 2 }}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            />

            <Line
              type="monotone"
              dataKey="students"
              name="Students"
              stroke={STUDENTS_STROKE}
              strokeWidth={2.5}
              dot={{
                r: 5,
                fill: STUDENTS_STROKE,
                stroke: '#fff',
                strokeWidth: 2,
              }}
              activeDot={{ r: 6, fill: STUDENTS_STROKE, stroke: '#fff', strokeWidth: 2 }}
              isAnimationActive
              animationDuration={1000}
              animationEasing="ease-out"
            />
            </ComposedChart>
          </ResponsiveContainer>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
