import { GiGraduateCap } from 'react-icons/gi'
import { cn } from '@/utils/cn'

type BrandMarkProps = {
  className?: string
  iconClassName?: string
}

/** Auth screens — graduate cap in #F2F4F6 tile (Figma sign-in) */
export function BrandMark({ className, iconClassName }: BrandMarkProps) {
  return (
    <div
      className={cn(
        'flex h-12 w-14 items-center justify-center rounded-xl bg-[#F2F4F6]',
        className,
      )}
    >
      <GiGraduateCap
        className={cn('h-7 w-9 text-[#2D5BFF]', iconClassName)}
        aria-hidden
      />
    </div>
  )
}
