import type { ReactNode } from 'react'
import { Header2, Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

type SectionHeaderProps = {
  title: string
  subtitle?: string
  action?: ReactNode
  /** Match compact card titles (e.g. Pending Actions) */
  titleSize?: 'section' | 'card'
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  action,
  titleSize = 'section',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div>
        <Header2 size={titleSize}>{title}</Header2>
        {subtitle && (
          <Paragraph variant="caption" className="mt-0.5">
            {subtitle}
          </Paragraph>
        )}
      </div>
      {action}
    </div>
  )
}
