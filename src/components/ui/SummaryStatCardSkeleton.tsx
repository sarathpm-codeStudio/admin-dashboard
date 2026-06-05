import type { SummaryStatCardProps } from '@/components/ui/SummaryStatCard'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'

type SummaryStatCardSkeletonProps = Pick<
  SummaryStatCardProps,
  'layout' | 'size' | 'className' | 'footerClassName'
>

const sizeStyles = {
  default: {
    card: 'min-h-[7.5rem] p-5',
    value: 'h-9 w-28',
    label: 'h-4 w-24',
    footer: 'h-3.5 w-36',
    footerPt: 'pt-4',
  },
  compact: {
    card: 'p-4',
    value: 'h-8 w-24',
    label: 'h-3.5 w-20',
    footer: 'h-3 w-32',
    footerPt: 'pt-2',
  },
} as const

export function SummaryStatCardSkeleton({
  layout = 'stacked',
  size = 'default',
  className,
  footerClassName,
}: SummaryStatCardSkeletonProps) {
  const styles = sizeStyles[size]
  const footerIsOverlay = Boolean(footerClassName?.includes('absolute'))

  if (layout === 'inline') {
    return (
      <Card
        className={cn(
          'flex h-full items-center gap-4 rounded-[12px] border border-[#e2e8f0]/60 p-6 shadow-sm',
          className,
        )}
        aria-busy
        aria-label="Loading statistic"
      >
        <Skeleton className="size-12 shrink-0 rounded-lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="ml-auto h-3.5 w-28 shrink-0" />
      </Card>
    )
  }

  return (
    <Card
      className={cn('flex h-full flex-col shadow-sm', styles.card, className)}
      aria-busy
      aria-label="Loading statistic"
    >
      <Skeleton className={styles.label} />
      <Skeleton className={cn(styles.value, 'mt-3')} />
      {footerIsOverlay ? (
        <div className={footerClassName}>
          <Skeleton className={styles.footer} />
        </div>
      ) : (
        <div
          className={cn(
            'mt-auto flex items-end justify-end',
            styles.footerPt,
            footerClassName,
          )}
        >
          <Skeleton className={styles.footer} />
        </div>
      )}
    </Card>
  )
}
