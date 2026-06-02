import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Header2, Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

type SectionHeaderProps = {
  title: string
  subtitle?: string
  titleSize?: 'section' | 'card'
  titleClassName?: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  titleSize = 'section',
  titleClassName,
  icon: Icon,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="flex min-w-0 items-start gap-2">
        {Icon && <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />}
        <div className="min-w-0">
          <Header2 size={titleSize} className={titleClassName}>
            {title}
          </Header2>
          {subtitle && (
            <Paragraph variant="caption" className="mt-0.5">
              {subtitle}
            </Paragraph>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}
