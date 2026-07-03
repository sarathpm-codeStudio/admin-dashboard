import { useEffect, useState } from 'react'
import type { CommissionFacultyRow } from '@/api/platformSettings/platformSettings.api'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Input } from '@/components/ui/Input'
import { Paragraph } from '@/components/ui/Typography'

type FacultyCommissionEditModalProps = {
  faculty: CommissionFacultyRow | null
  defaultCommissionPercent: number
  isSaving: boolean
  onClose: () => void
  onSave: (commissionPercent: number) => void | Promise<void>
  onResetToDefault: () => void | Promise<void>
}

export function FacultyCommissionEditModal({
  faculty,
  defaultCommissionPercent,
  isSaving,
  onClose,
  onSave,
  onResetToDefault,
}: FacultyCommissionEditModalProps) {
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (!faculty) return
    setDraft(String(faculty.commissionPercent))
  }, [faculty])

  if (!faculty) return null

  const parsed = Number(draft)
  const isValid =
    draft.trim() !== '' && Number.isFinite(parsed) && parsed >= 0 && parsed <= 100

  const handleSave = () => {
    if (!isValid) return
    void onSave(parsed)
  }

  return (
    <ConfirmModal
      open={Boolean(faculty)}
      onClose={() => !isSaving && onClose()}
      onConfirm={handleSave}
      title="Edit commission rate"
      message={`Set a fixed commission rate for ${faculty.name}. Custom rates stay unchanged when you update the platform default.`}
      confirmLabel={isSaving ? 'Saving…' : 'Save rate'}
      cancelLabel="Cancel"
      isLoading={isSaving}
      confirmDisabled={!isValid}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          {faculty.hasCustomCommission ? (
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => void onResetToDefault()}
              className="sm:mr-auto"
            >
              Use platform default ({defaultCommissionPercent}%)
            </Button>
          ) : null}
          <Button type="button" variant="outline" disabled={isSaving} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={isSaving || !isValid}
            onClick={handleSave}
          >
            {isSaving ? 'Saving…' : 'Save rate'}
          </Button>
        </div>
      }
    >
      <div className="space-y-2">
        <label htmlFor="faculty-commission-input" className="text-sm font-medium text-ink-heading">
          Commission rate
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="faculty-commission-input"
            type="number"
            min={0}
            max={100}
            step="any"
            value={draft}
            disabled={isSaving}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1"
          />
          <span className="shrink-0 text-sm font-medium text-nav">%</span>
        </div>
        {!faculty.hasCustomCommission ? (
          <Paragraph variant="caption">
            Currently using platform default ({defaultCommissionPercent}%).
          </Paragraph>
        ) : (
          <Paragraph variant="caption">This faculty has a custom rate.</Paragraph>
        )}
      </div>
    </ConfirmModal>
  )
}
