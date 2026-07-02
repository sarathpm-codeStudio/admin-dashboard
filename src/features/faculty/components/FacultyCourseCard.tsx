import { Banknote, MoreVertical, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, cardPaddingClass } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Header2 } from '@/components/ui/Typography'
import type { FacultyCourse } from '@/features/faculty/data/mockFacultyCourses'
import { cn } from '@/utils/cn'
import { useNavigate } from 'react-router-dom'

const courseStatusVariant = {
  active: 'courseActive',
  draft: 'draft',
} as const

const courseStatusLabel = {
  active: 'Active',
  draft: 'Draft',
} as const

const cardContentClass = 'text-[#191C1E]'

const metricLabelClass =
  'text-[10px] font-medium uppercase tracking-wide text-nav'

type FacultyCourseCardProps = {
  course: FacultyCourse
  className?: string
}

export function FacultyCourseCard({ course, className }: FacultyCourseCardProps) {
  const navigate = useNavigate()
  return (
    <Card className={cn(cardPaddingClass, 'flex h-full flex-col', className)}>
      <div className="flex items-start justify-between gap-2">
        <StatusBadge
          label={courseStatusLabel[course.status]}
          variant={courseStatusVariant[course.status]}
          className="rounded-nav px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
        />
        <button
          type="button"
          aria-label={`Actions for ${course.name}`}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-nav text-nav transition-colors hover:bg-surface-input hover:text-ink-heading"
        >
          <MoreVertical className="size-4" aria-hidden />
        </button>
      </div>

      <Header2
        size="card"
        className="mt-4 block min-h-[2.5rem] line-clamp-2 font-[500] leading-tight text-ink-heading"
      >
        {course.name}
      </Header2>

      <div className="mb-5 mt-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Users
            className={cn('size-4 shrink-0 stroke-[1.5]', cardContentClass)}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className={metricLabelClass}>Students</p>
            <p className={cn('mt-1 text-sm leading-5', cardContentClass)}>
              <span className="font-[700]">
                {course.studentsEnrolled.toLocaleString()} Enrolled
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Banknote
            className={cn('size-4 shrink-0 stroke-[1.5]', cardContentClass)}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className={metricLabelClass}>Revenue</p>
            <p className={cn('mt-1 text-sm font-bold leading-5', cardContentClass)}>
              {course.revenue}
            </p>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="mt-auto w-full py-2.5 text-xs font-bold text-[#312E81] hover:text-[#312E81]"
        onClick={() => navigate(`/courses/${course.id}/course-details`)}
      >
        View Details
      </Button>
    </Card>
  )
}
