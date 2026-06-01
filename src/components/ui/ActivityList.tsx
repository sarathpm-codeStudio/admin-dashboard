import type { LucideIcon } from 'lucide-react'
import { Card, CardBody, cardPaddingClass } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

export type ActivityListItemData = {
  id: string
  title: string
  description?: string
  time: string
  icon: LucideIcon
  iconClassName?: string
}

type ActivityListProps = {
  title: string
  titleIcon?: LucideIcon
  items: ActivityListItemData[]
  className?: string
}

export function ActivityList({ title, titleIcon, items, className }: ActivityListProps) {
  return (
    <Card className={cn(cardPaddingClass, className)}>
      <CardBody>
        <SectionHeader title={title} icon={titleIcon} titleSize="card" />
        <ul className="m-0 list-none space-y-4 p-0">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id} className="flex gap-3">
                <div
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-nav',
                    item.iconClassName ?? 'bg-primary-50 text-primary',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <Paragraph variant="emphasis">{item.title}</Paragraph>
                  {item.description && (
                    <Paragraph variant="caption" className="mt-0.5">
                      {item.description}
                    </Paragraph>
                  )}
                  <Paragraph variant="caption" className="mt-1 text-[10px]">
                    {item.time}
                  </Paragraph>
                </div>
              </li>
            )
          })}
        </ul>
      </CardBody>
    </Card>
  )
}
