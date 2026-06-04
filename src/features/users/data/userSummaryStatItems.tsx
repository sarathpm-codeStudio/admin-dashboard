import type { ReactNode } from 'react'
import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'
import { userSummaryStats } from '@/features/users/data/mockUsers'

const userStatCardClass =
  'min-h-[7.5rem] rounded-xl border border-[#F3F4F6] bg-white p-6 shadow-sm'

const labelGrayClass = 'text-[14px] font-medium text-[#6B7280]'
const valueBlueClass = 'text-3xl font-bold leading-none tracking-tight text-[#1E3A8A]'
const valueBlackClass = 'text-3xl font-bold leading-none tracking-tight text-[#000000]'
const pendingLabelClass = 'text-[14px] font-medium lowercase text-[#BA1A1A]'
const pendingValueClass = 'text-3xl font-bold leading-none tracking-tight text-[#BA1A1A]'
const footerTealClass = 'text-xs font-medium text-[#00A6BF]'
const userStatFooterClass = 'justify-start items-start'

function TealStatusFooter({ children }: { children: ReactNode }) {
  return (
    <span className={footerTealClass}>
      <span className="text-[#00A6BF]" aria-hidden>
        •{' '}
      </span>
      {children}
    </span>
  )
}

export function getUserSummaryStatItems(): SummaryStatItem[] {
  const stats = userSummaryStats

  return [
    {
      id: 'total-users',
      label: 'Total users',
      value: stats.totalUsers.toLocaleString(),
      className: userStatCardClass,
      labelClassName: labelGrayClass,
      valueClassName: valueBlueClass,
      footer: (
        <span className={footerTealClass}>
          +{stats.totalGrowthPercent}% on this month
        </span>
      ),
      footerClassName: userStatFooterClass,
    },
    {
      id: 'students',
      label: 'Students',
      value: stats.students.toLocaleString(),
      className: userStatCardClass,
      labelClassName: labelGrayClass,
      valueClassName: valueBlackClass,
      footer: (
        <TealStatusFooter>{stats.studentsActive.toLocaleString()} Active</TealStatusFooter>
      ),
      footerClassName: userStatFooterClass,
    },
    {
      id: 'faculty',
      label: 'Faculty',
      value: stats.faculty.toLocaleString(),
      className: userStatCardClass,
      labelClassName: labelGrayClass,
      valueClassName: valueBlackClass,
      footer: (
        <TealStatusFooter>{stats.facultyActive.toLocaleString()} Active</TealStatusFooter>
      ),
      footerClassName: userStatFooterClass,
    },
    {
      id: 'pending-approvals',
      label: 'pending approvals',
      value: String(stats.pendingApprovals),
      className: userStatCardClass,
      labelClassName: pendingLabelClass,
      valueClassName: pendingValueClass,
      footer: <TealStatusFooter>Awaiting verification docs</TealStatusFooter>,
      footerClassName: userStatFooterClass,
    },
  ]
}
