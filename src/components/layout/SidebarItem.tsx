import { ChevronDown } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { NavItem } from '@/config/navigation'
import { cn } from '@/utils/cn'

type SidebarItemProps = {
  item: NavItem
}

export function SidebarItem({ item }: SidebarItemProps) {
  const Icon = item.icon

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
      <span className="flex-1 truncate">{item.label}</span>
      {item.showChevron && <ChevronDown className="h-3 w-3 shrink-0 opacity-70" />}
    </NavLink>
  )
}
