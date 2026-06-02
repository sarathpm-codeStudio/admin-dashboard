import { cn } from '@/utils/cn'

type ProgressBarProps = {
  value: number
  className?: string
  trackClassName?: string
  fillClassName?: string
}

export function ProgressBar({
  value,
  className,
  trackClassName,
  fillClassName = 'bg-primary-gradient-r',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-input', trackClassName, className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-[width]', fillClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
