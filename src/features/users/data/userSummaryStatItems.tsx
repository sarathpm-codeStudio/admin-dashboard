import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'
import { userSummaryStats } from '@/features/users/data/mockUsers'

const footerTrendClass = 'text-xs font-semibold text-teal-600'
const footerMetaClass = 'text-xs font-medium text-blue-600'

export function getUserSummaryStatItems(): SummaryStatItem[] {
  const stats = userSummaryStats

  return [
    {
      id: 'total-users',
      label: 'Total users',
      value: stats.totalUsers.toLocaleString(),
      footer: (
        <span className={footerTrendClass}>+{stats.totalGrowthPercent}% on this month</span>
      ),
    },
    {
      id: 'students',
      label: 'Students',
      value: stats.students.toLocaleString(),
      footer: (
        <span className={footerTrendClass}>
          <span aria-hidden>● </span>
          {stats.studentsActive.toLocaleString()} Active
        </span>
      ),
    },
    {
      id: 'faculty',
      label: 'Faculty',
      value: stats.faculty.toLocaleString(),
      footer: (
        <span className={footerTrendClass}>
          <span aria-hidden>● </span>
          {stats.facultyActive.toLocaleString()} Active
        </span>
      ),
    },
    {
      id: 'pending-approvals',
      label: 'Pending approvals',
      value: String(stats.pendingApprovals),
      labelClassName: 'text-red-600',
      valueClassName: 'text-red-600',
      footer: (
        <span className={footerMetaClass}>
          <span aria-hidden>● </span>
          Awaiting verification docs
        </span>
      ),
    },
  ]
}
