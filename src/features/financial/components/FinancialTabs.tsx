import { cn } from '@/utils/cn'

export type FinancialTab = 'transactions' | 'payouts'

const tabs: { value: FinancialTab; label: string }[] = [
  { value: 'transactions', label: 'Transactions' },
  { value: 'payouts', label: 'Payouts' },
]

type FinancialTabsProps = {
  value: FinancialTab
  onChange: (value: FinancialTab) => void
}

export function FinancialTabs({ value, onChange }: FinancialTabsProps) {
  return (
    <div role="tablist" aria-label="Financial views" className="flex items-center gap-6 border-b border-[#e2e8f0]">
      {tabs.map((tab) => {
        const isActive = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              '-mb-px border-b-2 px-1 pb-3 text-sm font-semibold outline-none transition-colors',
              'focus-visible:text-primary-50',
              isActive
                ? 'border-primary-50 text-[#1E1B4B]'
                : 'border-transparent text-[#64748B] hover:text-ink-heading',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
