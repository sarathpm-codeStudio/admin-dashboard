import { Star } from 'lucide-react'
import { cn } from '@/utils/cn'

type StarRatingProps = {
  value: number
  maxStars?: number
  starSizeClass?: string
  className?: string
  /** Star fill color when active */
  activeClassName?: string
  inactiveClassName?: string
  /** Filled bars vs cyan outline for empty stars (review cards) */
  variant?: 'filled' | 'outline'
}

export function StarRating({
  value,
  maxStars = 5,
  starSizeClass = 'size-5',
  className,
  activeClassName = 'text-[#49D7F4]',
  inactiveClassName = 'text-[#E2E8F0]',
  variant = 'filled',
}: StarRatingProps) {
  const isOutline = variant === 'outline'

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role="img"
      aria-label={`${value} out of ${maxStars} stars`}
    >
      {Array.from({ length: maxStars }, (_, index) => {
        const fillAmount = Math.min(1, Math.max(0, value - index))
        const isActive = fillAmount > 0

        if (isOutline) {
          return (
            <Star
              key={index}
              className={cn(
                starSizeClass,
                isActive
                  ? cn('fill-[#49D7F4] text-[#49D7F4]', activeClassName)
                  : 'fill-none stroke-[#49D7F4] text-[#49D7F4]',
              )}
              strokeWidth={isActive ? 0 : 1.5}
              fill={isActive ? 'currentColor' : 'none'}
              aria-hidden
            />
          )
        }

        return (
          <span key={index} className="relative inline-flex shrink-0">
            <Star
              className={cn(starSizeClass, inactiveClassName)}
              fill="currentColor"
              strokeWidth={0}
              aria-hidden
            />
            {isActive ? (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillAmount * 100}%` }}
                aria-hidden
              >
                <Star
                  className={cn(starSizeClass, activeClassName)}
                  fill="currentColor"
                  strokeWidth={0}
                />
              </span>
            ) : null}
          </span>
        )
      })}
    </div>
  )
}
