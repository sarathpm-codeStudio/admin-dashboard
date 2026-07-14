import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'

/** Course-card-shaped placeholder shown while faculty courses load */
export function FacultyCourseCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('flex h-full flex-col overflow-hidden p-0', className)}>
      <Skeleton className="aspect-[16/9] w-full rounded-none" />

      <div className="flex flex-1 flex-col p-4">
        <Skeleton className="h-4 w-12 rounded-md" />
        <Skeleton className="mt-3 h-5 w-4/5" />

        <div className="mt-3 flex items-center gap-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
        </div>

        <div className="mt-auto pt-5">
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
    </Card>
  )
}
