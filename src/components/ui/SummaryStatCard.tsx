import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

export type SummaryStatCardProps = {
  label: string
  value: string
  /** Shown inline after the value (e.g. rating star) */
  valueAdornment?: ReactNode
  /** Bottom-right text (growth %, reviews, etc.) */
  footer?: ReactNode
  /** Bottom-right icon (Lucide) */
  cornerIcon?: LucideIcon
  cornerIconClassName?: string
  /** Bottom-right image (e.g. revenue wallet graphic) */
  cornerImage?: string
  cornerImageAlt?: string
  cornerImageClassName?: string
  labelClassName?: string
  valueClassName?: string
  size?: 'default' | 'compact'
  className?: string
}

const labelStyles = 'text-[11px] font-medium uppercase tracking-wide text-slate-400'

const sizeStyles = {
  default: {
    card: 'min-h-[7.5rem] p-5',
    value: 'text-3xl font-bold leading-none tracking-tight text-ink-heading',
    valueGap: 'mt-3',
    footerPt: 'pt-4',
    cornerIcon: 'size-6',
    cornerImage: 'size-7',
  },
  compact: {
    card: 'p-4',
    value: 'text-2xl font-bold leading-none tracking-tight text-ink-heading',
    valueGap: 'mt-1.5',
    footerPt: 'pt-2',
    cornerIcon: 'size-5',
    cornerImage: 'size-6',
  },
} as const

export function SummaryStatCard({
  label,
  value,
  valueAdornment,
  footer,
  cornerIcon: CornerIcon,
  cornerIconClassName,
  cornerImage,
  cornerImageAlt = '',
  cornerImageClassName,
  labelClassName,
  valueClassName,
  size = 'default',
  className,
}: SummaryStatCardProps) {
  const styles = sizeStyles[size]

  return (
    <Card className={cn('flex flex-col shadow-sm', styles.card, className)}>
      <p className={cn(labelStyles, labelClassName)}>{label}</p>

      <div className={cn(styles.valueGap, 'flex items-center gap-1.5')}>
        <span className={cn(styles.value, valueClassName)}>{value}</span>
        {valueAdornment}
      </div>

      <div className={cn('mt-auto flex items-end justify-end', styles.footerPt)}>
        {footer}
        {!footer && cornerImage && (
          <img
            src={cornerImage}
            alt={cornerImageAlt}
            className={cn(styles.cornerImage, 'object-contain', cornerImageClassName)}
          />
        )}
        {!footer && !cornerImage && CornerIcon && (
          <CornerIcon
            className={cn(
              styles.cornerIcon,
              'stroke-[1.5] text-slate-400',
              cornerIconClassName,
            )}
            aria-hidden
          />
        )}
      </div>
    </Card>
  )
}
