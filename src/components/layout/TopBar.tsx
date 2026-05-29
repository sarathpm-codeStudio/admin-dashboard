import { Bell, Search } from 'lucide-react'

export function TopBar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-6 border-b border-[rgba(198,197,212,0.1)] bg-surface-topbar px-8 backdrop-blur-xl">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          placeholder="Search analytics, students or courses..."
          className="w-full rounded-card border-0 bg-surface-input py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-[#6b7280] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-50"
        />
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-nav transition-colors hover:text-ink"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-white bg-[#ba1a1a]" />
        </button>

        <div className="h-8 w-px bg-[#e2e8f0]" />

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold text-admin-name">Super Admin</p>
            <p className="text-[10px] text-nav">Administrator</p>
          </div>
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-card border-2 border-primary-50 bg-primary-50 text-sm font-semibold text-primary-800">
            SA
          </div>
        </div>
      </div>
    </header>
  )
}
