import { cn } from '@/utils/cn'

type AlertVariant = 'warning' | 'danger' | 'info'

export type AlertBoxProps = {
  title: string
  detail: string
  variant: AlertVariant
  className?: string
}

const variantStyles: Record<AlertVariant, string> = {
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
}

export function AlertBox({ title, detail, variant, className }: AlertBoxProps) {
  return (
    <div
      className={cn(
        'rounded-nav border px-3 py-2.5',
        variantStyles[variant],
        className,
      )}
    >
      <p className="text-xs font-semibold leading-snug">{title}</p>
      <p className="mt-0.5 text-[10px] leading-snug opacity-80">{detail}</p>
    </div>
  )
}
