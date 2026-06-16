import type { LucideIcon } from 'lucide-react'
import { BookOpen, IdCard, Users, Wallet } from 'lucide-react'
import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'

/** Shape returned by `getDashboardAnalytics` (see dashboard.api.ts) */
export type DashboardAnalytics = {
  totalStudents: { total: number; growth: number; display: string | null }
  totalFaculty: { total: number; newCount: number; display: string | null }
  totalCourses: { total: number; newCount: number; display: string | null }
  totalRevenue: {
    amount: number
    growth: number
    display: string
    growthDisplay: string
  }
}

type StatVisual = {
  label: string
  icon: LucideIcon
  iconTileClassName: string
  iconClassName: string
}

const statVisuals: Record<
  'totalStudents' | 'totalFaculty' | 'totalCourses' | 'totalRevenue',
  StatVisual
> = {
  totalStudents: {
    label: 'Total Students',
    icon: Users,
    iconTileClassName: 'bg-[#EEF2FF]',
    iconClassName: 'text-[#2c1452]',
  },
  totalFaculty: {
    label: 'Total Faculty',
    icon: IdCard,
    iconTileClassName: 'bg-[#F0FDF4]',
    iconClassName: 'text-[#15803D]',
  },
  totalCourses: {
    label: 'Total Courses',
    icon: BookOpen,
    iconTileClassName: 'bg-[#FFF7ED]',
    iconClassName: 'text-[#C2410C]',
  },
  totalRevenue: {
    label: 'Total Revenue',
    icon: Wallet,
    iconTileClassName: 'bg-[#FEFCE8]',
    iconClassName: 'text-[#4D7C0F]',
  },
}

const formatCount = (value: number) => value.toLocaleString('en-IN')

/** Render a growth / new-count badge, colored by direction. */
const buildFooter = (display: string | null) => {
  if (!display) return undefined
  const isNegative = display.includes('↓')
  return {
    text: display,
    className: isNegative ? 'text-[#DC2626]' : 'text-[#16A34A]',
  }
}

const toFooter = (display: string | null) => {
  const footer = buildFooter(display)
  if (!footer) return {}
  return {
    footer: <span className="text-xs font-semibold">{footer.text}</span>,
    footerClassName: footer.className,
  }
}

/**
 * Convert the dashboard analytics API response into grid items.
 * Returns an empty array when data is absent (e.g. while loading).
 */
export function dashboardStatItems(
  data?: DashboardAnalytics,
): SummaryStatItem[] {
  if (!data) return []

  return [
    {
      id: 'totalStudents',
      layout: 'inline',
      ...statVisuals.totalStudents,
      value: formatCount(data.totalStudents.total),
      ...toFooter(data.totalStudents.display),
    },
    {
      id: 'totalFaculty',
      layout: 'inline',
      ...statVisuals.totalFaculty,
      value: formatCount(data.totalFaculty.total),
      ...toFooter(data.totalFaculty.display),
    },
    {
      id: 'totalCourses',
      layout: 'inline',
      ...statVisuals.totalCourses,
      value: formatCount(data.totalCourses.total),
      ...toFooter(data.totalCourses.display),
    },
    {
      id: 'totalRevenue',
      layout: 'inline',
      ...statVisuals.totalRevenue,
      value: data.totalRevenue.display,
      ...toFooter(data.totalRevenue.growthDisplay),
    },
  ]
}
