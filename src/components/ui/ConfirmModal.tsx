import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Header2, Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

export type ConfirmModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'primary' | 'outline-danger'
  isLoading?: boolean
  className?: string
  /** 'default' = left-aligned with inline buttons. 'centered' = icon badge on top, centered text, stacked buttons. */
  layout?: 'default' | 'centered'
  /** Icon shown inside the badge when layout is 'centered'. */
  icon?: ReactNode
  /** Fine-print shown below the buttons when layout is 'centered'. */
  footnote?: ReactNode
  /** Extra content (e.g. a form) rendered between the message and the buttons in the default layout. */
  children?: ReactNode
  /** Disables the confirm button independently of the loading state. */
  confirmDisabled?: boolean
  /** Replaces the default cancel/confirm footer (default layout only). Use for custom actions. */
  footer?: ReactNode
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false,
  className,
  layout = 'default',
  icon,
  footnote,
  children,
  confirmDisabled = false,
  footer,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const isCentered = layout === 'centered'

  const confirmButton = (
    <Button
      type="button"
      variant={confirmVariant}
      onClick={onConfirm}
      disabled={isLoading || confirmDisabled}
      className={isCentered ? 'w-full' : undefined}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {confirmLabel}
        </>
      ) : (
        confirmLabel
      )}
    </Button>
  )

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className={cn(
          'relative w-full max-w-md rounded-card border border-[#e2e8f0]/60 bg-surface-card p-6 shadow-lg',
          className,
        )}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-nav p-1 text-nav transition-colors hover:bg-surface-input hover:text-ink-heading"
        >
          <X className="size-4" aria-hidden />
        </button>

        {isCentered ? (
          <div className="flex flex-col items-center text-center">
            {icon ? (
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary-50 text-primary">
                {icon}
              </div>
            ) : null}
            <Header2 size="section" id="confirm-modal-title">
              {title}
            </Header2>
            <Paragraph variant="muted" className="mt-2">
              {message}
            </Paragraph>

            <div className="mt-6 flex w-full flex-col gap-2">
              {confirmButton}
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="w-full"
              >
                {cancelLabel}
              </Button>
            </div>

            {footnote ? (
              <Paragraph variant="small" className="mt-4 text-nav">
                {footnote}
              </Paragraph>
            ) : null}
          </div>
        ) : (
          <>
            <Header2 size="section" id="confirm-modal-title" className="pr-8">
              {title}
            </Header2>
            {message ? (
              <Paragraph variant="muted" className="mt-2">
                {message}
              </Paragraph>
            ) : null}

            {children ? <div className="mt-5">{children}</div> : null}

            {footer ? (
              <div className="mt-6">{footer}</div>
            ) : (
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelLabel}
                </Button>
                {confirmButton}
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
