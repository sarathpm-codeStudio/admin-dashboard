import { getGroupUi } from '@/features/platform-settings/components/groupConfig'
import { cn } from '@/utils/cn'

type PlatformSettingsTabsProps = {
  tabs: string[]
  activeTab: string
  onChange: (group: string) => void
}

export function PlatformSettingsTabs({ tabs, activeTab, onChange }: PlatformSettingsTabsProps) {
  return (
    <div
      role="tablist"
      className="inline-flex flex-wrap items-center gap-1 rounded-nav border border-[#e2e8f0]/70 bg-surface-input p-1"
    >
      {tabs.map((group) => {
        const isActive = group === activeTab
        const { icon: Icon } = getGroupUi(group)
        return (
          <button
            key={group}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(group)}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors',
              isActive
                ? 'bg-white text-primary shadow-sm ring-1 ring-inset ring-[#e2e8f0]'
                : 'text-nav hover:text-primary',
            )}
          >
            <Icon className="size-4" aria-hidden />
            {group}
          </button>
        )
      })}
    </div>
  )
}
