import type { ReactNode } from 'react'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

type FormFieldProps = {
  label: string
  htmlFor?: string
  error?: string
  children: ReactNode
  className?: string
}

export function FormField({ label, htmlFor, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink-label">
          {label}
        </label>
      ) : (
        <span className="text-sm font-medium text-ink-label">{label}</span>
      )}
      {children}
      {error ? (
        <Paragraph variant="caption" className="text-[#BA1A1A]">
          {error}
        </Paragraph>
      ) : null}
    </div>
  )
}
