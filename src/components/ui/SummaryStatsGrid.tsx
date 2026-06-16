import type { SummaryStatCardProps } from '@/components/ui/SummaryStatCard'
import { SummaryStatCard } from '@/components/ui/SummaryStatCard'
import { SummaryStatCardSkeleton } from '@/components/ui/SummaryStatCardSkeleton'
import { cn } from '@/utils/cn'

export type SummaryStatItem = SummaryStatCardProps & {
  id?: string
}

type SummaryStatsGridColumns = 2 | 3 | 4

const columnGridClass: Record<SummaryStatsGridColumns, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

type SummaryStatCardSkeletonProps = Pick<
  SummaryStatCardProps,
  'layout' | 'size' | 'className' | 'footerClassName'
>

type SummaryStatsGridProps = {
  items: SummaryStatItem[]
  columns?: SummaryStatsGridColumns
  size?: 'default' | 'compact'
  className?: string
  /** When true, renders skeleton cards instead of items (reusable across features) */
  isLoading?: boolean
  /** Number of skeleton placeholders; defaults to items.length or columns */
  skeletonCount?: number
  /** Shared skeleton styling (e.g. feature-specific card border/padding) */
  skeletonProps?: SummaryStatCardSkeletonProps
}

export function SummaryStatsGrid({
  items,
  columns = 4,
  size = 'default',
  className,
  isLoading = false,
  skeletonCount,
  skeletonProps,
}: SummaryStatsGridProps) {
  const placeholderCount =
    skeletonCount ?? (items.length > 0 ? items.length : columns)

  // query


  return (
    <div className={cn('grid gap-4', columnGridClass[columns], className)}>
      {isLoading
        ? Array.from({ length: placeholderCount }, (_, index) => (
          <SummaryStatCardSkeleton
            key={`skeleton-${index}`}
            layout={skeletonProps?.layout ?? items[0]?.layout ?? 'stacked'}
            size={skeletonProps?.size ?? items[0]?.size ?? size}
            className={skeletonProps?.className ?? items[0]?.className}
            footerClassName={
              skeletonProps?.footerClassName ?? items[0]?.footerClassName
            }
          />
        ))
        : items.map((item, index) => {
          const { id, size: itemSize, ...cardProps } = item
          return (
            <SummaryStatCard
              key={id ?? item.label ?? index}
              size={itemSize ?? size}
              {...cardProps}
            />
          )
        })}
    </div>
  )
}
