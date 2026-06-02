import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'
import { dashboardStats } from '@/features/dashboard/data/mockData'

export const dashboardStatItems: SummaryStatItem[] = dashboardStats.map((stat) => ({
  id: stat.label,
  label: stat.label,
  value: stat.value,
  cornerIcon: stat.icon,
  cornerIconClassName: 'text-slate-400',
}))
