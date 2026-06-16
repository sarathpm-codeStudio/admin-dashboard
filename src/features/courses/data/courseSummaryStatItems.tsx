import type { LucideIcon } from 'lucide-react'
import { CheckCircle2, XCircle } from 'lucide-react'
import bookIcon from '@/asset/icons/book.png'
import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'
import type { CoursesAnalytics } from '@/features/courses/types'
import { cn } from '@/utils/cn'

const courseStatCardClass =
  'min-h-[7.5rem] rounded-xl border border-[#F3F4F6] bg-white p-6 shadow-sm'

const courseStatCardWithIconClass =
  'relative min-h-[7.5rem] rounded-xl border border-[#F3F4F6] bg-white p-6 pr-16 shadow-sm'

const labelGrayClass = 'text-[14px] font-medium text-[#6B7280]'
const valueBlueClass = 'text-3xl font-bold leading-none tracking-tight text-[#1E3A8A]'
const valueBlackClass = 'text-3xl font-bold leading-none tracking-tight text-[#000000]'
const courseStatFooterClass = 'justify-start items-start'

export const courseSummaryStatSkeletonProps = {
  className: courseStatCardClass,
  footerClassName: courseStatFooterClass,
} as const

function StatImageAdornment({
  src,
  tileClassName,
  colorClassName,
  mode = 'mask',
  imageClassName,
}: {
  src: string
  tileClassName?: string
  colorClassName?: string
  mode?: 'mask' | 'image'
  imageClassName?: string
}) {
  if (mode === 'image') {
    return (
      <div className="absolute right-5 top-5" aria-hidden>
        <img
          src={src}
          alt=""
          className={cn('size-10 object-contain', imageClassName)}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'absolute right-5 top-5 flex size-10 items-center justify-center rounded-lg',
        tileClassName,
      )}
      aria-hidden
    >
      <span
        className={cn('size-5 mask-contain mask-center mask-no-repeat', colorClassName)}
        style={{
          WebkitMaskImage: `url(${src})`,
          maskImage: `url(${src})`,
        }}
      />
    </div>
  )
}
function StatIconAdornment({
  icon: Icon,
  tileClassName,
  iconClassName,
}: {
  icon: LucideIcon
  tileClassName: string
  iconClassName: string
}) {
  return (
    <div
      className={`absolute right-5 top-5 flex size-10 items-center justify-center rounded-lg ${tileClassName}`}
      aria-hidden
    >
      <Icon className={`size-5 stroke-[1.75] ${iconClassName}`} />
    </div>
  )
}

function GrowthFooter({ analytics }: { analytics: CoursesAnalytics | undefined }) {
  const display = analytics?.growth.display ?? '↑ 0% from last month'
  const percent = analytics?.growth.percent ?? 0
  const isPositive = percent > 0

  return (
    <span
      className={cn(
        'text-xs font-medium',
        isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]',
      )}
    >
      {display}
    </span>
  )
}

function EngagementFooter({ analytics }: { analytics: CoursesAnalytics | undefined }) {
  const display = analytics?.engagementDisplay ?? '0% Engagement rate'
  const rate = analytics?.engagementRate ?? 0
  const isPositive = rate > 0

  return (
    <span
      className={cn(
        'text-xs font-medium',
        isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]',
      )}
    >
      {display}
    </span>
  )
}

export function buildCourseSummaryStatItems(
  analytics: CoursesAnalytics | undefined,
): SummaryStatItem[] {
  return [
    {
      id: 'total-courses',
      label: 'Total Courses',
      value: (analytics?.totalCourses ?? 0).toLocaleString(),
      className: courseStatCardWithIconClass,
      labelClassName: labelGrayClass,
      valueClassName: valueBlueClass,
      headerAdornment: (
        <StatImageAdornment
          src={bookIcon}
          tileClassName="bg-[#EEF2FF]"
          colorClassName="bg-[#1E3A8A]"
        />
      ),
      footer: <GrowthFooter analytics={analytics} />,
      footerClassName: courseStatFooterClass,
    },
    {
      id: 'active-courses',
      label: 'Active Courses',
      value: (analytics?.activeCourses ?? 0).toLocaleString(),
      className: courseStatCardWithIconClass,
      labelClassName: labelGrayClass,
      valueClassName: valueBlackClass,
      headerAdornment: (
        <StatIconAdornment
          icon={CheckCircle2}
          tileClassName="bg-[#F0FDF4]"
          iconClassName="text-[#15803D]"
        />
      ),
      footer: <EngagementFooter analytics={analytics} />,
      footerClassName: courseStatFooterClass,
    },
    {
      id: 'rejected-courses',
      label: 'Rejected Courses',
      value: String(analytics?.rejectedCourses ?? 0),
      className: courseStatCardWithIconClass,
      labelClassName: labelGrayClass,
      valueClassName: valueBlackClass,
      headerAdornment: (
        <StatIconAdornment
          icon={XCircle}
          tileClassName="bg-[#FEF2F2]"
          iconClassName="text-[#DC2626]"
        />
      ),
      footer: (
        <span className="text-xs font-medium text-[#DC2626]">
          {analytics?.rejectedDisplay ?? 'Policy violations'}
        </span>
      ),
      footerClassName: courseStatFooterClass,
    },
  ]
}
