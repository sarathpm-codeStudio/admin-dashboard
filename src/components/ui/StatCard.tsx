import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Header1, Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

type StatCardProps = {
  label: string
  value: string
  icon: LucideIcon
  iconClassName?: string
}

export function StatCard({ label, value, icon: Icon, iconClassName }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-card',
          iconClassName,
        )}
      >
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <Paragraph variant="label">{label}</Paragraph>
        <Header1 className="tracking-tight">{value}</Header1>
      </div>
    </Card>
  )
}
