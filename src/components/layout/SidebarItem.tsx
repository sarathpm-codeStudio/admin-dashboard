import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import type { NavItem } from '@/config/navigation'
import { cn } from '@/utils/cn'

type SidebarItemProps = {
  item: NavItem
  /** Rail mode: icon only, labels and submenus hidden. */
  collapsed?: boolean
  /** Pin the rail open. Tapping a submenu parent while railed calls this, so the
   *  submenu has somewhere to appear without depending on a hover we may not get
   *  on touch. */
  onExpand?: () => void
  /** Navigating away un-pins the rail so it collapses behind you. */
  onNavigate?: () => void
}

const LABEL_TRANSITION =
  'opacity 0.35s cubic-bezier(0.33, 1, 0.68, 1), max-width 0.4s cubic-bezier(0.33, 1, 0.68, 1)'

// Labels collapse to zero width rather than unmounting, so the text slides away
// with the rail instead of popping out of existence.
const labelClass = (collapsed: boolean, extra = '') =>
  cn(
    'shrink-0 overflow-hidden whitespace-nowrap',
    collapsed ? 'pointer-events-none max-w-0 opacity-0' : 'max-w-[200px] opacity-100',
    extra,
  )

const rowClass = (collapsed: boolean, extra = '') =>
  cn(
    'flex items-center text-base tracking-tight transition-[padding,gap,background-color,color] duration-300 ease-out',
    collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3',
    extra,
  )

export function SidebarItem({
  item,
  collapsed = false,
  onExpand,
  onNavigate,
}: SidebarItemProps) {
  const Icon = item.icon
  const location = useLocation()
  const hasChildren = !!item.children?.length

  const isChildActive = hasChildren
    ? item.children!.some((child) => location.pathname.startsWith(child.path))
    : false

  const [isOpen, setIsOpen] = useState(isChildActive)

  if (hasChildren) {
    // A submenu can never be open while railed — there's no room for the labels.
    const open = isOpen && !collapsed

    return (
      <div>
        <button
          type="button"
          onClick={() => {
            // Railed: there's nowhere for the submenu to show, so open the rail
            // first and force the submenu open rather than toggling it shut.
            if (collapsed) {
              onExpand?.()
              setIsOpen(true)
              return
            }
            setIsOpen((prev) => !prev)
          }}
          title={collapsed ? item.label : undefined}
          className={rowClass(
            collapsed,
            cn(
              'w-full',
              isChildActive
                ? 'rounded-nav font-medium text-ink'
                : 'rounded font-light text-nav hover:text-ink',
            ),
          )}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span
            className={labelClass(collapsed, 'flex-1 text-left font-bold')}
            style={{ transition: LABEL_TRANSITION }}
          >
            {item.label}
          </span>
          <ChevronDown
            className={cn(
              'h-3 w-3 shrink-0 opacity-70 transition-all duration-300 ease-out',
              collapsed ? 'max-w-0 opacity-0' : 'max-w-3',
              open && 'rotate-180',
            )}
          />
        </button>

        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-300 ease-in-out',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">
            <div className="mt-1 flex flex-col gap-1 pl-6">
              {item.children!.map((child) => (
                <SidebarItem
                  key={child.path}
                  item={child}
                  collapsed={collapsed}
                  onExpand={onExpand}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <NavLink
      to={item.path}
      end={item.end ?? item.path === '/'}
      onClick={() => onNavigate?.()}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        rowClass(
          collapsed,
          isActive
            ? 'rounded-nav bg-primary-gradient-r font-medium text-nav-active'
            : 'rounded font-light text-nav hover:text-ink',
        )
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span
        className={labelClass(collapsed, 'flex-1 font-bold')}
        style={{ transition: LABEL_TRANSITION }}
      >
        {item.label}
      </span>
      {item.showChevron && !collapsed && (
        <ChevronDown className="h-3 w-3 shrink-0 opacity-70" />
      )}
    </NavLink>
  )
}
