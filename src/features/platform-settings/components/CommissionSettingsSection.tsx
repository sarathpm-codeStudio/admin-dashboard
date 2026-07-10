import { Percent } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  EditButton,
  SettingField,
  SettingsFooter,
  SettingsGroup,
  SettingsPanelHeader,
  SettingsSectionCard,
} from '@/features/platform-settings/components/SettingsPrimitives'
import { CommissionFacultiesTable } from '@/features/platform-settings/components/CommissionFacultiesTable'
import {
  useGetPlatformSettings,
  useUpdatePlatformSetting,
} from '@/features/platform-settings/hooks/usePlatformSettings'
import {
  getSettingMeta,
  PLATFORM_SETTING_DEFAULTS,
  PLATFORM_SETTING_KEYS,
} from '@/api/platformSettings/platformSettings.api'
import { useToast } from '@/hooks/useToast'
import { Skeleton } from '@/components/ui/Skeleton'

const COMMISSION_META = getSettingMeta(PLATFORM_SETTING_KEYS.defaultCommissionPercent)
const DEFAULT_COMMISSION_PLACEHOLDER =
  PLATFORM_SETTING_DEFAULTS[PLATFORM_SETTING_KEYS.defaultCommissionPercent] ?? '20'

export function CommissionSettingsSection() {
  const toast = useToast()
  const { data: settings, isLoading } = useGetPlatformSettings()
  const updateSetting = useUpdatePlatformSetting()
  const [value, setValue] = useState('')
  const [draft, setDraft] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!settings) return
    const next =
      settings[PLATFORM_SETTING_KEYS.defaultCommissionPercent] ??
      DEFAULT_COMMISSION_PLACEHOLDER
    setValue(next)
    if (!isEditing) setDraft(next)
  }, [settings, isEditing])

  const isSaving =
    updateSetting.isPending &&
    updateSetting.variables?.key === PLATFORM_SETTING_KEYS.defaultCommissionPercent

  const handleEdit = () => {
    setDraft(value)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraft(value)
    setIsEditing(false)
  }

  const handleSave = async () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    try {
      await updateSetting.mutateAsync({
        key: PLATFORM_SETTING_KEYS.defaultCommissionPercent,
        value: trimmed,
      })
      setValue(trimmed)
      setIsEditing(false)
      toast.success('Default commission updated')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not save commission setting',
      )
    }
  }

  if (isLoading) {
    return (
      <SettingsSectionCard>
        <div className="p-5">
          <Skeleton className="h-40 w-full rounded-card" />
        </div>
      </SettingsSectionCard>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsSectionCard>
        <SettingsPanelHeader
          icon={Percent}
          title="Default commission"
          description="Platform commission applied to faculty enrollment revenue when no override is set."
          action={!isEditing ? <EditButton onClick={handleEdit} /> : undefined}
        />

        <div className="p-5">
          <SettingsGroup>
            <SettingField
              id="default-commission"
              label={COMMISSION_META.label}
              description={COMMISSION_META.description}
              unit={COMMISSION_META.unit}
              isEditing={isEditing}
              value={isEditing ? draft : value}
              placeholder={DEFAULT_COMMISSION_PLACEHOLDER}
              type="number"
              min={0}
              max={100}
              step="any"
              disabled={isSaving}
              onChange={(e) => setDraft(e.target.value)}
            />
          </SettingsGroup>
        </div>

        {isEditing ? (
          <SettingsFooter
            isSaving={isSaving}
            canSave={Boolean(draft.trim())}
            onSave={() => void handleSave()}
            onCancel={handleCancel}
          />
        ) : null}
      </SettingsSectionCard>

      <SettingsSectionCard>
        <CommissionFacultiesTable />
      </SettingsSectionCard>
    </div>
  )
}
