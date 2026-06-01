import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { Header1, Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

export type SummaryStatCardProps = {
  label: string
  value: string
  footer?: ReactNode
  icon?: LucideIcon
  iconClassName?: string
  labelClassName?: string
  valueClassName?: string
  className?: string
}

export function SummaryStatCard({
  label,
  value,
  footer,
  icon: Icon,
  iconClassName,
  labelClassName,
  valueClassName,
  className,
}: SummaryStatCardProps) {
  if (Icon) {
    return (
      <Card className={cn('flex items-start gap-4 p-5', className)}>
        <div
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-card',
            iconClassName,
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <Paragraph
            variant="label"
            className={cn('uppercase tracking-wide', labelClassName)}
          >
            {label}
          </Paragraph>
          <Header1 className={cn('mt-1 text-3xl tracking-tight', valueClassName)}>
            {value}
          </Header1>
          {footer && <div className="mt-2">{footer}</div>}
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-5', className)}>
      <Paragraph variant="label" className={cn('uppercase tracking-wide', labelClassName)}>
        {label}
      </Paragraph>
      <Header1 className={cn('mt-2 text-3xl', valueClassName)}>{value}</Header1>
      {footer && <div className="mt-2">{footer}</div>}
    </Card>
  )
}
