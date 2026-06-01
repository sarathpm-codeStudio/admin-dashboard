import { CircleAlert } from 'lucide-react'
import { AlertBox } from '@/components/ui/AlertBox'
import { Card, CardBody, cardPaddingClass } from '@/components/ui/Card'
import { Header2 } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'
import type { SystemAlert } from '@/features/dashboard/data/mockData'

type SystemAlertsProps = { alerts: SystemAlert[]; className?: string }

export function SystemAlerts({ alerts, className }: SystemAlertsProps) {
  return (
    <Card className={cn('w-full', cardPaddingClass, className)}>
      <CardBody>
        <div className="flex items-center gap-2">
          <CircleAlert className="size-4 shrink-0 text-[#ba1a1a]" aria-hidden />
          <Header2 size="card">System Alerts</Header2>
        </div>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <AlertBox key={alert.id} title={alert.title} detail={alert.detail} variant={alert.variant} />
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
