import { Card, cardPaddingClass } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'

/** Course-card-shaped placeholder shown while faculty courses load */
export function FacultyCourseCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn(cardPaddingClass, 'flex h-full flex-col', className)}>
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-16 rounded-nav" />
        <Skeleton className="size-8 rounded-nav" />
      </div>

      <Skeleton className="mt-4 h-5 w-4/5" />
      <Skeleton className="mt-2 h-5 w-3/5" />

      <div className="mb-5 mt-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>

      <Skeleton className="mt-auto h-10 w-full rounded-nav" />
    </Card>
  )
}
