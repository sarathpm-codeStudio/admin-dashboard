import {
  EarningsGrowthBarChart,
  toFigmaBarHeights,
} from '@/components/ui/EarningsGrowthBarChart'
import type { FacultyEarningsMonth } from '@/features/financial/data/mockFacultyRevenue'
import { cn } from '@/utils/cn'

const CHART_LEGEND_CURRENT = '#2c1452'
const CHART_TITLE_CLASS = 'text-[18px] font-bold leading-7 text-[#1E1B4B]'
const MARCH_INDEX = 2
const MARCH_TOOLTIP_VALUE = 64366

function ChartLegend() {
  return (
    <div className="flex shrink-0 items-center gap-4 text-xs font-medium text-[#1E1B4B]">
      <span className="flex items-center gap-1.5">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: CHART_LEGEND_CURRENT }}
          aria-hidden
        />
        Current Year
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-[#E2E8F0]" aria-hidden />
        Previous Year
      </span>
    </div>
  )
}

type FacultyEarningsGrowthChartProps = {
  data: FacultyEarningsMonth[]
  className?: string
}

export function FacultyEarningsGrowthChart({
  data,
  className,
}: FacultyEarningsGrowthChartProps) {
  const chartData = toFigmaBarHeights(
    data.map((row) => ({
      label: row.label,
      revenue: row.currentYear,
    })),
  )

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
          <p className="mt-1 text-sm text-[#64748B]">Monthly revenue trend</p>
        </div>
        <ChartLegend />
      </div>

      <EarningsGrowthBarChart
        data={chartData}
        pinnedLabel={{ index: MARCH_INDEX, value: MARCH_TOOLTIP_VALUE }}
      />
    </div>
  )
}
