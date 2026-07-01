import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'outline-primary'
  | 'outline-danger'

export type { ButtonVariant }

const buttonBaseClass =
  'inline-flex items-center justify-center gap-2 rounded-nav px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0 active:outline-none disabled:pointer-events-none disabled:opacity-50'

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-gradient-r text-white hover:opacity-90',
  secondary: 'bg-surface-input text-ink hover:bg-[#e8eaed]',
  ghost: 'bg-transparent text-primary hover:bg-primary-50',
  outline: 'border border-[#e2e8f0] bg-white text-ink hover:bg-surface-input',
  'outline-primary': 'border border-primary-200 bg-white text-primary hover:bg-primary-50',
  'outline-danger': 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
}

export function buttonClassName(variant: ButtonVariant = 'primary', className?: string) {
  return cn(buttonBaseClass, variantStyles[variant], className)
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export function Button({ className, variant = 'primary', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, className)}
      {...props}
    />
  )
}
