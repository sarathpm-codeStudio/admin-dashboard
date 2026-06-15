import { Star } from 'lucide-react'
import revenueIcon from '@/asset/image/Container.png'
import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'
// import type { FacultyDetail } from '@/features/faculty/data/mockFacultyDetail'

const footerTrendClass =
  'text-xs font-semibold text-teal-600'
const footerMetaClass =
  'text-[10px] font-medium uppercase tracking-wide text-slate-400'

export function getFacultyStatItems(analytics: any, facultyId: string, facultyName: string): SummaryStatItem[] {
  if (!analytics || !facultyId) {
    return []
  }
  const facultyBase = `/userdetails/faculty/${facultyId}`

  return [
    {
      id: 'courses-created',
      label: 'Courses created',
      value: String(analytics.coursesCreated.total),
      to: `${facultyBase}/courses`,
      footer: (
        <span className={footerTrendClass}>+{analytics.coursesCreated.newCount} New</span>
      ),
    },
    {
      id: 'total-students',
      label: 'Total students',
      value: analytics.totalStudents.total.toLocaleString(),
      to: `${facultyBase}/enrollment`,
      footer: (
        <span className={footerTrendClass}>↑ {analytics.totalStudents.growth}%</span>
      ),
    },
    {
      id: 'total-revenue',
      label: 'Total revenue',
      value: analytics.totalRevenue.display,
      to: `/financial/faculty/${facultyId}/revenue?tab=faculty&facultyName=${encodeURIComponent(facultyName)}`,
      cornerImage: revenueIcon,
      cornerImageAlt: 'Revenue',
    },
    {
      id: 'avg-rating',
      label: 'Avg rating',
      value: String(analytics.avgRating.rating),
      to: `${facultyBase}/reviews`,
      valueAdornment: (
        <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
      ),
      footer: (
        <span className={footerMetaClass}>{analytics.avgRating.totalReviews} reviews</span>
      ),
    },
  ]
}
