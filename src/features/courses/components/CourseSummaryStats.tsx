import { SummaryStatsGrid } from '@/components/ui/SummaryStatsGrid'
import {
  buildCourseSummaryStatItems,
  courseSummaryStatSkeletonProps,
} from '@/features/courses/data/courseSummaryStatItems'
import { useGetCourseManagementAnalytics } from '../hooks/useCourseManagement'

export function CourseSummaryStats() {
  const { data, isLoading, isError } = useGetCourseManagementAnalytics()
  const items = buildCourseSummaryStatItems(data)

  return (
    <div aria-live="polite" {...(isError ? { 'data-error': true } : {})}>
    <SummaryStatsGrid
      items={items}
      columns={3}
      isLoading={isLoading}
      skeletonCount={3}
      skeletonProps={courseSummaryStatSkeletonProps}
      className="gap-6"
    />
    </div>
    )
}
