import { CirclePlay, ListTodo, UserPlus, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { DashboardPendingAction, PendingActionTarget } from '@/api/dashboard/dashboard.api'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

function resolvePendingActionPath(target: PendingActionTarget): string {
  if (target.kind === 'faculty') {
    return `/userdetails/faculty/${target.facultyId}`
  }
  return '/courses'
}
type PendingActionVisual = {
  icon: LucideIcon
  iconTileClassName: string
  iconClassName: string
}

const PENDING_ACTION_VISIBLE_ROWS = 5
/** 5 rows × 78px + 4 gaps × 12px — two rows taller than the original 5-row area */
const pendingActionsListHeightClass = 'min-h-[450px]'
const pendingActionsListScrollClass = 'max-h-[450px] overflow-y-auto pr-1'

const pendingActionsListClass = (scrollable: boolean) =>
  cn(
    'm-0 list-none space-y-3 p-0',
    pendingActionsListHeightClass,
    scrollable && pendingActionsListScrollClass,
  )

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
    <button
      type="button"
      onClick={onAction}
      className="flex w-full flex-wrap items-center justify-between gap-3 rounded-[16px] bg-[#F2F4F6] px-4 py-3.5 text-left transition-colors hover:bg-[#E8EAED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-50"
    >
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
    </button>
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
    navigate(resolvePendingActionPath(action.target))
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
          <div className="flex min-w-0 items-center gap-2">
            {isLoading ? (
              <span
                className="inline-block h-6 w-8 animate-pulse rounded-full bg-[#F2F4F6]"
                aria-hidden
              />
            ) : actions.length > 0 ? (
              <span
                className="inline-flex min-w-7 shrink-0 items-center justify-center rounded-full bg-[#2c1452] px-2 py-0.5 text-xs font-bold tabular-nums text-white"
                aria-label={`${actions.length} pending actions`}
              >
                {actions.length}
              </span>
            ) : null}
            <h2 className="text-base font-bold text-[#191c1e]">Pending Actions</h2>
          </div>
          {/* <button
            type="button"
            className="shrink-0 text-sm font-medium text-[#2c1452] transition-colors hover:text-[#1d0d38]"
          >
            View All Task
          </button> */}
        </div>

        {isLoading ? (
          <ul className={pendingActionsListClass(false)}>
            {Array.from({ length: PENDING_ACTION_VISIBLE_ROWS }).map((_, index) => (
              <li
                key={index}
                className="h-[78px] animate-pulse rounded-[16px] bg-[#F2F4F6]"
              />
            ))}
          </ul>
        ) : actions.length === 0 ? (
          <div
            className={cn(
              'flex flex-col items-center justify-center gap-3 rounded-[16px] bg-[#F2F4F6] px-4',
              pendingActionsListHeightClass,
            )}
          >
            <div
              className="flex size-12 items-center justify-center rounded-[12px] bg-[#E8EAED]"
              aria-hidden
            >
              <ListTodo className="size-5 text-[#5F5E5E]" strokeWidth={2.25} />
            </div>
            <p className="text-sm font-medium text-[#5F5E5E]">No pending actions</p>
          </div>
        ) : (
          <ul className={pendingActionsListClass(actions.length > PENDING_ACTION_VISIBLE_ROWS)}>
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
