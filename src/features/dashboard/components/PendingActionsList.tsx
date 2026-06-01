import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

export type PendingActionItemData = {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  iconClassName: string
}

type PendingActionItemProps = PendingActionItemData

export function PendingActionItem({ title, subtitle, icon: Icon, iconClassName }: PendingActionItemProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-nav bg-surface-input px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full',
            iconClassName,
          )}
        >
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <Paragraph variant="emphasis" className="truncate">
            {title}
          </Paragraph>
          <Paragraph variant="caption" className="truncate">
            {subtitle}
          </Paragraph>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button type="button" className="text-xs font-medium text-primary hover:underline">
          Review
        </button>
        <Button className="rounded-nav px-4 py-1.5 text-xs">Approve</Button>
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
        'box-border h-fit w-full px-5 pb-5 pt-4',
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="Pending Actions"
          titleSize="card"
          className="items-center"
          action={
            <button
              type="button"
              className="shrink-0 text-sm font-medium leading-none text-primary hover:underline"
            >
              View All Task
            </button>
          }
        />
        <ul className="m-0 list-none space-y-2.5 p-0">
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
