import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Header1, Paragraph } from '@/components/ui/Typography'
import { Skeleton } from '@/components/ui/Skeleton'
import { AddSettingModal } from '@/features/platform-settings/components/AddSettingModal'
import { CommissionSettingsSection } from '@/features/platform-settings/components/CommissionSettingsSection'
import { PlatformSettingsTabs } from '@/features/platform-settings/components/PlatformSettingsTabs'
import { SettingsGroupPanel } from '@/features/platform-settings/components/SettingsGroupPanel'
import {
  useCreatePlatformSetting,
  useListPlatformSettings,
} from '@/features/platform-settings/hooks/usePlatformSettings'
import type { PlatformSetting } from '@/api/platformSettings/platformSettings.api'
import { useToast } from '@/hooks/useToast'

const COMMISSION_GROUP = 'Commission'

type SettingsTab = { group: string; settings: PlatformSetting[]; minSort: number }

/** Bucket settings by group, ordered by their DB sort order for the tab bar. */
function buildSettingsTabs(settings: PlatformSetting[]): SettingsTab[] {
  const byGroup = new Map<string, PlatformSetting[]>()
  for (const setting of settings) {
    const bucket = byGroup.get(setting.group)
    if (bucket) bucket.push(setting)
    else byGroup.set(setting.group, [setting])
  }

  return [...byGroup.entries()]
    .map(([group, groupSettings]) => ({
      group,
      settings: groupSettings,
      minSort: Math.min(...groupSettings.map((s) => s.sortOrder)),
    }))
    .sort((a, b) => a.minSort - b.minSort || a.group.localeCompare(b.group))
}

export function PlatformSettingsView() {
  const toast = useToast()
  const { data: settings, isLoading, isError } = useListPlatformSettings()
  const createSetting = useCreatePlatformSetting()
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const tabs = useMemo(() => (settings ? buildSettingsTabs(settings) : []), [settings])
  const activeTab = tabs.find((tab) => tab.group === activeGroup) ?? tabs[0]
  const groupNames = tabs.map((tab) => tab.group)

  if (isError) {
    return (
      <Paragraph variant="muted" className="py-10 text-center">
        Could not load platform settings.
      </Paragraph>
    )
  }

  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden pb-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Header1>Platform settings</Header1>
            <Paragraph variant="muted" className="mt-1 max-w-2xl">
              Manage platform-wide defaults. Each tab is a settings group — add a setting to an
              existing group or create a new group right here.
            </Paragraph>
          </div>
          <Button type="button" variant="primary" onClick={() => setIsAddOpen(true)}>
            <Plus className="size-4" aria-hidden />
            Add setting
          </Button>
        </div>

        {tabs.length > 0 && activeTab ? (
          <PlatformSettingsTabs
            tabs={groupNames}
            activeTab={activeTab.group}
            onChange={setActiveGroup}
          />
        ) : null}
      </div>

      {isLoading || !settings ? (
        <Skeleton className="h-64 w-full rounded-card" />
      ) : !activeTab ? (
        <Paragraph variant="muted" className="py-10 text-center">
          No settings yet. Use “Add setting” to create your first one.
        </Paragraph>
      ) : activeTab.group === COMMISSION_GROUP ? (
        <CommissionSettingsSection />
      ) : (
        <SettingsGroupPanel group={activeTab.group} settings={activeTab.settings} />
      )}

      <AddSettingModal
        open={isAddOpen}
        existingGroups={groupNames}
        defaultGroup={activeTab?.group}
        isSaving={createSetting.isPending}
        onClose={() => setIsAddOpen(false)}
        onCreate={async (input) => {
          await createSetting.mutateAsync(input)
          setActiveGroup(input.group)
          setIsAddOpen(false)
          toast.success(`Added "${input.label}"`)
        }}
      />
    </div>
  )
}
