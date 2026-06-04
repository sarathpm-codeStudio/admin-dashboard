import { cn } from '@/utils/cn'

type AlertVariant = 'warning' | 'danger' | 'info'

export type AlertBoxProps = {
  title: string
  detail: string
  variant: AlertVariant
  className?: string
}

const variantStyles: Record<
  AlertVariant,
  { container: string; accent: string; title: string; detail: string }
> = {
  warning: {
    container: 'bg-[#FFFBEB]',
    accent: 'bg-[#F59E0B]',
    title: 'text-[#78350F]',
    detail: 'text-[#A16207]',
  },
  danger: {
    container: 'bg-[#FEF2F2]',
    accent: 'bg-[#DC2626]',
    title: 'text-[#991B1B]',
    detail: 'text-[#B91C1C]',
  },
  info: {
    container: 'bg-[#F1F5F9]',
    accent: 'bg-[#64748B]',
    title: 'text-[#0F172A]',
    detail: 'text-[#64748B]',
  },
}

export function AlertBox({ title, detail, variant, className }: AlertBoxProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-3.5 py-3',
        styles.container,
        className,
      )}
    >
      <span
        className={cn('h-10 w-1 shrink-0 rounded-full', styles.accent)}
        aria-hidden
      />
      <div className="min-w-0 flex flex-col gap-0.5">
        <p className={cn('text-sm font-bold leading-snug', styles.title)}>{title}</p>
        <p className={cn('text-xs font-normal leading-snug', styles.detail)}>{detail}</p>
      </div>
    </div>
  )
}
