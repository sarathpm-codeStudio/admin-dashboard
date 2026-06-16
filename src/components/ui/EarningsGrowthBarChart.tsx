import type { LabelProps, TooltipProps } from 'recharts'
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/utils/cn'

export type EarningsGrowthBarPoint = {
  label: string
  revenue: number
  /** Original (pre-scaled) value shown in the hover tooltip / badge. */
  actual?: number
}

export type EarningsGrowthPinnedLabel = {
  index: number
  value: number
  badgeColor?: string
}

/** Figma bar heights (30% → peak); Mar center + Feb/Apr neighbors bumped */
export const EARNINGS_FIGMA_BAR_HEIGHTS: Record<string, number> = {
  Jan: 30,
  Feb: 54,
  Mar: 76,
  Apr: 98,
  May: 75,
  Jun: 45,
}

export const EARNINGS_BAR_HEIGHT_MIN = 30
export const EARNINGS_BAR_HEIGHT_MAX = 98

export const EARNINGS_GROWTH_CHART_HEIGHT_CLASS = 'h-[280px] w-full sm:h-[300px]'

export const EARNINGS_GROWTH_CHART_MARGIN = {
  top: 40,
  right: 16,
  left: 16,
  bottom: 0,
} as const

const CHART_BAR = '#2c1452'
const CHART_AXIS_COLOR = '#5F5E5E'
const DEFAULT_PINNED_BADGE = '#6366F1'

export function toRelativeBarHeights(
  data: EarningsGrowthBarPoint[],
): EarningsGrowthBarPoint[] {
  if (data.length === 0) return []

  const values = data.map((point) => point.revenue)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  const span = EARNINGS_BAR_HEIGHT_MAX - EARNINGS_BAR_HEIGHT_MIN

  if (range === 0) {
    return data.map((point) => ({
      label: point.label,
      revenue: EARNINGS_BAR_HEIGHT_MIN,
      actual: point.revenue,
    }))
  }

  return data.map((point) => ({
    label: point.label,
    revenue: Math.round(
      EARNINGS_BAR_HEIGHT_MIN + ((point.revenue - min) / range) * span,
    ),
    actual: point.revenue,
  }))
}

export function toFigmaBarHeights(
  data: EarningsGrowthBarPoint[],
): EarningsGrowthBarPoint[] {
  return data.map((point) => ({
    label: point.label,
    revenue: EARNINGS_FIGMA_BAR_HEIGHTS[point.label] ?? point.revenue,
  }))
}

function formatRupee(value: number) {
  return `₹${value.toLocaleString('en-IN')}`
}

function PinnedBarLabel(badgeColor: string, value: number, targetIndex: number) {
  return function PinnedLabel(props: LabelProps) {
    const { x, y, width, index } = props
    if (index !== targetIndex) return null

    const barX = typeof x === 'number' ? x : Number(x)
    const barY = typeof y === 'number' ? y : Number(y)
    const barWidth = typeof width === 'number' ? width : Number(width)

    if (Number.isNaN(barX) || Number.isNaN(barY) || Number.isNaN(barWidth)) {
      return null
    }

    const cx = barX + barWidth / 2
    const badgeW = 76
    const badgeH = 26
    const left = cx - badgeW / 2
    const top = barY - badgeH - 10

    return (
      <g>
        <rect x={left} y={top} width={badgeW} height={badgeH} rx={6} fill={badgeColor} />
        <text
          x={cx}
          y={top + 17}
          textAnchor="middle"
          fill="#fff"
          fontSize={11}
          fontWeight={600}
        >
          {formatRupee(value)}
        </text>
        <path
          d={`M${cx - 5} ${top + badgeH} L${cx + 5} ${top + badgeH} L${cx} ${top + badgeH + 5} Z`}
          fill={badgeColor}
        />
      </g>
    )
  }
}

function HoverTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || payload == null || payload.length === 0) return null

  const point = payload[0]?.payload as EarningsGrowthBarPoint | undefined
  if (point == null) return null

  const value = point.actual ?? point.revenue

  // Same badge style as the pinned peak label (indigo pill + pointer).
  return (
    <div className="relative flex flex-col items-center">
      <div
        className="rounded-md px-3 py-1 text-[11px] font-semibold text-white shadow-sm"
        style={{ backgroundColor: DEFAULT_PINNED_BADGE }}
      >
        {formatRupee(value)}
      </div>
      <div
        className="h-0 w-0 border-x-[5px] border-t-[5px] border-x-transparent"
        style={{ borderTopColor: DEFAULT_PINNED_BADGE }}
      />
    </div>
  )
}

type EarningsGrowthBarChartProps = {
  data: EarningsGrowthBarPoint[]
  className?: string
  heightClassName?: string
  pinnedLabel?: EarningsGrowthPinnedLabel
  yAxisDomain?: [number, number]
  barCategoryGap?: string | number
  margin?: { top?: number; right?: number; left?: number; bottom?: number }
}

export function EarningsGrowthBarChart({
  data,
  className,
  heightClassName = EARNINGS_GROWTH_CHART_HEIGHT_CLASS,
  pinnedLabel,
  yAxisDomain = [0, 100],
  barCategoryGap = '10%',
  margin = EARNINGS_GROWTH_CHART_MARGIN,
}: EarningsGrowthBarChartProps) {
  const pinnedContent =
    pinnedLabel != null
      ? PinnedBarLabel(
          pinnedLabel.badgeColor ?? DEFAULT_PINNED_BADGE,
          pinnedLabel.value,
          pinnedLabel.index,
        )
      : null

  return (
    <div className={cn('shrink-0', heightClassName, className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={margin} barCategoryGap={barCategoryGap}>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: CHART_AXIS_COLOR,
              fontSize: 11,
              fontWeight: 500,
            }}
            dy={10}
          />
          <YAxis hide domain={yAxisDomain} />
          <Tooltip
            cursor={false}
            content={<HoverTooltip />}
            isAnimationActive
            animationDuration={200}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="revenue"
            fill={CHART_BAR}
            radius={0}
            maxBarSize={44}
            isAnimationActive={false}
          >
            {pinnedContent != null && <LabelList content={pinnedContent} />}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
