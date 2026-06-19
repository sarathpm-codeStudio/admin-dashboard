import { useState } from 'react'
import { SummaryStatsGrid } from '@/components/ui/SummaryStatsGrid'
import { FinancialManagementHeader } from '@/features/financial/components/FinancialManagementHeader'
import { FinancialPayoutsTable } from '@/features/financial/components/FinancialPayoutsTable'
import { FinancialTabs, type FinancialTab } from '@/features/financial/components/FinancialTabs'
import { FinancialTransactionsTable } from '@/features/financial/components/FinancialTransactionsTable'
import { financialStatItems } from '@/features/financial/data/financialStatItems'

export function FinancialManagementView() {
  const [tab, setTab] = useState<FinancialTab>('transactions')

  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto">
      <FinancialManagementHeader />

      <SummaryStatsGrid
        items={financialStatItems}
        columns={3}
        skeletonCount={3}
        skeletonProps={{ layout: 'inline' }}
        className="gap-6"
      />

      <div className="space-y-6">
        <FinancialTabs value={tab} onChange={setTab} />
        {tab === 'transactions' ? <FinancialTransactionsTable /> : <FinancialPayoutsTable />}
      </div>
    </div>
  )
}
