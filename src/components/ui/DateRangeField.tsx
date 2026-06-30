import { Calendar } from 'lucide-react'
import { cn } from '@/utils/cn'

export type DateRangeFieldProps = {
  from: string
  to: string
  onChange: (from: string, to: string) => void
  fromLabel?: string
  toLabel?: string
  className?: string
  /** Earliest selectable date (YYYY-MM-DD); dates before this are disabled. */
  min?: string
  /** Latest selectable date (YYYY-MM-DD); dates after this are disabled. */
  max?: string
}

const dateInputClass =
  'w-full rounded-card border-0 bg-surface-input py-2.5 pl-10 pr-4 text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-50'

export function DateRangeField({
  from,
  to,
  onChange,
  fromLabel = 'Start date',
  toLabel = 'End date',
  className,
  min,
  max,
}: DateRangeFieldProps) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2', className)}>
      <div className="relative">
        <Calendar
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-nav"
          aria-hidden
        />
        <input
          type="date"
          aria-label={fromLabel}
          value={from}
          min={min}
          max={max}
          onChange={(event) => onChange(event.target.value, to)}
          className={dateInputClass}
        />
      </div>
      <div className="relative">
        <Calendar
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-nav"
          aria-hidden
        />
        <input
          type="date"
          aria-label={toLabel}
          value={to}
          min={from || min}
          max={max}
          onChange={(event) => onChange(from, event.target.value)}
          className={dateInputClass}
        />
      </div>
    </div>
  )
}
