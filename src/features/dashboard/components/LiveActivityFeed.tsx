import { Card, CardBody, cardPaddingClass } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'
import type { LiveActivity } from '@/features/dashboard/data/mockData'

type LiveActivityFeedProps = { activities: LiveActivity[]; className?: string }

export function LiveActivityFeed({ activities, className }: LiveActivityFeedProps) {
  return (
    <Card className={cn(cardPaddingClass, className)}>
      <CardBody>
        <SectionHeader title="Live Activity" />
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                    activity.iconClassName,
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <Paragraph variant="small" className="truncate">
                    {activity.message}
                  </Paragraph>
                  <Paragraph variant="caption" className="text-[10px]">
                    {activity.time}
                  </Paragraph>
                </div>
              </div>
            )
          })}
        </div>
      </CardBody>
    </Card>
  )
}
