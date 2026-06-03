import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
import { queryClient } from '@/config/queryClient'
import { ToastViewport } from '@/components/ui/Toast'
import { AuthProvider } from '@/features/auth/AuthProvider'
import '@/styles/globals.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <ToastViewport />
      </AuthProvider>
      {import.meta.env.DEV ? (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      ) : null}
    </QueryClientProvider>
  </StrictMode>,
)
