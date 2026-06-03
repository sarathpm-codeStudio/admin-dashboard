import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const REMEMBER_KEY = 'auth-remember'

function getAuthStorage(): Storage {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    }
  }
  return window.localStorage.getItem(REMEMBER_KEY) === '0'
    ? window.sessionStorage
    : window.localStorage
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getAuthStorage(),
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})