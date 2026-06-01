import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full resize-y rounded-card border-0 bg-surface-input px-4 py-3 text-sm text-ink',
        'placeholder:text-[#6b7280] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-50',
        'min-h-[100px]',
        className,
      )}
      {...props}
    />
  )
})
