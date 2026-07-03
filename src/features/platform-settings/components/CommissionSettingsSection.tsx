import { Percent } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  DefaultSettingField,
  SettingsSectionCard,
} from '@/features/platform-settings/components/DefaultSettingField'
import { CommissionFacultiesTable } from '@/features/platform-settings/components/CommissionFacultiesTable'
import {
  useGetPlatformSettings,
  useUpdatePlatformSetting,
} from '@/features/platform-settings/hooks/usePlatformSettings'
import {
  PLATFORM_SETTING_DEFAULTS,
  PLATFORM_SETTING_KEYS,
} from '@/api/platformSettings/platformSettings.api'
import { useToast } from '@/hooks/useToast'
import { Skeleton } from '@/components/ui/Skeleton'

export function CommissionSettingsSection() {
  const toast = useToast()
  const { data: settings, isLoading } = useGetPlatformSettings()
  const updateSetting = useUpdatePlatformSetting()
  const [commissionValue, setCommissionValue] = useState('')

  useEffect(() => {
    if (!settings) return
    setCommissionValue(settings[PLATFORM_SETTING_KEYS.defaultCommissionPercent])
  }, [settings])

  const handleSave = async (nextValue: string) => {
    setCommissionValue(nextValue)
    await updateSetting.mutateAsync({
      key: PLATFORM_SETTING_KEYS.defaultCommissionPercent,
      value: nextValue,
    })
    toast.success('Default commission updated')
  }

  if (isLoading) {
    return (
      <SettingsSectionCard>
        <Skeleton className="h-40 w-full rounded-card" />
      </SettingsSectionCard>
    )
  }

  return (
    <SettingsSectionCard>
      <DefaultSettingField
        icon={Percent}
        title="Default commission"
        titleClassName="text-lg"
        descriptionClassName="text-sm"
        description="Platform commission percentage applied to faculty enrollment revenue."
        inputLabel="Default value"
        inputSuffix="%"
        value={commissionValue}
        placeholder={
          PLATFORM_SETTING_DEFAULTS[PLATFORM_SETTING_KEYS.defaultCommissionPercent]
        }
        isSaving={
          updateSetting.isPending &&
          updateSetting.variables?.key === PLATFORM_SETTING_KEYS.defaultCommissionPercent
        }
        onSave={async (nextValue) => {
          try {
            await handleSave(nextValue)
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : 'Could not save commission setting',
            )
            throw error
          }
        }}
      />
      <CommissionFacultiesTable />
    </SettingsSectionCard>
  )
}
