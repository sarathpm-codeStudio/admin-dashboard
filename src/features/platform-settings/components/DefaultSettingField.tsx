import type { LucideIcon } from 'lucide-react'
import { Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, cardPaddingClass } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

type DefaultSettingFieldProps = {
  icon: LucideIcon
  title: string
  description: string
  inputLabel: string
  inputSuffix?: string
  value: string
  placeholder?: string
  isSaving?: boolean
  titleClassName?: string
  descriptionClassName?: string
  onSave: (value: string) => void | Promise<void>
}

export function DefaultSettingField({
  icon: Icon,
  title,
  description,
  inputLabel,
  inputSuffix,
  value,
  placeholder,
  isSaving = false,
  titleClassName,
  descriptionClassName,
  onSave,
}: DefaultSettingFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (!isEditing) setDraft(value)
  }, [value, isEditing])

  const handleEdit = () => {
    setDraft(value)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraft(value)
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!draft.trim()) return
    try {
      await onSave(draft.trim())
      setIsEditing(false)
    } catch {
      // Stay in edit mode so the user can retry.
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-nav bg-primary-50 text-primary">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <Paragraph variant="emphasis" className={cn('text-ink-heading', titleClassName)}>
            {title}
          </Paragraph>
          <Paragraph variant="caption" className={cn('mt-1', descriptionClassName)}>
            {description}
          </Paragraph>
        </div>
      </div>

      <div className="max-w-md space-y-2">
        <label htmlFor="default-setting-input" className="text-sm font-medium text-ink-heading">
          {inputLabel}
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="default-setting-input"
            type="number"
            min={0}
            step="any"
            value={isEditing ? draft : value}
            placeholder={placeholder}
            disabled={!isEditing || isSaving}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1"
          />
          {inputSuffix ? (
            <span className="shrink-0 text-sm font-medium text-nav">{inputSuffix}</span>
          ) : null}
        </div>
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
              disabled={isSaving || !draft.trim()}
              onClick={() => void handleSave()}
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </Button>
            <Button type="button" variant="outline" disabled={isSaving} onClick={handleCancel}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export function SettingsSectionCard({ children }: { children: React.ReactNode }) {
  return <Card className={cardPaddingClass}>{children}</Card>
}
