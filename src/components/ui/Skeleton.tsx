import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export type SkeletonProps = HTMLAttributes<HTMLDivElement>

/** Generic pulse placeholder for text, tiles, and card regions */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200/80', className)}
      aria-hidden
      {...props}
    />
  )
}
