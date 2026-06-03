import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-surface-page">
      <Sidebar />
      <div className="flex h-screen flex-col pl-64">
        <TopBar />
        <main className="scrollbar-none flex min-h-0 flex-1 flex-col overflow-hidden p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
