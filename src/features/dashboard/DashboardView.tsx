import { SummaryStatsGrid } from '@/components/ui/SummaryStatsGrid'

import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader'

import { dashboardStatItems } from '@/features/dashboard/data/dashboardStatItems'

import { EnrollmentTrendsChart } from '@/features/dashboard/components/EnrollmentTrendsChart'

import { FinancialPulseCard } from '@/features/dashboard/components/FinancialPulseCard'

import { LiveActivityFeed } from '@/features/dashboard/components/LiveActivityFeed'

import { PendingActionsList } from '@/features/dashboard/components/PendingActionsList'

import { PlatformHealthPanel } from '@/features/dashboard/components/PlatformHealthPanel'

import { RevenueTrendsChart } from '@/features/dashboard/components/RevenueTrendsChart'

import { SystemAlerts } from '@/features/dashboard/components/SystemAlerts'

import { TopPerformers } from '@/features/dashboard/components/TopPerformers'

import {

  liveActivities,

  platformHealth,

  quickActions,

  systemAlerts,

} from '@/features/dashboard/data/mockData'
import { useGetDashboardAnalytics, useGetPendingActions } from './hooks/useDashboardmanagement'



const dashboardColumnsClass =

  'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:items-start'



export function DashboardView() {

  // query

  const { data: dashboardData, isLoading: isDashboardLoading } = useGetDashboardAnalytics()

  const { data: pendingActions, isLoading: isPendingActionsLoading } = useGetPendingActions()

  const statItems = dashboardStatItems(dashboardData)


  return (

    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto">

      <DashboardHeader />



      <SummaryStatsGrid
        items={statItems}
        isLoading={isDashboardLoading}
        skeletonCount={4}
        skeletonProps={{ layout: 'inline' }}
        className="gap-6"
      />



      <div className={dashboardColumnsClass}>

        <div className="flex flex-col gap-6">

          <EnrollmentTrendsChart />

          <RevenueTrendsChart />

          <PendingActionsList
            actions={pendingActions ?? []}
            isLoading={isPendingActionsLoading}
          />

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


