import type { SummaryStatCardProps } from '@/components/ui/SummaryStatCard'
import { SummaryStatCard } from '@/components/ui/SummaryStatCard'
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

type SummaryStatsGridProps = {
  items: SummaryStatItem[]
  columns?: SummaryStatsGridColumns
  size?: 'default' | 'compact'
  className?: string
}

export function SummaryStatsGrid({
  items,
  columns = 4,
  size = 'default',
  className,
}: SummaryStatsGridProps) {
  return (
    <div className={cn('grid gap-4', columnGridClass[columns], className)}>
      {items.map((item, index) => {
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
