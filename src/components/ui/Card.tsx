import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export type CardProps = HTMLAttributes<HTMLDivElement>

/** Equal top/bottom padding for dashboard and feature cards */
export const cardPaddingClass = 'p-5'

export type CardBodyProps = HTMLAttributes<HTMLDivElement>

/** Stacks card sections with consistent vertical rhythm (no extra header margins) */
export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)} {...props}>
      {children}
    </div>
  )
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-[#e2e8f0]/60 bg-surface-card shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
