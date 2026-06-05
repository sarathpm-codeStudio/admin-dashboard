import { cn } from '@/utils/cn'

export type StatusBadgeVariant =
  | 'active'
  | 'pending'
  | 'rejected'
  | 'suspended'
  | 'info'
  | 'courseActive'
  | 'draft'
  | 'bundle'
  | 'individual'

const variantFilledStyles: Record<StatusBadgeVariant, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  rejected: 'bg-red-50 text-red-700',
  suspended: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  courseActive: 'bg-[#001E251A] text-[#00A6BF]',
  draft: 'bg-[#E4E2E1] text-[#656464]',
  bundle: 'rounded-md bg-[#EEF2FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#4338CA]',
  individual:
    'rounded-md bg-[#F1F5F9] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#475569]',
}

const variantTextStyles: Record<StatusBadgeVariant, string> = {
  active: 'text-emerald-700',
  pending: 'text-amber-700',
  rejected: 'text-red-700',
  suspended: 'text-red-700',
  info: 'text-blue-700',
  courseActive: 'text-[#00A6BF]',
  draft: 'text-[#656464]',
  bundle: 'text-[#4338CA]',
  individual: 'text-[#475569]',
}

type StatusBadgeProps = {
  label: string
  variant?: StatusBadgeVariant
  /** `filled` = pill with background; `text` = colored label only */
  appearance?: 'filled' | 'text'
  className?: string
}

export function StatusBadge({
  label,
  variant = 'active',
  appearance = 'filled',
  className,
}: StatusBadgeProps) {
  const isText = appearance === 'text'

  return (
    <span
      className={cn(
        'inline-flex text-xs font-medium',
        isText ? variantTextStyles[variant] : 'rounded-full px-2.5 py-0.5',
        !isText && variantFilledStyles[variant],
        className,
      )}
    >
      {label}
    </span>
  )
}
