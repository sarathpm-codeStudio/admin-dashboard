import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'
import { dashboardStats } from '@/features/dashboard/data/mockData'

export const dashboardStatItems: SummaryStatItem[] = dashboardStats.map((stat) => ({
  id: stat.label,
  layout: 'inline',
  label: stat.label,
  value: stat.value,
  icon: stat.icon,
  iconTileClassName: stat.iconTileClassName,
  iconClassName: stat.iconClassName,
}))
