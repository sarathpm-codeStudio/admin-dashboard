import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'outline-primary'
  | 'outline-danger'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-gradient-r text-white hover:opacity-90',
  secondary: 'bg-surface-input text-ink hover:bg-[#e8eaed]',
  ghost: 'bg-transparent text-primary hover:bg-primary-50',
  outline: 'border border-[#e2e8f0] bg-white text-ink hover:bg-surface-input',
  'outline-primary': 'border border-primary-200 bg-white text-primary hover:bg-primary-50',
  'outline-danger': 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
}

export function Button({ className, variant = 'primary', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-nav px-4 py-2 text-sm font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-50 focus:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  )
}
