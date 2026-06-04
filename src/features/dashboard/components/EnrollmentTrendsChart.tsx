import { useMemo } from 'react'
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
import { ChartPeriodFilter } from '@/features/dashboard/components/ChartPeriodFilter'
import {
  enrollmentMonthTickLabels,
  enrollmentSubtitles,
  enrollmentTooltipMonths,
  enrollmentTrendsByPeriod,
  type EnrollmentTrendPoint,
  type TrendPeriod,
} from '@/features/dashboard/data/chartTrends'
import {
  DASHBOARD_TRENDS_CHART_HEIGHT_CLASS,
  DASHBOARD_TRENDS_CHART_MARGIN,
} from '@/features/dashboard/constants/chartHeights'
import { useTrendPeriod } from '@/features/dashboard/hooks/useTrendPeriod'
import { cn } from '@/utils/cn'

const STUDENTS_STROKE = '#000b60'
const FACULTY_STROKE = '#22D3EE'
const MONTH_Y_MAX = 3000
const MONTH_Y_TICKS = [0, 500, 1000, 1500, 2000, 2500]

type EnrollmentTrendsChartProps = { className?: string }

function formatYAxisTick(value: number) {
  if (value === 0) return '0'
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(value)
}

function formatXAxisTick(label: string, period: TrendPeriod) {
  if (period === 'month') {
    return enrollmentMonthTickLabels[label] ?? label.toUpperCase()
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
      ? (enrollmentTooltipMonths[label] ?? String(label).toUpperCase())
      : String(label).toUpperCase()

  return (
    <div className="rounded-lg border border-[#e2e8f0]/80 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
      <p className="text-sm font-bold text-[#000b60]">{heading}</p>
      <div className="mt-2.5 space-y-1.5">
        <div className="flex items-center justify-between gap-8 text-sm">
          <span className="text-[#64748B]">Students</span>
          <span className="font-bold text-[#000b60]">
            {students != null ? students.toLocaleString() : '—'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-8 text-sm">
          <span className="text-[#64748B]">Faculty</span>
          <span className="font-bold text-[#000b60]">
            {faculty != null ? faculty.toLocaleString() : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

function getYAxisConfig(period: TrendPeriod, data: EnrollmentTrendPoint[]) {
  if (period === 'month') {
    return { domain: [0, MONTH_Y_MAX] as [number, number], ticks: MONTH_Y_TICKS }
  }

  const max = Math.max(
    ...data.flatMap((point) => [point.students, point.faculty]),
    1,
  )
  const ceiling = Math.ceil(max / 500) * 500
  const ticks = Array.from({ length: 6 }, (_, index) => Math.round((ceiling / 5) * index))

  return { domain: [0, ceiling] as [number, number], ticks }
}

export function EnrollmentTrendsChart({ className }: EnrollmentTrendsChartProps) {
  const { period, setPeriod, data } = useTrendPeriod(enrollmentTrendsByPeriod)
  const subtitle = enrollmentSubtitles[period]
  const yAxis = useMemo(() => getYAxisConfig(period, data), [period, data])

  return (
    <Card className={cn('w-full p-6', className)}>
      <CardBody className="gap-5">
        <div className="flex flex-col gap-0.5">
          <SectionHeader
            title="Enrollment Trends"
            titleClassName="text-[#191c1e]"
            subtitle={subtitle}
            action={<ChartPeriodFilter value={period} onChange={setPeriod} />}
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

        <div className={cn('shrink-0', DASHBOARD_TRENDS_CHART_HEIGHT_CLASS)}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={DASHBOARD_TRENDS_CHART_MARGIN}>
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
              tick={{ fill: '#5F5E5E', fontSize: 11, fontWeight: 500 }}
              tickFormatter={(value) => formatXAxisTick(String(value), period)}
              dy={10}
              interval={0}
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
              isAnimationActive={false}
            />

            <Area
              type="monotone"
              dataKey="students"
              stroke="none"
              fill="url(#enrollmentStudentsFill)"
              fillOpacity={1}
              isAnimationActive={false}
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
              isAnimationActive={false}
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
              isAnimationActive={false}
            />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  )
}
