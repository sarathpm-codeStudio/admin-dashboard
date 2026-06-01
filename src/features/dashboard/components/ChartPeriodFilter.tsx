import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { TrendPeriod } from '@/features/dashboard/data/chartTrends'

const PERIODS: { value: TrendPeriod; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

type ChartPeriodFilterProps = {
  value: TrendPeriod
  onChange: (period: TrendPeriod) => void
  className?: string
}

export function ChartPeriodFilter({ value, onChange, className }: ChartPeriodFilterProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const selectedLabel = PERIODS.find((p) => p.value === value)?.label ?? 'Month'

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative shrink-0', className)}>
      <button
        type="button"
        aria-label="Chart time period"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex items-center gap-2 rounded-nav border border-[#e2e8f0]/60 bg-white',
          'py-2 pl-3 pr-2 text-sm font-medium text-ink-heading outline-none',
          'transition-colors hover:border-[#e2e8f0]',
        )}
      >
        {selectedLabel}
        <ChevronDown
          className={cn('size-4 text-nav transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Chart time period"
          className="absolute right-0 z-20 mt-1 min-w-full overflow-hidden rounded-nav border border-[#e2e8f0]/60 bg-white py-1 shadow-md"
        >
          {PERIODS.map(({ value: periodValue, label }) => (
            <li key={periodValue} role="option" aria-selected={value === periodValue}>
              <button
                type="button"
                onClick={() => {
                  onChange(periodValue)
                  setOpen(false)
                }}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm font-medium outline-none transition-colors',
                  value === periodValue
                    ? 'bg-surface-input text-primary'
                    : 'text-ink-heading hover:bg-surface-page',
                )}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
