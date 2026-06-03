import { useCallback } from 'react'
import { useToastStore, type ToastVariant } from '@/store/toastStore'

type ToastOptions = {
  title?: string
  duration?: number
}

function createVariantHelper(variant: ToastVariant) {
  return (message: string, options?: ToastOptions) =>
    useToastStore.getState().show({ message, variant, ...options })
}

export function useToast() {
  const show = useToastStore((state) => state.show)
  const dismiss = useToastStore((state) => state.dismiss)

  const success = useCallback(createVariantHelper('success'), [])
  const error = useCallback(createVariantHelper('error'), [])
  const warning = useCallback(createVariantHelper('warning'), [])
  const info = useCallback(createVariantHelper('info'), [])

  return {
    show,
    dismiss,
    success,
    error,
    warning,
    info,
  }
}
