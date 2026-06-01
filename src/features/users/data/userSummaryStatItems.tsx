import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'
import { Paragraph } from '@/components/ui/Typography'
import { userSummaryStats } from '@/features/users/data/mockUsers'

export function getUserSummaryStatItems(): SummaryStatItem[] {
  const stats = userSummaryStats

  return [
    {
      id: 'total-users',
      label: 'Total users',
      value: stats.totalUsers.toLocaleString(),
      footer: (
        <Paragraph variant="small" className="text-emerald-600">
          +{stats.totalGrowthPercent}% on this month
        </Paragraph>
      ),
    },
    {
      id: 'students',
      label: 'Students',
      value: stats.students.toLocaleString(),
      footer: (
        <Paragraph variant="small" className="text-emerald-600">
          <span aria-hidden>● </span>
          {stats.studentsActive.toLocaleString()} Active
        </Paragraph>
      ),
    },
    {
      id: 'faculty',
      label: 'Faculty',
      value: stats.faculty.toLocaleString(),
      footer: (
        <Paragraph variant="small" className="text-emerald-600">
          <span aria-hidden>● </span>
          {stats.facultyActive.toLocaleString()} Active
        </Paragraph>
      ),
    },
    {
      id: 'pending-approvals',
      label: 'Pending approvals',
      value: String(stats.pendingApprovals),
      labelClassName: 'text-red-600 normal-case',
      valueClassName: 'text-red-600',
      footer: (
        <Paragraph variant="small" className="text-blue-600">
          <span aria-hidden>● </span>
          Awaiting verification docs
        </Paragraph>
      ),
    },
  ]
}
