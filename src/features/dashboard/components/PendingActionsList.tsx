import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

export type PendingActionItemData = {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  iconTileClassName: string
  iconClassName: string
}

type PendingActionItemProps = PendingActionItemData

export function PendingActionItem({
  title,
  subtitle,
  icon: Icon,
  iconTileClassName,
  iconClassName,
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
          <p className="truncate text-sm font-bold text-[#1B2559]">{title}</p>
          <p className="truncate text-sm text-[#5F5E5E]">{subtitle}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <button
          type="button"
          className="rounded-[10px] bg-[#EEF2FF] px-4 py-2 text-sm font-medium text-[#4318FF] transition-colors hover:bg-[#E0E7FF]"
        >
          Review
        </button>
        <button
          type="button"
          className="rounded-[10px] bg-[#1B2559] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Approve
        </button>
      </div>
    </div>
  )
}

type PendingActionsListProps = {
  actions: PendingActionItemData[]
  className?: string
}

export function PendingActionsList({ actions, className }: PendingActionsListProps) {
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
          <button
            type="button"
            className="shrink-0 text-sm font-medium text-[#4318FF] transition-colors hover:text-[#3311DB]"
          >
            View All Task
          </button>
        </div>
        <ul className="m-0 list-none space-y-3 p-0">
          {actions.map((action) => (
            <li key={action.id}>
              <PendingActionItem {...action} />
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
