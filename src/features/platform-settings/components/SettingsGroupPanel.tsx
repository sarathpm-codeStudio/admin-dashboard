import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  EditButton,
  SettingField,
  SettingsFooter,
  SettingsGroup,
  SettingsPanelHeader,
  SettingsSectionCard,
} from '@/features/platform-settings/components/SettingsPrimitives'
import { getGroupUi } from '@/features/platform-settings/components/groupConfig'
import {
  useDeletePlatformSetting,
  useUpdatePlatformSetting,
} from '@/features/platform-settings/hooks/usePlatformSettings'
import type { PlatformSetting } from '@/api/platformSettings/platformSettings.api'
import { useToast } from '@/hooks/useToast'

type Draft = Record<string, string>

type SettingsGroupPanelProps = {
  /** Group name — used as the panel title and to pick the icon/description. */
  group: string
  /** Settings that belong to this group, already ordered. */
  settings: PlatformSetting[]
}

function draftFromSettings(settings: PlatformSetting[]): Draft {
  const draft: Draft = {}
  for (const setting of settings) draft[setting.key] = setting.value
  return draft
}

function isDraftValid(draft: Draft): boolean {
  return Object.values(draft).every((value) => {
    const trimmed = value.trim()
    if (!trimmed) return false
    const num = Number(trimmed)
    // Non-numeric settings are allowed; numeric ones must not be negative.
    return Number.isNaN(num) ? true : num >= 0
  })
}

export function SettingsGroupPanel({ group, settings }: SettingsGroupPanelProps) {
  const toast = useToast()
  const updateSetting = useUpdatePlatformSetting()
  const deleteSetting = useDeletePlatformSetting()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => draftFromSettings(settings))
  const [pendingDelete, setPendingDelete] = useState<PlatformSetting | null>(null)
  const ui = getGroupUi(group)

  useEffect(() => {
    if (!isEditing) setDraft(draftFromSettings(settings))
  }, [settings, isEditing])

  const handleEdit = () => {
    setDraft(draftFromSettings(settings))
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraft(draftFromSettings(settings))
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!isDraftValid(draft)) return
    try {
      await Promise.all(
        settings
          .filter((setting) => draft[setting.key]!.trim() !== setting.value)
          .map((setting) =>
            updateSetting.mutateAsync({ key: setting.key, value: draft[setting.key]!.trim() }),
          ),
      )
      setIsEditing(false)
      toast.success('Settings updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save settings')
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    try {
      await deleteSetting.mutateAsync(pendingDelete.key)
      toast.success(`Removed "${pendingDelete.label}"`)
      setPendingDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete setting')
    }
  }

  return (
    <SettingsSectionCard>
      <SettingsPanelHeader
        icon={ui.icon}
        title={group}
        description={ui.description}
        action={!isEditing ? <EditButton onClick={handleEdit} /> : undefined}
      />

      <div className="p-5">
        <SettingsGroup>
          {settings.map((setting) => (
            <SettingField
              key={setting.key}
              id={`setting-${setting.key}`}
              label={setting.label}
              description={setting.description}
              unit={setting.unit}
              isEditing={isEditing}
              value={isEditing ? (draft[setting.key] ?? '') : setting.value}
              type="text"
              inputMode="decimal"
              disabled={updateSetting.isPending}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, [setting.key]: e.target.value }))
              }
              action={
                isEditing ? (
                  <button
                    type="button"
                    aria-label={`Remove ${setting.label}`}
                    onClick={() => setPendingDelete(setting)}
                    className="inline-flex items-center gap-1 rounded-nav px-1.5 py-1 text-xs font-medium text-nav transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    Remove
                  </button>
                ) : undefined
              }
            />
          ))}
        </SettingsGroup>
      </div>

      {isEditing ? (
        <SettingsFooter
          isSaving={updateSetting.isPending}
          canSave={isDraftValid(draft)}
          onSave={() => void handleSave()}
          onCancel={handleCancel}
        />
      ) : null}

      <ConfirmModal
        open={Boolean(pendingDelete)}
        onClose={() => !deleteSetting.isPending && setPendingDelete(null)}
        onConfirm={() => void handleDelete()}
        title="Delete setting"
        message={
          pendingDelete
            ? `Remove "${pendingDelete.label}" (${pendingDelete.key})? This deletes it from the platform.`
            : ''
        }
        confirmLabel={deleteSetting.isPending ? 'Deleting…' : 'Delete'}
        confirmVariant="outline-danger"
        isLoading={deleteSetting.isPending}
      />
    </SettingsSectionCard>
  )
}
