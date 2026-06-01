import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Calendar } from 'lucide-react'
import { cn } from '@/utils/cn'

type JoinedDateFilterProps = {
  from: string
  to: string
  onChange: (from: string, to: string) => void
  className?: string
  fieldClassName?: string
}

function shortDateLabel(iso: string): string {
  const date = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function JoinedDateFilter({
  from,
  to,
  onChange,
  className,
  fieldClassName,
}: JoinedDateFilterProps) {
  const [open, setOpen] = useState(false)
  const [draftFrom, setDraftFrom] = useState(from)
  const [draftTo, setDraftTo] = useState(to)
  const [panelStyle, setPanelStyle] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const isActive = Boolean(from || to)

  const buttonLabel = (() => {
    if (!isActive) return 'Joined Date'
    if (from && to) return `${shortDateLabel(from)} – ${shortDateLabel(to)}`
    if (from) return `From ${shortDateLabel(from)}`
    return `To ${shortDateLabel(to)}`
  })()

  const updatePanelPosition = () => {
    const button = buttonRef.current
    if (!button) return
    const rect = button.getBoundingClientRect()
    const panelWidth = 208
    const left = Math.min(
      Math.max(8, rect.right - panelWidth),
      window.innerWidth - panelWidth - 8,
    )
    setPanelStyle({ top: rect.bottom + 6, left })
  }

  useLayoutEffect(() => {
    if (!open) return
    updatePanelPosition()
    window.addEventListener('resize', updatePanelPosition)
    window.addEventListener('scroll', updatePanelPosition, true)
    return () => {
      window.removeEventListener('resize', updatePanelPosition)
      window.removeEventListener('scroll', updatePanelPosition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    setDraftFrom(from)
    setDraftTo(to)
  }, [open, from, to])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
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

  const apply = () => {
    let nextFrom = draftFrom
    let nextTo = draftTo
    if (nextFrom && nextTo && nextFrom > nextTo) {
      ;[nextFrom, nextTo] = [nextTo, nextFrom]
    }
    onChange(nextFrom, nextTo)
    setOpen(false)
  }

  const clear = () => {
    setDraftFrom('')
    setDraftTo('')
    onChange('', '')
    setOpen(false)
  }

  const dateInputClass =
    'w-full rounded-nav border border-[#e2e8f0]/80 bg-white px-2 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary-50'

  return (
    <div className={cn('shrink-0', className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Filter by joined date"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-card',
          'transition-colors',
          fieldClassName,
        )}
      >
        <Calendar className="size-4 shrink-0 text-nav" aria-hidden />
        <span className={cn('truncate', isActive && 'max-w-[9rem]')}>{buttonLabel}</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Joined date range"
            style={{ position: 'fixed', top: panelStyle.top, left: panelStyle.left, zIndex: 50 }}
            className="w-52 rounded-nav border border-[#e2e8f0]/60 bg-white p-2.5 shadow-lg"
          >
            <p className="mb-2 text-[11px] font-medium text-ink-heading">Joined date</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="block min-w-0">
                <span className="mb-0.5 block text-[10px] text-nav">From</span>
                <input
                  type="date"
                  value={draftFrom}
                  onChange={(e) => setDraftFrom(e.target.value)}
                  className={dateInputClass}
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-0.5 block text-[10px] text-nav">To</span>
                <input
                  type="date"
                  value={draftTo}
                  onChange={(e) => setDraftTo(e.target.value)}
                  className={dateInputClass}
                />
              </label>
            </div>
            <div className="mt-2 flex gap-1.5">
              <button
                type="button"
                onClick={apply}
                className="flex-1 rounded-nav bg-primary-gradient px-2 py-1.5 text-[11px] font-medium text-white"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={clear}
                disabled={!isActive && !draftFrom && !draftTo}
                className="rounded-nav px-2 py-1.5 text-[11px] font-medium text-nav hover:bg-surface-input disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
