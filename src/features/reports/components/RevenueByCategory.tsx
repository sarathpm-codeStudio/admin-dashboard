import { Card, CardBody } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { useGetRevenueByCategory } from '@/features/reports/hooks/useReports'
import { formatINRCompact } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

type RevenueByCategoryProps = {
  className?: string
  fillHeight?: boolean
}

export function RevenueByCategory({ className, fillHeight = false }: RevenueByCategoryProps) {
  const { data: categories = [], isLoading, isError } = useGetRevenueByCategory()
  const topPercent = categories[0]?.percent ?? 0

  return (
    <Card className={cn('w-full p-6', fillHeight && 'flex min-h-0 flex-col', className)}>
      <CardBody className={cn('gap-5', fillHeight && 'min-h-0 flex-1')}>
        <SectionHeader
          title="Revenue by Category"
          titleClassName="text-[#191c1e]"
          subtitle="Gross enrollment revenue per course category"
        />

        {isLoading ? (
          <div className="space-y-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[#dc2626]">
            Failed to load category revenue.
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-nav">
            No enrollment revenue to report yet.
          </div>
        ) : (
          <ul className="m-0 list-none space-y-5 p-0">
            {categories.map((category) => (
              <li key={category.category} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-ink-heading">
                    {category.category}
                  </span>
                  <span className="shrink-0 font-semibold text-ink-heading">
                    {formatINRCompact(category.amount)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <ProgressBar
                    value={topPercent > 0 ? (category.percent / topPercent) * 100 : 0}
                    className="h-2"
                  />
                  <span className="w-9 shrink-0 text-right text-xs text-slate-400">
                    {category.percent}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}
