import type { LucideIcon } from 'lucide-react'
import { MoreVertical } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils/cn'

export type TableRowAction = {
  id: string
  label: string
  icon?: LucideIcon
  onClick: () => void
  variant?: 'default' | 'danger'
}

type TableRowActionsMenuProps = {
  actions: TableRowAction[]
  ariaLabel?: string
  align?: 'left' | 'right'
}

const MENU_WIDTH = 132

export function TableRowActionsMenu({
  actions,
  ariaLabel = 'Row actions',
  align = 'right',
}: TableRowActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const updateMenuPosition = () => {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const left =
      align === 'right'
        ? Math.min(Math.max(8, rect.right - MENU_WIDTH), window.innerWidth - MENU_WIDTH - 8)
        : Math.min(Math.max(8, rect.left), window.innerWidth - MENU_WIDTH - 8)

    setMenuStyle({ top: rect.bottom + 6, left })
  }

  useLayoutEffect(() => {
    if (!open) return

    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)

    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [open, align])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return
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

  const handleAction = (action: TableRowAction) => {
    setOpen(false)
    action.onClick()
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex size-8 items-center justify-center rounded-nav text-[#44474E] transition-colors hover:bg-surface-input hover:text-ink-heading"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
      >
        <MoreVertical className="size-4" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: 'fixed', top: menuStyle.top, left: menuStyle.left, zIndex: 100 }}
            className="min-w-[8.25rem] overflow-hidden rounded-lg border border-[#e2e8f0]/80 bg-white py-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
          >
            {actions.map((action) => {
              const Icon = action.icon
              const isDanger = action.variant === 'danger'

              return (
                <button
                  key={action.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleAction(action)}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium transition-colors',
                    isDanger
                      ? 'text-[#ba1a1a] hover:bg-red-50'
                      : 'text-[#44474E] hover:bg-[#F8FAFC]',
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn('size-4 shrink-0', isDanger ? 'text-[#ba1a1a]' : 'text-[#44474E]')}
                      aria-hidden
                    />
                  )}
                  {action.label}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </>
  )
}
