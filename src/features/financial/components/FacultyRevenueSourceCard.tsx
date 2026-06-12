import { ProgressBar } from '@/components/ui/ProgressBar'
import { getRevenueCardHeight } from '@/features/financial/data/facultyAnalyticsLayout'
import type { FacultyRevenueSource } from '@/features/financial/data/mockFacultyRevenue'
import { cn } from '@/utils/cn'

type FacultyRevenueSourceCardProps = {
  source: FacultyRevenueSource
  className?: string
}

export function FacultyRevenueSourceCard({
  source,
  className,
}: FacultyRevenueSourceCardProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col self-start overflow-hidden rounded-card border border-[#e2e8f0]/60 p-5 shadow-sm',
        'bg-surface-input',
        className,
      )}
      style={{
        backgroundColor: '#F2F4F6',
        height: getRevenueCardHeight(),
      }}
    >
      <div className="mb-3 shrink-0">
        <h2 className="text-[14px] font-bold leading-5 text-[#1E1B4B]">Revenue Source</h2>
        <p className="mt-0.5 text-xs leading-4 text-[#64748B]">
          Bundles vs Individual Courses
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-4">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-[#1E1B4B]">Course Bundles</p>
            <span className="text-xs font-bold text-[#1E1B4B]">
              {source.bundlesPercent}%
            </span>
          </div>
          <ProgressBar
            value={source.bundlesPercent}
            className="h-3"
            trackClassName="bg-white"
            fillClassName="rounded-full bg-[#2c1452]"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-[#1E1B4B]">Individual Courses</p>
            <span className="text-xs font-bold text-[#1E1B4B]">
              {source.individualPercent}%
            </span>
          </div>
          <ProgressBar
            value={source.individualPercent}
            className="h-3"
            trackClassName="bg-white"
            fillClassName="rounded-full bg-[#22D3EE]"
          />
        </div>
      </div>
    </div>
  )
}
