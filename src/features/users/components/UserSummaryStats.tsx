import { SummaryStatsGrid } from '@/components/ui/SummaryStatsGrid'
import {
  buildUserSummaryStatItems,
  userSummaryStatSkeletonProps,
} from '@/features/users/data/userSummaryStatItems'
import { useGetAllUsersAnalytics } from '@/features/users/hooks/useUserManagement'

export function UserSummaryStats() {
  const { data, isLoading, isError } = useGetAllUsersAnalytics()
  const items = buildUserSummaryStatItems(data)

  return (
    <div aria-live="polite" {...(isError ? { 'data-error': true } : {})}>
      <SummaryStatsGrid
        items={items}
        isLoading={isLoading}
        skeletonCount={4}
        skeletonProps={userSummaryStatSkeletonProps}
        className="gap-6"
      />
    </div>
  )
}
