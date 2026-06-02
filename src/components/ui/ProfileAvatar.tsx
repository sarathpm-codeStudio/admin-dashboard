import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type ProfileAvatarProps = {
  src: string
  alt?: string
  sizeClassName?: string
  roundedClassName?: string
  badge?: ReactNode
  className?: string
}

export function ProfileAvatar({
  src,
  alt = '',
  sizeClassName = 'size-[84px] sm:size-[92px]',
  roundedClassName = 'rounded-2xl',
  badge,
  className,
}: ProfileAvatarProps) {
  return (
    <div className={cn('relative shrink-0', sizeClassName, className)}>
      <div className={cn('size-full overflow-hidden', roundedClassName)}>
        <img src={src} alt={alt} className="size-full object-cover object-center" />
      </div>
      {badge}
    </div>
  )
}
