import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export function HelpFab() {
  return (
    <Link
      to="/help"
      aria-label="Help Center"
      className={cn(
        'flex size-10 items-center justify-center',
        'rounded-lg bg-primary text-white shadow-md',
        'transition-colors hover:bg-brand-navy-end',
      )}
    >
      <span className="text-lg font-bold leading-none" aria-hidden>
        ?
      </span>
    </Link>
  )
}
