import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

const headingBase = 'font-sans text-ink-heading'

const header1Sizes = {
  page: 'text-2xl font-bold leading-tight',
  display: 'text-3xl font-semibold leading-tight',
} as const

export type Header1Props = HTMLAttributes<HTMLHeadingElement> & {
  /** `page` = dashboard titles; `display` = placeholder / hero titles */
  size?: keyof typeof header1Sizes
}

export function Header1({ className, size = 'page', children, ...props }: Header1Props) {
  return (
    <h1 className={cn(headingBase, header1Sizes[size], className)} {...props}>
      {children}
    </h1>
  )
}

const header2Sizes = {
  section: 'text-[20px] font-semibold leading-tight',
  card: 'text-[20px] font-semibold leading-tight',
} as const

export type Header2Props = HTMLAttributes<HTMLHeadingElement> & {
  /** `section` = card section titles; `card` = compact card headers */
  size?: keyof typeof header2Sizes
}

export function Header2({ className, size = 'section', children, ...props }: Header2Props) {
  return (
    <h2 className={cn(headingBase, header2Sizes[size], className)} {...props}>
      {children}
    </h2>
  )
}

const paragraphVariants = {
  body: 'text-sm leading-normal text-ink',
  muted: 'text-sm leading-normal text-nav',
  emphasis: 'text-sm font-semibold leading-normal text-ink-heading',
  small: 'text-xs font-medium leading-normal text-ink',
  caption: 'text-xs leading-normal text-nav',
  label: 'text-xs font-medium leading-normal text-nav',
} as const

export type ParagraphProps = HTMLAttributes<HTMLParagraphElement> & {
  variant?: keyof typeof paragraphVariants
}

export function Paragraph({
  className,
  variant = 'body',
  children,
  ...props
}: ParagraphProps) {
  return (
    <p className={cn('font-sans', paragraphVariants[variant], className)} {...props}>
      {children}
    </p>
  )
}
