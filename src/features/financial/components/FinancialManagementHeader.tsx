import { Download, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Header1, Paragraph } from '@/components/ui/Typography'

export function FinancialManagementHeader() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <Header1>Financial Management</Header1>
        <Paragraph variant="muted" className="mt-1">
          Track revenue, manage commissions, and process payouts.
        </Paragraph>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" className="shrink-0">
          <Download className="size-4" aria-hidden />
          Export Reports
        </Button>
        <Button className="shrink-0">
          <Wallet className="size-4" aria-hidden />
          Process Payouts
        </Button>
      </div>
    </div>
  )
}
