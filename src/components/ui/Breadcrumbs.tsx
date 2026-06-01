import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export type BreadcrumbItem = {
  label: string
  to?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex flex-wrap items-center gap-1 text-sm', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="size-4 shrink-0 text-nav" aria-hidden />
            )}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="font-medium text-nav transition-colors hover:text-ink-heading"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'font-medium',
                  isLast ? 'text-ink-heading' : 'text-nav',
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
