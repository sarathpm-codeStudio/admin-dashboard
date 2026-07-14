import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bottomNavItems, brand, mainNavItems } from '@/config/navigation'
import { SidebarItem } from '@/components/layout/SidebarItem'

const COLLAPSED_WIDTH = 88
const EXPANDED_WIDTH = 280
const WIDTH_TRANSITION = 'width 0.4s cubic-bezier(0.33, 1, 0.68, 1)'
const LABEL_TRANSITION =
  'opacity 0.35s cubic-bezier(0.33, 1, 0.68, 1), max-width 0.4s cubic-bezier(0.33, 1, 0.68, 1)'

/**
 * Icon rail that expands to a full sidebar on hover, matching the faculty
 * dashboard. It's an overlay (fixed), so expanding never reflows the page —
 * the spacer div below always reserves exactly the collapsed width.
 */
export function Sidebar() {
  const [isHovered, setIsHovered] = useState(false)
  // Tapping a submenu parent pins the rail open. Hover is unreliable on touch,
  // so without this the submenu would have nowhere to appear.
  const [pinned, setPinned] = useState(false)
  const asideRef = useRef<HTMLElement>(null)
  const navigate = useNavigate()

  const expanded = isHovered || pinned
  const collapsed = !expanded

  const close = () => {
    setIsHovered(false)
    setPinned(false)
  }

  // Clicking anywhere outside the rail collapses it again.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (asideRef.current && !asideRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // Collapse the expanded sidebar on scroll — TABLET ONLY. Touch browsers keep
  // firing a synthetic hover after a tap, which would otherwise leave the rail
  // stuck open. On laptop (lg+) hover alone drives it, so scrolling does nothing.
  useEffect(() => {
    const collapse = () => {
      if (!window.matchMedia('(max-width: 1023px)').matches) return
      close()
    }
    window.addEventListener('scroll', collapse, true)
    window.addEventListener('wheel', collapse, { passive: true })
    return () => {
      window.removeEventListener('scroll', collapse, true)
      window.removeEventListener('wheel', collapse)
    }
  }, [])

  return (
    <div className="h-screen shrink-0" style={{ width: COLLAPSED_WIDTH }}>
      <aside
        ref={asideRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
          transition: WIDTH_TRANSITION,
        }}
        className={`scrollbar-none fixed inset-y-0 left-0 z-50 flex h-screen flex-col overflow-y-auto overflow-x-hidden bg-surface-sidebar py-6 ${
          expanded ? 'shadow-[4px_0_24px_rgba(0,11,96,0.1)]' : ''
        }`}
      >
        {/* Brand: icon only when collapsed, full wordmark when expanded. */}
        <div
          onClick={() => navigate('/')}
          role="button"
          title="Go to Dashboard"
          className={`flex cursor-pointer items-center transition-[padding] duration-300 ease-out ${
            collapsed ? 'justify-center px-1' : 'px-6'
          }`}
        >
          <img
            src={brand.brandIcon}
            alt={brand.name}
            className={`shrink-0 object-contain ${
              collapsed ? 'h-auto w-20 opacity-100' : 'h-0 w-0 max-w-0 opacity-0'
            }`}
            style={{ transition: LABEL_TRANSITION }}
          />
          <img
            src={brand.titleLogo}
            alt={brand.name}
            className={`ml-[-15px] mt-[-15px] h-[100px] w-auto shrink-0 object-contain object-left ${
              collapsed ? 'max-w-0 opacity-0' : 'opacity-100'
            }`}
            style={{ transition: LABEL_TRANSITION }}
          />
        </div>

        <nav
          className={`flex flex-1 flex-col gap-1 transition-[padding] duration-300 ease-out ${
            collapsed ? 'px-3' : 'px-6'
          }`}
        >
          {mainNavItems.map((item) => (
            <SidebarItem
              key={item.path}
              item={item}
              collapsed={collapsed}
              onExpand={() => setPinned(true)}
              onNavigate={close}
            />
          ))}
        </nav>

        <nav
          className={`mt-auto border-t border-[rgba(198,197,212,0.1)] pt-6 transition-[padding] duration-300 ease-out ${
            collapsed ? 'px-3' : 'px-6'
          }`}
        >
          {bottomNavItems.map((item) => (
            <SidebarItem
              key={item.path}
              item={item}
              collapsed={collapsed}
              onExpand={() => setPinned(true)}
              onNavigate={close}
            />
          ))}
        </nav>
      </aside>
    </div>
  )
}
