import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useToastStore, type ToastItem, type ToastVariant } from '@/store/toastStore'
import { cn } from '@/utils/cn'

type ToastProps = {
  toast: ToastItem
  onDismiss: () => void
}

const variantStyles: Record<
  ToastVariant,
  { container: string; icon: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    container: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: 'text-emerald-600',
    Icon: CheckCircle2,
  },
  error: {
    container: 'border-red-200 bg-red-50 text-red-900',
    icon: 'text-[#ba1a1a]',
    Icon: XCircle,
  },
  warning: {
    container: 'border-amber-200 bg-amber-50 text-amber-900',
    icon: 'text-amber-600',
    Icon: AlertCircle,
  },
  info: {
    container: 'border-blue-200 bg-blue-50 text-blue-900',
    icon: 'text-blue-600',
    Icon: Info,
  },
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const { container, icon, Icon } = variantStyles[toast.variant]

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-nav border px-4 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.12)]',
        'toast-enter',
        container,
      )}
    >
      <Icon className={cn('mt-0.5 size-5 shrink-0', icon)} aria-hidden />
      <div className="min-w-0 flex-1">
        {toast.title ? (
          <p className="text-sm font-semibold leading-snug">{toast.title}</p>
        ) : null}
        <p
          className={cn(
            'text-sm leading-snug',
            toast.title ? 'mt-0.5 opacity-90' : 'font-medium',
          )}
        >
          {toast.message}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  )
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  if (typeof document === 'undefined' || toasts.length === 0) {
    return null
  }

  return createPortal(
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed right-4 top-4 z-[200] flex w-full max-w-sm flex-col gap-2 sm:right-6 sm:top-6"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>,
    document.body,
  )
}
