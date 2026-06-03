import { ChevronDown, type LucideIcon } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export type IconSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  icon: LucideIcon
  wrapperClassName?: string
}

export function IconSelect({
  icon: Icon,
  className,
  wrapperClassName,
  children,
  ...props
}: IconSelectProps) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      <Icon
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-nav"
        aria-hidden
      />
      <select
        className={cn(
          'w-full cursor-pointer appearance-none rounded-nav border-0 bg-white',
          'py-2.5 pl-9 pr-9 text-sm font-[500] text-[#454652] outline-none',
          'transition-colors hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary-50',
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
