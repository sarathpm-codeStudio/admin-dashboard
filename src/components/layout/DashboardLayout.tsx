import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { ChatWidget } from '@/features/chat/ChatWidget'
import { usePresenceHeartbeat } from '@/features/chat/hooks/usePresence'
import { useAuthStore } from '@/store/authStore'

export function DashboardLayout() {
  const myId = useAuthStore((s) => s.user?.id)
  // Broadcast my presence for the whole session, not just the chat page, so
  // peers see me online as soon as I open the app.
  usePresenceHeartbeat(!!myId)

  return (
    <div className="flex h-screen overflow-hidden bg-surface-page">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="scrollbar-none flex min-h-0 flex-1 flex-col overflow-hidden p-8">
          <Outlet />
        </main>
      </div>
      <ChatWidget />
    </div>
  )
}
