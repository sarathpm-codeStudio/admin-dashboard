import { cn } from '@/utils/cn'

export type StatusBadgeVariant =
  | 'active'
  | 'pending'
  | 'suspended'
  | 'info'
  | 'courseActive'
  | 'draft'
  | 'bundle'
  | 'individual'

const variantStyles: Record<StatusBadgeVariant, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  suspended: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  courseActive: 'bg-[#001E251A] text-[#00A6BF]',
  draft: 'bg-[#E4E2E1] text-[#656464]',
  bundle: 'rounded-md bg-[#EEF2FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#4338CA]',
  individual:
    'rounded-md bg-[#F1F5F9] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#475569]',
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
