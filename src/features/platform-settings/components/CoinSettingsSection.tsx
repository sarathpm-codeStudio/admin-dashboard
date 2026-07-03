import { Coins, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Paragraph } from '@/components/ui/Typography'
import { SettingsSectionCard } from '@/features/platform-settings/components/DefaultSettingField'
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

type CoinSettingsDraft = {
  coinValue: string
  enrollmentCoinCount: string
  streakDays: string
  streakCoinCount: string
}

const COIN_FIELDS = [
  {
    id: 'coin-value',
    draftKey: 'coinValue' as const,
    settingKey: PLATFORM_SETTING_KEYS.defaultCoinValue,
    label: 'Coin value',
    placeholder: PLATFORM_SETTING_DEFAULTS[PLATFORM_SETTING_KEYS.defaultCoinValue],
  },
  {
    id: 'enrollment-coin-count',
    draftKey: 'enrollmentCoinCount' as const,
    settingKey: PLATFORM_SETTING_KEYS.defaultEnrollmentCoinCount,
    label: 'Enrollment coin count',
    placeholder: PLATFORM_SETTING_DEFAULTS[PLATFORM_SETTING_KEYS.defaultEnrollmentCoinCount],
  },
  {
    id: 'streak-days',
    draftKey: 'streakDays' as const,
    settingKey: PLATFORM_SETTING_KEYS.defaultStreakDays,
    label: 'Streak days',
    placeholder: PLATFORM_SETTING_DEFAULTS[PLATFORM_SETTING_KEYS.defaultStreakDays],
  },
  {
    id: 'streak-coin-count',
    draftKey: 'streakCoinCount' as const,
    settingKey: PLATFORM_SETTING_KEYS.defaultStreakCoinCount,
    label: 'Streak coin count',
    placeholder: PLATFORM_SETTING_DEFAULTS[PLATFORM_SETTING_KEYS.defaultStreakCoinCount],
  },
] as const

function valuesFromSettings(
  settings: Record<string, string> | undefined,
): CoinSettingsDraft {
  return {
    coinValue:
      settings?.[PLATFORM_SETTING_KEYS.defaultCoinValue] ??
      PLATFORM_SETTING_DEFAULTS[PLATFORM_SETTING_KEYS.defaultCoinValue],
    enrollmentCoinCount:
      settings?.[PLATFORM_SETTING_KEYS.defaultEnrollmentCoinCount] ??
      PLATFORM_SETTING_DEFAULTS[PLATFORM_SETTING_KEYS.defaultEnrollmentCoinCount],
    streakDays:
      settings?.[PLATFORM_SETTING_KEYS.defaultStreakDays] ??
      PLATFORM_SETTING_DEFAULTS[PLATFORM_SETTING_KEYS.defaultStreakDays],
    streakCoinCount:
      settings?.[PLATFORM_SETTING_KEYS.defaultStreakCoinCount] ??
      PLATFORM_SETTING_DEFAULTS[PLATFORM_SETTING_KEYS.defaultStreakCoinCount],
  }
}

function isDraftValid(draft: CoinSettingsDraft): boolean {
  return Object.values(draft).every((value) => {
    if (!value.trim()) return false
    const num = Number(value)
    return Number.isFinite(num) && num >= 0
  })
}

export function CoinSettingsSection() {
  const toast = useToast()
  const { data: settings, isLoading } = useGetPlatformSettings()
  const updateSetting = useUpdatePlatformSetting()
  const [isEditing, setIsEditing] = useState(false)
  const [values, setValues] = useState<CoinSettingsDraft>(() => valuesFromSettings(undefined))
  const [draft, setDraft] = useState<CoinSettingsDraft>(() => valuesFromSettings(undefined))

  useEffect(() => {
    if (!settings) return
    const next = valuesFromSettings(settings)
    setValues(next)
    if (!isEditing) setDraft(next)
  }, [settings, isEditing])

  const handleEdit = () => {
    setDraft(values)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraft(values)
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!isDraftValid(draft)) return

    try {
      await Promise.all(
        COIN_FIELDS.map((field) =>
          updateSetting.mutateAsync({
            key: field.settingKey,
            value: draft[field.draftKey].trim(),
          }),
        ),
      )
      setValues(draft)
      setIsEditing(false)
      toast.success('Coin settings updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save coin settings')
      throw error
    }
  }

  if (isLoading) {
    return (
      <SettingsSectionCard>
        <Skeleton className="h-40 w-full rounded-card" />
      </SettingsSectionCard>
    )
  }

  const display = isEditing ? draft : values

  return (
    <SettingsSectionCard>
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-nav bg-primary-50 text-primary">
            <Coins className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <Paragraph variant="emphasis" className="text-lg text-ink-heading">
              Default coin settings
            </Paragraph>
            <Paragraph variant="caption" className="mt-1 text-sm">
              Platform settings for enrollment rewards and streak bonuses.
            </Paragraph>
          </div>
        </div>

        <div className="max-w-md space-y-4">
          {COIN_FIELDS.map((field) => (
            <div key={field.id} className="space-y-2">
              <label htmlFor={field.id} className="text-sm font-medium text-ink-heading">
                {field.label}
              </label>
              <Input
                id={field.id}
                type="number"
                min={0}
                step="1"
                value={display[field.draftKey]}
                placeholder={field.placeholder}
                disabled={!isEditing || updateSetting.isPending}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, [field.draftKey]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <Button type="button" variant="outline-primary" onClick={handleEdit}>
              <Pencil className="size-4" aria-hidden />
              Edit
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="primary"
                disabled={updateSetting.isPending || !isDraftValid(draft)}
                onClick={() => void handleSave()}
              >
                {updateSetting.isPending ? 'Saving…' : 'Save changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={updateSetting.isPending}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </SettingsSectionCard>
  )
}
