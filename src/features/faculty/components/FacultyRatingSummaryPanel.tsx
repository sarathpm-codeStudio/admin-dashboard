import { Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StarRating } from '@/components/ui/StarRating'
import type { FacultyReviewSummary } from '@/features/faculty/data/mockFacultyReviews'
import { cn } from '@/utils/cn'

const labelMutedClass =
  'text-[11px] font-semibold uppercase tracking-[0.08em] text-[#454652]'

const summaryCardClass =
  'flex min-h-[260px] flex-col rounded-xl border border-[#E2E8F0]/80 bg-white px-7 py-8 shadow-sm'

type FacultyRatingSummaryPanelProps = {
  summary: FacultyReviewSummary
  className?: string
}

export function FacultyRatingSummaryPanel({
  summary,
  className,
}: FacultyRatingSummaryPanelProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:gap-5 md:flex-row md:items-stretch',
        className,
      )}
    >
      <Card
        className={cn(
          summaryCardClass,
          'w-full items-center justify-center gap-5 text-center md:w-[min(100%,320px)] md:shrink-0',
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#454652]">
          AVG RATING
        </p>
        <p className="text-[3.5rem] font-bold leading-none tracking-tight text-[#000B60]">
          {summary.averageRating.toFixed(1)}
        </p>
        <StarRating
          value={summary.averageRating}
          starSizeClass="size-6"
          activeClassName="fill-[#49D7F4] text-[#49D7F4]"
          inactiveClassName="fill-[#E2E8F0] text-[#E2E8F0]"
          className="justify-center gap-1"
        />
        <p className={labelMutedClass}>
          TOTAL {summary.totalReviews} REVIEWS
        </p>
      </Card>

      <Card
        className={cn(
          summaryCardClass,
          'w-full shrink-0 justify-center md:w-[248px]',
        )}
      >
        <h2 className="text-base font-bold text-[#000B60]">Rating Distribution</h2>
        <ul className="mt-6 space-y-4">
          {summary.distribution.map((row) => (
            <li key={row.stars} className="flex items-center">
              <span className="w-3 text-sm font-bold tabular-nums text-[#000B60]">
                {row.stars}
              </span>
              <Star
                className="ml-2.5 size-4 shrink-0 fill-[#49D7F4] text-[#49D7F4]"
                aria-hidden
              />
              <span className="ml-8 text-sm font-medium text-[#454652]">
                {row.studentCount.toLocaleString()} Students
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
