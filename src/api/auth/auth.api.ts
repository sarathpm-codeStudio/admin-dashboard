import type { User } from '@supabase/supabase-js'
import { fetchProfileForAuth } from '@/api/auth/profile.api'
import { isAuthNetworkError } from '@/config/auth'
import { supabase } from '@/config/supabase'
import {
  AdminAccessDeniedError,
  mapSupabaseUser,
  type AuthUser,
} from '@/types/auth'
import { isAdminRole } from '@/utils/roles'

export type SignInCredentials = {
  email: string
  password: string
  remember?: boolean
}

const REMEMBER_KEY = 'auth-remember'

function setRememberPreference(remember: boolean) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0')
}

async function loadProfile(userId: string) {
  try {
    return await fetchProfileForAuth(userId)
  } catch {
    return null
  }
}

async function buildAdminAuthUser(authUser: User): Promise<AuthUser> {
  const profile = await loadProfile(authUser.id)
  const user = mapSupabaseUser(authUser, profile)

  if (!isAdminRole(user.role)) {
    await supabase.auth.signOut()
    throw new AdminAccessDeniedError()
  }

  return user
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AdminAccessDeniedError) {
    return error.message
  }
  if (isAuthNetworkError(error)) {
    return 'Cannot reach the authentication server. Check your internet connection, VPN, or firewall, then try again.'
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message: string }).message)
    if (message.includes('Invalid login credentials')) {
      return 'Invalid email or password.'
    }
    if (message.includes('Email not confirmed')) {
      return 'Please confirm your email before signing in.'
    }
    return message
  }
  return 'Sign in failed. Please try again.'
}

export async function signInWithPassword({
  email,
  password,
  remember = false,
}: SignInCredentials): Promise<AuthUser> {
  setRememberPreference(remember)

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) throw error
  if (!data.user) {
    throw new Error('Sign in succeeded but no user was returned.')
  }

  return buildAdminAuthUser(data.user)
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/** Validates session with Supabase and ensures the user is an admin. */
export async function resolveAuthUser(): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session) {
        await supabase.auth.signOut()
      }
      return null
    }

    try {
      return await buildAdminAuthUser(data.user)
    } catch (err) {
      if (err instanceof AdminAccessDeniedError) {
        return null
      }
      throw err
    }
  } catch (err) {
    if (isAuthNetworkError(err)) {
      return null
    }
    throw err
  }
}
