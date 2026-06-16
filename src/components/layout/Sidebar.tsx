import { bottomNavItems, brand, mainNavItems } from '@/config/navigation'
import { SidebarItem } from '@/components/layout/SidebarItem'

export function Sidebar() {
  return (
    <aside className="scrollbar-none fixed inset-y-0 left-0 z-30 flex h-screen w-64 flex-col overflow-y-auto bg-surface-sidebar px-6 py-6">
      <div className="mb-1 flex items-center gap-2 px-0">
        {/* <img src={brand.brandIcon} alt="" className="size-10 shrink-0" /> */}
        <img src={brand.titleLogo} alt={brand.name} className="h-[100px] w-auto ml-[-15px] mt-[-15px]" />
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
