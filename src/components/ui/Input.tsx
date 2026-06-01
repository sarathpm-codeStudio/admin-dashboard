import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = 'text', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full rounded-card border-0 bg-surface-input px-4 py-2.5 text-sm text-ink',
        'placeholder:text-[#6b7280] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-50',
        className,
      )}
      {...props}
    />
  )
})
