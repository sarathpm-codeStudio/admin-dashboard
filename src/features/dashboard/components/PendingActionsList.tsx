import { CirclePlay, UserPlus, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { DashboardPendingAction } from '@/api/dashboard/dashboard.api'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

type PendingActionVisual = {
  icon: LucideIcon
  iconTileClassName: string
  iconClassName: string
}

const visualByType: Record<DashboardPendingAction['type'], PendingActionVisual> = {
  FACULTY: {
    icon: UserPlus,
    iconTileClassName: 'bg-[#FFF5D9]',
    iconClassName: 'text-[#B45309]',
  },
  COURSE: {
    icon: CirclePlay,
    iconTileClassName: 'bg-[#E9EDF7]',
    iconClassName: 'text-[#4318FF]',
  },
}

type PendingActionItemProps = {
  title: string
  subtitle: string
  visual: PendingActionVisual
  onAction: () => void
}

export function PendingActionItem({
  title,
  subtitle,
  visual: { icon: Icon, iconTileClassName, iconClassName },
  onAction,
}: PendingActionItemProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-[#F2F4F6] px-4 py-3.5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-[12px]',
            iconTileClassName,
          )}
        >
          <Icon className={cn('size-5', iconClassName)} strokeWidth={2.25} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#2c1452]">{title}</p>
          <p className="truncate text-sm text-[#5F5E5E]">{subtitle}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <button
          type="button"
          onClick={onAction}
          className="rounded-[10px] bg-[#2c1452] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Take Action
        </button>
      </div>
    </div>
  )
}

type PendingActionsListProps = {
  actions: DashboardPendingAction[]
  isLoading?: boolean
  className?: string
}

export function PendingActionsList({ actions, isLoading, className }: PendingActionsListProps) {
  const navigate = useNavigate()

  const handleAction = (action: DashboardPendingAction) => {
    if (action.target.kind === 'faculty') {
      navigate(`/userdetails/faculty/${action.target.facultyId}`)
    } else {
      navigate('/courses')
    }
  }

  return (
    <Card
      className={cn(
        'box-border h-fit w-full rounded-[20px] border border-[#e2e8f0]/60 p-6 shadow-sm',
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#191c1e]">Pending Actions</h2>
          {/* <button
            type="button"
            className="shrink-0 text-sm font-medium text-[#2c1452] transition-colors hover:text-[#1d0d38]"
          >
            View All Task
          </button> */}
        </div>

        {isLoading ? (
          <ul className="m-0 list-none space-y-3 p-0">
            {Array.from({ length: 3 }).map((_, index) => (
              <li
                key={index}
                className="h-[78px] animate-pulse rounded-[16px] bg-[#F2F4F6]"
              />
            ))}
          </ul>
        ) : actions.length === 0 ? (
          <p className="rounded-[16px] bg-[#F2F4F6] px-4 py-6 text-center text-sm text-[#5F5E5E]">
            No pending actions right now.
          </p>
        ) : (
          <ul
            className={cn(
              'm-0 list-none space-y-3 p-0',
              // Show ~5 items, then scroll the rest inline.
              actions.length > 5 && 'max-h-[450px] overflow-y-auto pr-1',
            )}
          >
            {actions.map((action) => (
              <li key={action.id}>
                <PendingActionItem
                  title={action.title}
                  subtitle={action.subtitle}
                  visual={visualByType[action.type]}
                  onAction={() => handleAction(action)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
