import type { LucideIcon } from 'lucide-react'
import { Card, CardBody, cardPaddingClass } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { cn } from '@/utils/cn'
import { imageMaskStyle } from '@/utils/imageMaskStyle'

const activityIconBoxClass =
  'flex size-10 shrink-0 items-center justify-center rounded-lg'

export type ActivityListItemData = {
  id: string
  title: string
  description?: string
  time: string
  /** Lucide icon — omit when using `imageSrc` */
  icon?: LucideIcon
  /** Custom image in the activity icon slot (import or URL) */
  imageSrc?: string
  imageAlt?: string
  /** Exact icon fill (from Figma Inspect). Overrides `imageMaskClassName` color. */
  imageMaskColor?: string
  /** Tailwind background class when `imageMaskColor` is not set */
  imageMaskClassName?: string
  /** Masked image dimensions (default `size-10`) */
  imageSizeClassName?: string
  iconClassName?: string
}

type ActivityListProps = {
  title: string
  titleIcon?: LucideIcon
  items: ActivityListItemData[]
  /** Scroll the list when content exceeds max height */
  scrollable?: boolean
  listMaxHeightClassName?: string
  className?: string
}

function ActivityListVisual({ item }: { item: ActivityListItemData }) {
  const boxClass = cn(
    activityIconBoxClass,
    item.iconClassName ?? 'bg-primary-50 text-primary',
  )

  if (item.imageSrc) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center',
          item.iconClassName,
        )}
        role="img"
        aria-label={item.imageAlt ?? ''}
      >
        <div
          className={cn(
            'shrink-0',
            item.imageSizeClassName ?? 'size-10',
            !item.imageMaskColor && (item.imageMaskClassName ?? 'bg-teal-600'),
          )}
          style={{
            ...imageMaskStyle(item.imageSrc),
            ...(item.imageMaskColor ? { backgroundColor: item.imageMaskColor } : {}),
          }}
          aria-hidden
        />
      </div>
    )
  }

  if (!item.icon) {
    return null
  }

  const Icon = item.icon
  return (
    <div className={boxClass}>
      <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
    </div>
  )
}

export function ActivityList({
  title,
  titleIcon,
  items,
  scrollable = false,
  listMaxHeightClassName = 'max-h-[17rem]',
  className,
}: ActivityListProps) {
  return (
    <Card className={cn(cardPaddingClass, className)}>
      <CardBody className="gap-5">
        <SectionHeader
          title={title}
          icon={titleIcon}
          titleSize="card"
          className="items-center"
        />
        <ul
          className={cn(
            'm-0 list-none space-y-5 p-0',
            scrollable &&
              cn(
                listMaxHeightClassName,
                'scrollbar-none overflow-y-auto overscroll-contain',
              ),
          )}
        >
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <ActivityListVisual item={item} />
              <div className="min-w-0 flex-1 space-y-0.5 pt-0.5">
                <p className="text-sm font-semibold leading-snug text-ink-heading">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-sm leading-snug text-nav">{item.description}</p>
                )}
                <p className="text-xs leading-snug text-slate-400">{item.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}
