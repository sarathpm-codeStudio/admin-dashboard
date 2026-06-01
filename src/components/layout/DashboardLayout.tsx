import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-surface-page">
      <Sidebar />
      <div className="flex h-screen flex-col pl-64">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
