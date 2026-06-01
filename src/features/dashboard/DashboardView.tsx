import { StatCard } from '@/components/ui/StatCard'
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader'
import { EnrollmentTrendsChart } from '@/features/dashboard/components/EnrollmentTrendsChart'
import { FinancialPulseCard } from '@/features/dashboard/components/FinancialPulseCard'
import { LiveActivityFeed } from '@/features/dashboard/components/LiveActivityFeed'
import { PendingActionsList } from '@/features/dashboard/components/PendingActionsList'
import { PlatformHealthPanel } from '@/features/dashboard/components/PlatformHealthPanel'
import { RevenueTrendsChart } from '@/features/dashboard/components/RevenueTrendsChart'
import { SystemAlerts } from '@/features/dashboard/components/SystemAlerts'
import { TopPerformers } from '@/features/dashboard/components/TopPerformers'
import {
  dashboardStats,
  liveActivities,
  pendingActions,
  platformHealth,
  quickActions,
  systemAlerts,
} from '@/features/dashboard/data/mockData'

const dashboardColumnsClass =
  'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:items-start'

export function DashboardView() {
  return (
    <div className="space-y-6">
      <DashboardHeader />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className={dashboardColumnsClass}>
        <div className="flex flex-col gap-6">
          <EnrollmentTrendsChart />
          <RevenueTrendsChart />
          <PendingActionsList actions={pendingActions} />
        </div>

        <div className="flex flex-col gap-6">
          <SystemAlerts alerts={systemAlerts} />
          <FinancialPulseCard />
          <TopPerformers />
          <LiveActivityFeed activities={liveActivities} />
          <PlatformHealthPanel
            activeCourses={platformHealth.activeCourses}
            activeStudents={platformHealth.activeStudents}
            actions={quickActions}
          />
        </div>
      </div>
    </div>
  )
}
