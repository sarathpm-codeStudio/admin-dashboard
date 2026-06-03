import { Bell, LogOut } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import userAvatar from '@/asset/image/user1.png'
import { SearchInput } from '@/components/ui/SearchInput'
import { useSignOut } from '@/features/auth/hooks/useSignOut'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

export function TopBar() {
  const user = useAuthStore((state) => state.user)
  const signOutMutation = useSignOut()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  function handleLogout() {
    setMenuOpen(false)
    signOutMutation.mutate()
  }

  const displayName = user?.fullName ?? user?.email ?? 'Admin'
  const displaySubtitle = user?.accountId
    ? user.accountId
    : user?.fullName
      ? user.email
      : 'Administrator'

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-6 border-b border-[rgba(198,197,212,0.1)] bg-surface-topbar px-8 backdrop-blur-xl">
      <SearchInput
        wrapperClassName="max-w-md flex-1"
        placeholder="Search analytics, students or courses..."
      />
      <div className="flex items-center gap-6">
        <button
          type="button"          aria-label="Notifications"
          className="relative rounded-full p-2 text-nav transition-colors hover:text-ink"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-white bg-[#ba1a1a]" />
        </button>

        <div className="h-8 w-px bg-[#e2e8f0]" />

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="max-w-[10rem] truncate text-xs font-bold text-admin-name">
              {displayName}
            </p>
            {/* <p className="max-w-[10rem] truncate text-[10px] text-nav">{displaySubtitle}</p> */}
          </div>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="Account menu"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-10 w-14 shrink-0 overflow-hidden rounded-card border-2 border-primary-50 bg-primary-50 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-50 focus:ring-offset-2"
            >
              <img
                src={userAvatar}
                alt="user avatar"
                className="size-full object-contain object-center"
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 min-w-[10rem] overflow-hidden rounded-card border border-[#e2e8f0] bg-white py-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={signOutMutation.isPending}
                  className={cn(
                    'flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#ba1a1a]',
                    'transition-colors hover:bg-red-50 disabled:opacity-60',
                  )}
                >
                  <LogOut className="h-4 w-4 text-[#ba1a1a]" aria-hidden />
                  {signOutMutation.isPending ? 'Signing out…' : 'Log out'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
