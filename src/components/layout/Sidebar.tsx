import { bottomNavItems, brand, mainNavItems } from '@/config/navigation'
import { SidebarItem } from '@/components/layout/SidebarItem'

export function Sidebar() {
  const BrandIcon = brand.icon

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex h-screen w-64 flex-col overflow-y-auto bg-surface-sidebar px-6 py-6">
      <div className="mb-8 flex items-center gap-3 px-0">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-gradient">
          <BrandIcon className="h-[18px] w-[22px] text-white" strokeWidth={2.25} />
        </div>
        <span className="font-brand text-xl font-bold tracking-tight text-brand">{brand.name}</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {mainNavItems.map((item) => (
          <SidebarItem key={item.path} item={item} />
        ))}
      </nav>

      <nav className="mt-auto border-t border-[rgba(198,197,212,0.1)] pt-6">
        {bottomNavItems.map((item) => (
          <SidebarItem key={item.path} item={item} />
        ))}
      </nav>
    </aside>
  )
}
