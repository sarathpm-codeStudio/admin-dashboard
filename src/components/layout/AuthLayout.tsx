import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type AuthLayoutProps = {
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function AuthLayout({ children, footer, className }: AuthLayoutProps) {
  return (
    <div className={cn('flex min-h-screen flex-col bg-surface-page', className)}>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        {children}
      </div>
      {footer ? (
        <div className="shrink-0 px-6 pb-8 text-center">{footer}</div>
      ) : null}
    </div>
  )
}
