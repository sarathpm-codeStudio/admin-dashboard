import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string
}

export function Select({ className, wrapperClassName, children, ...props }: SelectProps) {
  return (
    <div className={cn('relative shrink-0', wrapperClassName)}>
      <select
        className={cn(
          'w-full cursor-pointer appearance-none rounded-card border-0 bg-surface-input',
          'py-2.5 pl-4 pr-10 text-sm font-medium text-ink outline-none',
          'transition-colors hover:bg-[#e8eaed] focus:bg-white focus:ring-2 focus:ring-primary-50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-nav"
        aria-hidden
      />
    </div>
  )
}
