import { Star } from 'lucide-react'
import revenueIcon from '@/asset/image/Container.png'
import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'
import type { FacultyDetail } from '@/features/faculty/data/mockFacultyDetail'

const footerTrendClass = 'text-xs font-semibold text-teal-600'
const footerMetaClass =
  'text-[10px] font-medium uppercase tracking-wide text-slate-400'

export function getFacultyStatItems(faculty: FacultyDetail): SummaryStatItem[] {
  const { stats } = faculty

  return [
    {
      id: 'courses-created',
      label: 'Courses created',
      value: String(stats.coursesCreated),
      footer: <span className={footerTrendClass}>+{stats.coursesNew} New</span>,
    },
    {
      id: 'total-students',
      label: 'Total students',
      value: stats.totalStudents.toLocaleString(),
      footer: <span className={footerTrendClass}>↑ {stats.studentsGrowthPercent}%</span>,
    },
    {
      id: 'total-revenue',
      label: 'Total revenue',
      value: stats.totalRevenue,
      cornerImage: revenueIcon,
      cornerImageAlt: 'Revenue',
    },
    {
      id: 'avg-rating',
      label: 'Avg rating',
      value: String(stats.avgRating),
      valueAdornment: (
        <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
      ),
      footer: (
        <span className={footerMetaClass}>{stats.reviewCount} reviews</span>
      ),
    },
  ]
}
