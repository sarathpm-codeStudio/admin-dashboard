import { brand } from '@/config/navigation'
import { cn } from '@/utils/cn'

type BrandMarkProps = {
  className?: string
  iconClassName?: string
}

/** Auth screens — brand logo (Figma sign-in) */
export function BrandMark({ className, iconClassName }: BrandMarkProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <img
        src={brand.brandIcon}
        alt={brand.name}
        className={cn('h-20 w-auto object-contain', iconClassName)}
        aria-hidden
      />
    </div>
  )
}
