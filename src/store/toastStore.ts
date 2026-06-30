import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral'

export type ToastItem = {
  id: string
  message: string
  title?: string
  variant: ToastVariant
  duration: number
}

type ShowToastInput = {
  message: string
  title?: string
  variant?: ToastVariant
  duration?: number
}

type ToastState = {
  toasts: ToastItem[]
  show: (input: ShowToastInput) => string
  dismiss: (id: string) => void
}

const DEFAULT_DURATION_MS = 5000

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  show: ({ message, title, variant = 'info', duration = DEFAULT_DURATION_MS }) => {
    const id = crypto.randomUUID()
    const toast: ToastItem = { id, message, title, variant, duration }

    set((state) => ({ toasts: [...state.toasts, toast] }))

    window.setTimeout(() => {
      get().dismiss(id)
    }, duration)

    return id
  },

  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
