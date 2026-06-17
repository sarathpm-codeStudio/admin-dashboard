import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

type FacultyRevenuePageHeaderProps = {
  className?: string
}

export function FacultyRevenuePageHeader({ className }: FacultyRevenuePageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <h1 className="font-sans text-2xl font-bold leading-tight text-ink-heading sm:text-3xl">
        Revenue Breakdown
      </h1>

      <div className="flex flex-wrap items-center gap-3">
        {/* <Button
          type="button"
          variant="outline"
          className="shrink-0  bg-[#E6E8EA] text-sm font-medium text-[#454652] hover:bg-[#dce0e3]"
        >
          <Calendar className="size-4" aria-hidden />
          Last 12 Months
        </Button> */}
        <Button type="button" variant="primary" className="shrink-0">
          <Download className="size-4" aria-hidden />
          Export Statement
        </Button>
      </div>
    </div>
  )
}
