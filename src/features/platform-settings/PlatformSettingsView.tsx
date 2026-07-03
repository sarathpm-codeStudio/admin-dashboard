import { useState } from 'react'
import { Header1, Paragraph } from '@/components/ui/Typography'
import { CoinSettingsSection } from '@/features/platform-settings/components/CoinSettingsSection'
import { CommissionSettingsSection } from '@/features/platform-settings/components/CommissionSettingsSection'
import {
  PlatformSettingsTabs,
  type PlatformSettingsTab,
} from '@/features/platform-settings/components/PlatformSettingsTabs'
import { useGetPlatformSettings } from '@/features/platform-settings/hooks/usePlatformSettings'

export function PlatformSettingsView() {
  const [activeTab, setActiveTab] = useState<PlatformSettingsTab>('coin')
  const { isError } = useGetPlatformSettings()

  if (isError) {
    return (
      <Paragraph variant="muted" className="py-10 text-center">
        Could not load platform settings.
      </Paragraph>
    )
  }

  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto pb-8">
      <div className="space-y-3">
        <div>
          <Header1>Settings</Header1>
          <Paragraph variant="muted" className="mt-1">
            Manage platform-wide defaults for coins and faculty commission.
          </Paragraph>
        </div>

        <PlatformSettingsTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === 'coin' ? <CoinSettingsSection /> : <CommissionSettingsSection />}
    </div>
  )
}
