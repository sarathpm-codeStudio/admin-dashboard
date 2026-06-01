import { Card, CardBody, cardPaddingClass } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'
import { topPerformers } from '@/features/dashboard/data/mockData'

type TopPerformersProps = { className?: string }

export function TopPerformers({ className }: TopPerformersProps) {
  const CourseIcon = topPerformers.course.icon

  return (
    <Card className={cn(cardPaddingClass, className)}>
      <CardBody>
        <SectionHeader title="Top Performers" />
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-800">
              {topPerformers.faculty.initials}
            </div>
            <div className="min-w-0">
              <Paragraph variant="emphasis" className="truncate">
                {topPerformers.faculty.name}
              </Paragraph>
              <Paragraph variant="caption">Top Faculty • {topPerformers.faculty.detail}</Paragraph>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-card bg-orange-50 text-orange-600">
              <CourseIcon className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <Paragraph variant="emphasis" className="truncate">
                {topPerformers.course.name}
              </Paragraph>
              <Paragraph variant="caption">Top Course • {topPerformers.course.detail}</Paragraph>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
