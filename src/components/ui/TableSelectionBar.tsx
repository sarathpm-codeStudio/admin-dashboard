import type { LucideIcon } from 'lucide-react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export type TableSelectionAction = {
  id: string
  label: string
  icon?: LucideIcon
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}

type TableSelectionBarProps = {
  selectedCount: number
  itemLabel?: string
  actions: TableSelectionAction[]
  onClear: () => void
  className?: string
  children?: ReactNode
}

export function TableSelectionBar({
  selectedCount,
  itemLabel = 'Course',
  actions,
  onClear,
  className,
  children,
}: TableSelectionBarProps) {
  if (selectedCount <= 0) return null

  const plural = selectedCount === 1 ? itemLabel : `${itemLabel}s`

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 rounded-lg bg-primary-gradient-r px-5 py-3 text-white shadow-md',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-semibold">
        {String(selectedCount).padStart(2, '0')} {plural} Selected
      </p>

      <div className="flex flex-wrap items-center gap-10">
        {children}
        {actions.map(({ id, label, icon: Icon, onClick, variant = 'default', disabled }) => (
          <Button
            key={id}
            type="button"
            variant="ghost"
            disabled={disabled}
            onClick={onClick}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-nav px-3 py-1.5 text-sm font-medium text-white hover:bg-white/15',
              variant === 'danger' && 'text-red-200 hover:bg-red-500/20 hover:text-red-100',
            )}
          >
            {Icon ? <Icon className="size-4" aria-hidden /> : null}
            {label}
          </Button>
        ))}
      </div>

      <button
        type="button"
        onClick={onClear}
        className="inline-flex size-8 items-center justify-center rounded-nav text-white/80 transition-colors hover:bg-white/15 hover:text-white"
        aria-label="Clear selection"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
