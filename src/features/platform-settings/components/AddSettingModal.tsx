import { useEffect, useMemo, useState } from 'react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Input } from '@/components/ui/Input'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'
import {
  isValidSettingKey,
  type CreateSettingInput,
} from '@/api/platformSettings/platformSettings.api'

const NEW_GROUP = '__new__'

type AddSettingModalProps = {
  open: boolean
  existingGroups: string[]
  defaultGroup?: string
  isSaving: boolean
  onClose: () => void
  onCreate: (input: CreateSettingInput) => void | Promise<void>
}

type Draft = {
  groupChoice: string
  newGroup: string
  key: string
  label: string
  value: string
  unit: string
  description: string
}

const emptyDraft = (defaultGroup?: string): Draft => ({
  groupChoice: defaultGroup ?? NEW_GROUP,
  newGroup: '',
  key: '',
  label: '',
  value: '',
  unit: '',
  description: '',
})

const fieldLabel = 'block text-sm font-medium text-ink-heading'
const selectClass =
  'w-full rounded-card border-0 bg-surface-input px-4 py-2.5 text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-50'

export function AddSettingModal({
  open,
  existingGroups,
  defaultGroup,
  isSaving,
  onClose,
  onCreate,
}: AddSettingModalProps) {
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(defaultGroup))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDraft(emptyDraft(defaultGroup))
      setError(null)
    }
  }, [open, defaultGroup])

  const resolvedGroup =
    draft.groupChoice === NEW_GROUP ? draft.newGroup.trim() : draft.groupChoice

  const keyValid = draft.key.trim() === '' ? false : isValidSettingKey(draft.key.trim())

  const isValid = useMemo(
    () =>
      keyValid &&
      draft.value.trim() !== '' &&
      resolvedGroup !== '' &&
      draft.label.trim() !== '',
    [keyValid, draft.value, draft.label, resolvedGroup],
  )

  const update = (patch: Partial<Draft>) => setDraft((prev) => ({ ...prev, ...patch }))

  const handleConfirm = async () => {
    if (!isValid) return
    setError(null)
    try {
      await onCreate({
        key: draft.key.trim(),
        value: draft.value.trim(),
        label: draft.label.trim(),
        group: resolvedGroup,
        unit: draft.unit.trim() || undefined,
        description: draft.description.trim() || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create setting')
    }
  }

  return (
    <ConfirmModal
      open={open}
      onClose={() => !isSaving && onClose()}
      onConfirm={() => void handleConfirm()}
      title="Add setting"
      message="Create a new platform setting. Pick an existing group or create a new one — new groups become their own tab."
      confirmLabel={isSaving ? 'Creating…' : 'Create setting'}
      cancelLabel="Cancel"
      isLoading={isSaving}
      confirmDisabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="new-setting-group" className={fieldLabel}>
            Group
          </label>
          <select
            id="new-setting-group"
            className={selectClass}
            value={draft.groupChoice}
            disabled={isSaving}
            onChange={(e) => update({ groupChoice: e.target.value })}
          >
            {existingGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
            <option value={NEW_GROUP}>+ Create new group…</option>
          </select>
          {draft.groupChoice === NEW_GROUP ? (
            <Input
              aria-label="New group name"
              placeholder="New group name (e.g. Notifications)"
              value={draft.newGroup}
              disabled={isSaving}
              onChange={(e) => update({ newGroup: e.target.value })}
              className="mt-2"
            />
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="new-setting-label" className={fieldLabel}>
              Label
            </label>
            <Input
              id="new-setting-label"
              placeholder="Welcome bonus"
              value={draft.label}
              disabled={isSaving}
              onChange={(e) => update({ label: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="new-setting-key" className={fieldLabel}>
              Key
            </label>
            <Input
              id="new-setting-key"
              placeholder="welcome_bonus_coin"
              value={draft.key}
              disabled={isSaving}
              onChange={(e) => update({ key: e.target.value })}
              className={cn(
                draft.key.trim() !== '' && !keyValid && 'ring-2 ring-red-200',
              )}
            />
          </div>
        </div>
        {draft.key.trim() !== '' && !keyValid ? (
          <Paragraph variant="caption" className="-mt-2 text-red-600">
            Use lowercase letters, numbers and underscores (e.g. welcome_bonus_coin).
          </Paragraph>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="new-setting-value" className={fieldLabel}>
              Value
            </label>
            <Input
              id="new-setting-value"
              placeholder="100"
              value={draft.value}
              disabled={isSaving}
              onChange={(e) => update({ value: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="new-setting-unit" className={fieldLabel}>
              Unit <span className="font-normal text-nav">(optional)</span>
            </label>
            <Input
              id="new-setting-unit"
              placeholder="coins"
              value={draft.unit}
              disabled={isSaving}
              onChange={(e) => update({ unit: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="new-setting-description" className={fieldLabel}>
            Description <span className="font-normal text-nav">(optional)</span>
          </label>
          <Input
            id="new-setting-description"
            placeholder="Coins granted to a student on sign-up."
            value={draft.description}
            disabled={isSaving}
            onChange={(e) => update({ description: e.target.value })}
          />
        </div>

        {error ? (
          <Paragraph className="rounded-card border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </Paragraph>
        ) : null}
      </div>
    </ConfirmModal>
  )
}
