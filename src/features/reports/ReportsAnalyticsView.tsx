import { SummaryStatsGrid } from '@/components/ui/SummaryStatsGrid'
import { EnrollmentTrendsChart } from '@/features/dashboard/components/EnrollmentTrendsChart'
import { RevenueTrendsChart } from '@/features/dashboard/components/RevenueTrendsChart'
import { ReportsHeader } from '@/features/reports/components/ReportsHeader'
import { CourseStatusBreakdown } from '@/features/reports/components/CourseStatusBreakdown'
import { RevenueByCategory } from '@/features/reports/components/RevenueByCategory'
import { TopCoursesTable } from '@/features/reports/components/TopCoursesTable'
import { reportStatItems } from '@/features/reports/data/reportStatItems'
import { useGetReportsSummary } from '@/features/reports/hooks/useReports'

const twoColumnClass =
  'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] lg:items-stretch'

export function ReportsAnalyticsView() {
  const { data: summary, isLoading: isSummaryLoading } = useGetReportsSummary()
  const statItems = reportStatItems(summary)

  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto">
      <ReportsHeader />

      <SummaryStatsGrid
        items={statItems}
        isLoading={isSummaryLoading}
        skeletonCount={4}
        skeletonProps={{ layout: 'inline' }}
        className="gap-6"
      />

      <div className={twoColumnClass}>
        <RevenueTrendsChart />
        <CourseStatusBreakdown fillHeight />
      </div>

      <div className={twoColumnClass}>
        <EnrollmentTrendsChart />
        <RevenueByCategory fillHeight />
      </div>

      <TopCoursesTable />
    </div>
  )
}
