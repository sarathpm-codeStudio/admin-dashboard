import { SummaryStatCard } from '@/components/ui/SummaryStatCard'
import { Paragraph } from '@/components/ui/Typography'
import { userSummaryStats } from '@/features/users/data/mockUsers'

export function UserSummaryStats() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <SummaryStatCard
        label="Total users"
        value={userSummaryStats.totalUsers.toLocaleString()}
        footer={
          <Paragraph variant="small" className="text-emerald-600">
            +{userSummaryStats.totalGrowthPercent}% on this month
          </Paragraph>
        }
      />
      <SummaryStatCard
        label="Students"
        value={userSummaryStats.students.toLocaleString()}
        footer={
          <Paragraph variant="small" className="text-emerald-600">
            <span aria-hidden>● </span>
            {userSummaryStats.studentsActive.toLocaleString()} Active
          </Paragraph>
        }
      />
      <SummaryStatCard
        label="Faculty"
        value={userSummaryStats.faculty.toLocaleString()}
        footer={
          <Paragraph variant="small" className="text-emerald-600">
            <span aria-hidden>● </span>
            {userSummaryStats.facultyActive.toLocaleString()} Active
          </Paragraph>
        }
      />
      <SummaryStatCard
        label="Pending approvals"
        value={String(userSummaryStats.pendingApprovals)}
        labelClassName="text-red-600 normal-case"
        valueClassName="text-red-600"
        footer={
          <Paragraph variant="small" className="text-blue-600">
            <span aria-hidden>● </span>
            Awaiting verification docs
          </Paragraph>
        }
      />
    </div>
  )
}
