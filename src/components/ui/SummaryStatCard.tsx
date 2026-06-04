import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

export type SummaryStatCardProps = {
  /** When set, the whole card navigates on click */
  to?: string
  /** Dashboard row: icon left, label + value right */
  layout?: 'stacked' | 'inline'
  /** Inline layout: Lucide icon in colored tile */
  icon?: LucideIcon
  iconTileClassName?: string
  iconClassName?: string
  label: string
  value: string
  /** Shown inline after the value (e.g. rating star) */
  valueAdornment?: ReactNode
  /** Bottom-right text (growth %, reviews, etc.) */
  footer?: ReactNode
  /** Bottom-right icon (Lucide) */
  cornerIcon?: LucideIcon
  cornerIconClassName?: string
  /** Top-left image (e.g. stat card badge from design assets) */
  headerImage?: string
  headerImageAlt?: string
  headerImageClassName?: string
  /** Top-left icon or custom badge (replaces headerImage when set) */
  headerAdornment?: ReactNode
  /** Bottom-right image (e.g. revenue wallet graphic) */
  cornerImage?: string
  cornerImageAlt?: string
  cornerImageClassName?: string
  labelClassName?: string
  valueClassName?: string
  size?: 'default' | 'compact'
  className?: string
  footerClassName?: string
}

const labelStyles = 'text-[14px] font-medium text-nav'

const sizeStyles = {
  default: {
    card: 'min-h-[7.5rem] p-5',
    value: 'text-3xl font-bold leading-none tracking-tight text-ink-heading',
    valueGap: 'mt-3',
    footerPt: 'pt-4',
    cornerIcon: 'size-6',
    cornerImage: 'size-7',
    headerImage: 'size-10',
  },
  compact: {
    card: 'p-4',
    value: 'text-2xl font-bold leading-none tracking-tight text-ink-heading',
    valueGap: 'mt-1.5',
    footerPt: 'pt-2',
    cornerIcon: 'size-5',
    cornerImage: 'size-6',
    headerImage: 'size-10',
  },
} as const

const interactiveCardClass =
  'cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:ring-offset-2'

const inlineLabelClass =
  'text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]'
const inlineValueClass =
  'text-[1.75rem] font-bold leading-tight tracking-tight text-[#001a5e]'

export function SummaryStatCard({
  to,
  layout = 'stacked',
  icon: InlineIcon,
  iconTileClassName,
  iconClassName,
  label,
  value,
  valueAdornment,
  footer,
  cornerIcon: CornerIcon,
  cornerIconClassName,
  headerImage,
  headerImageAlt = '',
  headerImageClassName,
  headerAdornment,
  cornerImage,
  cornerImageAlt = '',
  cornerImageClassName,
  labelClassName,
  valueClassName,
  size = 'default',
  className,
  footerClassName,
}: SummaryStatCardProps) {
  const styles = sizeStyles[size]
  const footerIsOverlay = Boolean(footerClassName?.includes('absolute'))
  const hasFooter = Boolean(footer || cornerImage || CornerIcon)

  if (layout === 'inline') {
    const inlineCard = (
      <Card
        className={cn(
          'flex h-full items-center gap-4 rounded-[12px] border border-[#e2e8f0]/60 p-6 shadow-sm',
          to && interactiveCardClass,
          className,
        )}
      >
        {headerAdornment ??
          (InlineIcon ? (
            <div
              className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-lg',
                iconTileClassName,
              )}
              aria-hidden
            >
              <InlineIcon
                className={cn('size-6 stroke-[1.75]', iconClassName)}
                aria-hidden
              />
            </div>
          ) : null)}
        <div className="min-w-0 flex flex-col gap-1">
          <p className={cn(inlineLabelClass, labelClassName)}>{label}</p>
          <div className="flex items-center gap-1.5">
            <span className={cn(inlineValueClass, valueClassName)}>{value}</span>
            {valueAdornment}
          </div>
        </div>
        {footer ? (
          <div className={cn('ml-auto shrink-0', footerClassName)}>{footer}</div>
        ) : null}
      </Card>
    )

    if (!to) return inlineCard

    return (
      <Link to={to} className="block h-full no-underline text-inherit">
        {inlineCard}
      </Link>
    )
  }

  const card = (
    <Card
      className={cn(
        'flex h-full flex-col shadow-sm',
        styles.card,
        to && interactiveCardClass,
        className,
      )}
    >
      {headerAdornment}
      {!headerAdornment && headerImage && (
        <img
          src={headerImage}
          alt={headerImageAlt}
          className={cn(
            styles.headerImage,
            'mb-3 object-contain object-left',
            headerImageClassName,
          )}
        />
      )}

      <p className={cn(labelStyles, labelClassName)}>{label}</p>

      <div className={cn(styles.valueGap, 'flex items-center gap-1.5')}>
        <span className={cn(styles.value, valueClassName)}>{value}</span>
        {valueAdornment}
      </div>

      {footer && footerIsOverlay && (
        <div className={footerClassName}>{footer}</div>
      )}

      {hasFooter && !footerIsOverlay && (
        <div className={cn('mt-auto flex items-end justify-end', styles.footerPt, footerClassName)}>
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
      )}
    </Card>
  )

  if (!to) return card

  return (
    <Link to={to} className="block h-full no-underline text-inherit">
      {card}
    </Link>
  )
}
