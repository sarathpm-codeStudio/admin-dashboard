import type { ReactNode } from 'react'
import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'
import type { UsersAnalytics } from '@/api/userManagement/userManagement.api'

const userStatCardClass =
  'min-h-[7.5rem] rounded-xl border border-[#F3F4F6] bg-white p-6 shadow-sm'

const labelGrayClass = 'text-[14px] font-medium text-[#6B7280]'
const valueBlueClass = 'text-3xl font-bold leading-none tracking-tight text-[#1E3A8A]'
const valueBlackClass = 'text-3xl font-bold leading-none tracking-tight text-[#000000]'
const pendingLabelClass = 'text-[14px] font-medium lowercase text-[#BA1A1A]'
const pendingValueClass = 'text-3xl font-bold leading-none tracking-tight text-[#BA1A1A]'
const footerTealClass = 'text-xs font-medium text-[#00A6BF]'
const userStatFooterClass = 'justify-start items-start'

export const userSummaryStatSkeletonProps = {
  className: userStatCardClass,
  footerClassName: userStatFooterClass,
} as const

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

/** Pure mapper: pass API data from a hook in the parent component */
export function buildUserSummaryStatItems(
  analytics: UsersAnalytics | undefined,
): SummaryStatItem[] {
  return [
    {
      id: 'total-users',
      label: 'Total users',
      value: (analytics?.totalUsers ?? 0).toLocaleString(),
      className: userStatCardClass,
      labelClassName: labelGrayClass,
      valueClassName: valueBlueClass,
      footer: <span className={footerTealClass}>{analytics?.growth.display}</span>,
      footerClassName: userStatFooterClass,
    },
    {
      id: 'students',
      label: 'Students',
      value: (analytics?.students.total ?? 0).toLocaleString(),
      className: userStatCardClass,
      labelClassName: labelGrayClass,
      valueClassName: valueBlackClass,
      footer: (
        <TealStatusFooter>
          {(analytics?.students.active ?? 0).toLocaleString()} Active
        </TealStatusFooter>
      ),
      footerClassName: userStatFooterClass,
    },
    {
      id: 'faculty',
      label: 'Faculty',
      value: (analytics?.faculty.total ?? 0).toLocaleString(),
      className: userStatCardClass,
      labelClassName: labelGrayClass,
      valueClassName: valueBlackClass,
      footer: (
        <TealStatusFooter>
          {(analytics?.faculty.active ?? 0).toLocaleString()} Active
        </TealStatusFooter>
      ),
      footerClassName: userStatFooterClass,
    },
    {
      id: 'pending-approvals',
      label: 'pending approvals',
      value: String(analytics?.pendingApprovals.total ?? 0),
      className: userStatCardClass,
      labelClassName: pendingLabelClass,
      valueClassName: pendingValueClass,
      footer: (
        <TealStatusFooter>
          {analytics?.pendingApprovals.display ?? 'Awaiting verification docs'}
        </TealStatusFooter>
      ),
      footerClassName: userStatFooterClass,
    },
  ]
}
