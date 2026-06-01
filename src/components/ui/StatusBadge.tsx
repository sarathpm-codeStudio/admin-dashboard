import { cn } from '@/utils/cn'

export type StatusBadgeVariant = 'active' | 'pending' | 'suspended' | 'info'

const variantStyles: Record<StatusBadgeVariant, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  suspended: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
}

type StatusBadgeProps = {
  label: string
  variant?: StatusBadgeVariant
  className?: string
}

export function StatusBadge({ label, variant = 'active', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {label}
    </span>
  )
}
