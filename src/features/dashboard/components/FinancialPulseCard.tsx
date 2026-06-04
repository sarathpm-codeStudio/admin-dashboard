import { Card, CardBody, cardPaddingClass } from '@/components/ui/Card'
import { Header2 } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'
import { financialPulse } from '@/features/dashboard/data/mockData'

type FinancialPulseCardProps = { className?: string }

const rows = [
  { label: 'Today', value: financialPulse.today },
  { label: 'Current Month', value: financialPulse.currentMonth },
  { label: 'Payouts for this month', value: financialPulse.payouts },
] as const

export function FinancialPulseCard({ className }: FinancialPulseCardProps) {
  return (
    <Card className={cn('w-full border-0 bg-primary-gradient text-white', cardPaddingClass, className)}>
      <CardBody>
        <Header2 size="card" className="text-white">
          Financial Pulse
        </Header2>
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 py-1.5"
            >
              <span className="shrink-0 text-xs text-white/80">{row.label}</span>
              <span className="text-sm font-bold">{row.value}</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
