import { Search } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'

export type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  wrapperClassName?: string
}

export function SearchInput({
  className,
  wrapperClassName,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted"
        aria-hidden
      />
      <Input type="search" className={cn('pl-10', className)} {...props} />
    </div>
  )
}
