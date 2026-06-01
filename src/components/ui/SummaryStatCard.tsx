import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { Header1, Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

type SummaryStatCardProps = {
  label: string
  value: string
  footer?: ReactNode
  labelClassName?: string
  valueClassName?: string
  className?: string
}

export function SummaryStatCard({
  label,
  value,
  footer,
  labelClassName,
  valueClassName,
  className,
}: SummaryStatCardProps) {
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
