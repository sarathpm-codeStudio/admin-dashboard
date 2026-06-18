import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import type { NavItem } from '@/config/navigation'
import { cn } from '@/utils/cn'

type SidebarItemProps = {
  item: NavItem
}

export function SidebarItem({ item }: SidebarItemProps) {
  const Icon = item.icon
  const location = useLocation()
  const hasChildren = !!item.children?.length

  const isChildActive = hasChildren
    ? item.children!.some((child) => location.pathname.startsWith(child.path))
    : false

  const [isOpen, setIsOpen] = useState(isChildActive)

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className={cn(
            'flex w-full items-center gap-3 px-4 py-3 text-base tracking-tight transition-colors',
            isChildActive
              ? 'rounded-nav font-medium text-ink'
              : 'rounded font-light text-nav hover:text-ink',
          )}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span className="flex-1 truncate text-left font-bold">{item.label}</span>
          <ChevronDown
            className={cn(
              'h-3 w-3 shrink-0 opacity-70 transition-transform',
              isOpen && 'rotate-180',
            )}
          />
        </button>

        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-300 ease-in-out',
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">
            <div className="mt-1 flex flex-col gap-1 pl-6">
              {item.children!.map((child) => (
                <SidebarItem key={child.path} item={child} />
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
      end={item.path === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-3 text-base tracking-tight transition-colors',
          isActive
            ? 'rounded-nav bg-primary-gradient-r font-medium text-nav-active'
            : 'rounded font-light text-nav hover:text-ink',
        )
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="flex-1 truncate font-bold">{item.label}</span>
      {item.showChevron && <ChevronDown className="h-3 w-3 shrink-0 opacity-70" />}
    </NavLink>
  )
}
