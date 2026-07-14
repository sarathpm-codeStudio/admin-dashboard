import { Clock, ImageIcon, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Header2 } from '@/components/ui/Typography'
import type { FacultyCourse } from '@/features/faculty/data/mockFacultyCourses'
import { cn } from '@/utils/cn'
import { useNavigate } from 'react-router-dom'

const metaTextClass = 'flex items-center gap-1.5 text-xs text-[#64748B]'

type FacultyCourseCardProps = {
  course: FacultyCourse
  className?: string
}

export function FacultyCourseCard({ course, className }: FacultyCourseCardProps) {
  const navigate = useNavigate()
  const openCourse = () => navigate(`/courses/${course.id}/course-details`)

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={openCourse}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openCourse()
        }
      }}
      className={cn(
        'flex h-full cursor-pointer flex-col overflow-hidden p-0 transition-shadow hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81]/40',
        className,
      )}
    >
      <div className="relative aspect-[16/9] w-full bg-[#F1F5F9]">
        {course.coverImage ? (
          <img
            src={course.coverImage}
            alt={course.name}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageIcon className="size-8 text-[#CBD5E1]" aria-hidden />
          </div>
        )}

        {course.status === 'draft' ? (
          <StatusBadge
            label="Draft"
            variant="draft"
            className="absolute left-3 top-3 rounded-nav px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {course.category ? (
          <span className="w-fit rounded-md bg-[#EAF1FE] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#3B82F6]">
            {course.category}
          </span>
        ) : null}

        <Header2
          size="card"
          className="mt-3 block truncate font-[700] leading-tight text-ink-heading"
          title={course.name}
        >
          {course.name}
        </Header2>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <span className={metaTextClass}>
            <Clock className="size-3.5 shrink-0 stroke-[1.5]" aria-hidden />
            {course.durationDisplay}
          </span>
          <span className={metaTextClass}>
            <Users className="size-3.5 shrink-0 stroke-[1.5]" aria-hidden />
            {course.studentsEnrolled.toLocaleString()} Students
          </span>
        </div>

        <div className="mt-auto flex min-w-0 flex-wrap items-baseline gap-2 pt-5">
          <p className="text-lg font-[700] leading-none text-[#312E81]">
            {course.priceDisplay}
          </p>
          {course.originalPriceDisplay ? (
            <p className="text-sm leading-none text-[#94A3B8] line-through">
              {course.originalPriceDisplay}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
