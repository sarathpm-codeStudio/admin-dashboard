import { cn } from '@/utils/cn'

export type PlatformSettingsTab = 'coin' | 'commission'

type PlatformSettingsTabsProps = {
  activeTab: PlatformSettingsTab
  onChange: (tab: PlatformSettingsTab) => void
}

const tabs: { key: PlatformSettingsTab; label: string }[] = [
  { key: 'coin', label: 'Coin' },
  { key: 'commission', label: 'Commission' },
]

export function PlatformSettingsTabs({ activeTab, onChange }: PlatformSettingsTabsProps) {
  return (
    <div className="flex items-center gap-1 rounded-nav bg-surface-input p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
            activeTab === tab.key
              ? 'bg-white text-primary shadow-sm'
              : 'text-nav hover:text-primary',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
