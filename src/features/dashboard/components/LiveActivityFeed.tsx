import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'
import type { LiveActivity } from '@/features/dashboard/data/mockData'

type LiveActivityFeedProps = { activities: LiveActivity[]; className?: string }

export function LiveActivityFeed({ activities, className }: LiveActivityFeedProps) {
  return (
    <Card
      className={cn(
        'w-full rounded-[12px] border border-[#e2e8f0]/60 p-6 shadow-sm',
        className,
      )}
    >
      <h2 className="mb-5 text-base font-bold text-[#111827]">Live Activity</h2>

      <div className="flex flex-col">
        {activities.map((activity, index) => {
          const Icon = activity.icon
          const isLast = index === activities.length - 1

          return (
            <div
              key={activity.id}
              className={cn('relative flex gap-3', !isLast && 'pb-6')}
            >
              {!isLast && (
                <div
                  className="absolute left-4 top-8 w-px -translate-x-1/2 bg-[#E2E8F0]"
                  style={{ bottom: 0 }}
                  aria-hidden
                />
              )}

              <div
                className={cn(
                  'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full',
                  activity.iconBgClassName,
                )}
              >
                <Icon className="size-4 text-white" strokeWidth={2.25} aria-hidden />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm leading-snug text-[#111827]">
                  <span className="font-bold">{activity.highlight}</span>
                  {activity.rest}
                </p>
                <p className="mt-1 text-xs text-[#6B7280]">{activity.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
