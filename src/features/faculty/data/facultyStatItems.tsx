import { Star, Wallet } from 'lucide-react'
import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'
import { Paragraph } from '@/components/ui/Typography'
import type { FacultyDetail } from '@/features/faculty/data/mockFacultyDetail'

export function getFacultyStatItems(faculty: FacultyDetail): SummaryStatItem[] {
  const { stats } = faculty

  return [
    {
      id: 'courses-created',
      label: 'Courses created',
      value: String(stats.coursesCreated),
      footer: (
        <Paragraph variant="small" className="text-emerald-600">
          +{stats.coursesNew} New
        </Paragraph>
      ),
    },
    {
      id: 'total-students',
      label: 'Total students',
      value: stats.totalStudents.toLocaleString(),
      footer: (
        <Paragraph variant="small" className="text-emerald-600">
          ↑ {stats.studentsGrowthPercent}%
        </Paragraph>
      ),
    },
    {
      id: 'total-revenue',
      label: 'Total revenue',
      value: stats.totalRevenue,
      icon: Wallet,
      iconClassName: 'bg-surface-input text-nav',
    },
    {
      id: 'avg-rating',
      label: 'Avg rating',
      value: String(stats.avgRating),
      icon: Star,
      iconClassName: 'bg-amber-50 text-amber-600',
      footer: (
        <Paragraph variant="small" className="uppercase tracking-wide text-nav">
          {stats.reviewCount} reviews
        </Paragraph>
      ),
    },
  ]
}
