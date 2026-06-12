import { Card, cardPaddingClass } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'

/** Card-shaped placeholder used across detail views while data loads */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn(cardPaddingClass, className)}>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </Card>
  )
}

/** Breadcrumb + profile header + summary stats placeholder shared by detail pages */
export function DetailHeaderSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-40" />

      <Card className={cardPaddingClass}>
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-28 rounded-nav" />
        </div>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-card" />
        ))}
      </div>
    </>
  )
}
