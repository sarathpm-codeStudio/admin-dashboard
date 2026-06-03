import { cn } from '@/utils/cn'

export type StatusDotBadgeVariant = 'active' | 'completed' | 'pending'

const variantStyles: Record<
  StatusDotBadgeVariant,
  { showDot: boolean; dot: string; pill: string }
> = {
  active: {
    showDot: true,
    dot: 'bg-emerald-500',
    pill: 'bg-[#F0FDF4] text-emerald-600',
  },
  completed: {
    showDot: false,
    dot: '',
    pill: 'bg-[#49D7F44D] text-[#004E5B]',
  },
  pending: {
    showDot: false,
    dot: '',
    pill: 'bg-[#E4E2E1] text-[#656464]',
  },
}

type StatusDotBadgeProps = {
  label: string
  variant: StatusDotBadgeVariant
  className?: string
}

export function StatusDotBadge({ label, variant, className }: StatusDotBadgeProps) {
  const styles = variantStyles[variant]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium normal-case',
        styles.pill,
        className,
      )}
    >
      {styles.showDot ? (
        <span className={cn('size-1.5 shrink-0 rounded-full', styles.dot)} aria-hidden />
      ) : null}
      {label}
    </span>
  )
}
