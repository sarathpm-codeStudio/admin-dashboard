import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type PageWithFixedTableScrollProps = {
  /** Header, stats, filters — fixed; does not scroll */
  fixed: ReactNode
  /** Table area — fills remaining height and scrolls */
  table: ReactNode
  className?: string
}

export function PageWithFixedTableScroll({ fixed, table, className }: PageWithFixedTableScrollProps) {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col gap-4', className)}>
      <div className="shrink-0 space-y-6">{fixed}</div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{table}</div>
    </div>
  )
}
