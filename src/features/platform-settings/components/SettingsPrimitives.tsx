import type { LucideIcon } from 'lucide-react'
import { Pencil } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, type InputProps } from '@/components/ui/Input'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

/** Outer card used by every settings panel. */
export function SettingsSectionCard({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <Card className={cn('overflow-hidden', className)}>{children}</Card>
}

type SettingsPanelHeaderProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

/** Icon + title + description band with an optional trailing action (e.g. Edit). */
export function SettingsPanelHeader({
  icon: Icon,
  title,
  description,
  action,
}: SettingsPanelHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#e2e8f0]/70 bg-surface-input/30 px-5 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-nav bg-primary-50 text-primary ring-1 ring-inset ring-primary-100">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <Paragraph variant="emphasis" className="text-base text-ink-heading">
            {title}
          </Paragraph>
          <Paragraph variant="caption" className="mt-0.5 text-[13px] leading-relaxed">
            {description}
          </Paragraph>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

/** A labelled section inside a panel (e.g. "Streak rewards"). */
export function SettingsGroup({
  label,
  children,
}: {
  label?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-4">
      {label ? (
        <Paragraph
          variant="label"
          className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted"
        >
          {label}
        </Paragraph>
      ) : null}
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{children}</div>
    </div>
  )
}

type SettingFieldProps = {
  id: string
  label: string
  description?: string
  value: string
  unit?: string
  isEditing: boolean
  placeholder?: string
  /** Trailing control shown next to the label (e.g. a remove button while editing). */
  action?: ReactNode
} & Omit<InputProps, 'value' | 'placeholder' | 'id'>

/** One setting: reads as a value when idle, becomes an input when editing. */
export function SettingField({
  id,
  label,
  description,
  value,
  unit,
  isEditing,
  placeholder,
  className,
  action,
  ...inputProps
}: SettingFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="block text-sm font-medium text-ink-heading">
          {label}
        </label>
        {action ?? null}
      </div>
      {description ? (
        <Paragraph variant="caption" className="text-[12px] leading-snug">
          {description}
        </Paragraph>
      ) : null}
      {isEditing ? (
        <div className="relative">
          <Input
            id={id}
            value={value}
            placeholder={placeholder}
            className={cn(unit ? 'pr-14' : undefined, className)}
            {...inputProps}
          />
          {unit ? (
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-nav">
              {unit}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="flex items-baseline gap-1.5 rounded-card border border-[#e2e8f0]/70 bg-surface-input/40 px-4 py-2.5">
          <span className="text-sm font-semibold text-ink-heading">
            {value.trim() || placeholder || '—'}
          </span>
          {unit ? <span className="text-xs font-medium text-nav">{unit}</span> : null}
        </div>
      )}
    </div>
  )
}

/** Compact Edit button, intended for a panel header's trailing action slot. */
export function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="outline-primary" onClick={onClick}>
      <Pencil className="size-4" aria-hidden />
      Edit
    </Button>
  )
}

type SettingsFooterProps = {
  isSaving: boolean
  canSave: boolean
  onSave: () => void
  onCancel: () => void
}

/** Save / Cancel action row shown at the foot of a panel while editing. */
export function SettingsFooter({ isSaving, canSave, onSave, onCancel }: SettingsFooterProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2 border-t border-[#e2e8f0]/70 bg-surface-input/30 px-5 py-4">
      <Button type="button" variant="outline" disabled={isSaving} onClick={onCancel}>
        Cancel
      </Button>
      <Button type="button" variant="primary" disabled={isSaving || !canSave} onClick={onSave}>
        {isSaving ? 'Saving…' : 'Save changes'}
      </Button>
    </div>
  )
}
