const PLACEHOLDER_URL = 'https://your-project.supabase.co'
const PLACEHOLDER_KEY = 'your-anon-key'

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!url || !key) return false
  if (url === PLACEHOLDER_URL || key === PLACEHOLDER_KEY) return false
  return true
}

export function isAuthNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase()
    return message.includes('failed to fetch') || message.includes('network')
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message: string }).message).toLowerCase()
    return (
      message.includes('networkerror') ||
      message.includes('failed to fetch') ||
      message.includes('load failed')
    )
  }
  return false
}
