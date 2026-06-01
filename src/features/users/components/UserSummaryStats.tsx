import { SummaryStatsGrid } from '@/components/ui/SummaryStatsGrid'
import { getUserSummaryStatItems } from '@/features/users/data/userSummaryStatItems'

export function UserSummaryStats() {
  return <SummaryStatsGrid items={getUserSummaryStatItems()} />
}
