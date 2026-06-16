import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  indeterminate?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, indeterminate, ...props },
  ref,
) {
  return (
    <input
      ref={(node) => {
        if (node) node.indeterminate = Boolean(indeterminate)
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      type="checkbox"
      className={cn(
        'size-4 shrink-0 cursor-pointer rounded border border-[#CBD5E1] text-primary accent-[#2c1452]',
        'focus:outline-none focus:ring-2 focus:ring-primary-50 focus:ring-offset-1',
        className,
      )}
      {...props}
    />
  )
})
