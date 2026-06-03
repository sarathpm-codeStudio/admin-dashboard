import type { User } from '@supabase/supabase-js'
import type { ProfileAuthRow } from '@/types/profile'
import { normalizeRole } from '@/utils/roles'

export class AdminAccessDeniedError extends Error {
  constructor() {
    super('Access denied. This portal is for administrators only.')
    this.name = 'AdminAccessDeniedError'
  }
}

export type AuthUser = {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  role: string
  accountId: string | null
}

function buildFullName(
  profile: ProfileAuthRow | null | undefined,
  metadata: Record<string, unknown> | undefined,
): string | null {
  const first =
    profile?.first_name ??
    (typeof metadata?.first_name === 'string' ? metadata.first_name : null)
  const last =
    profile?.last_name ??
    (typeof metadata?.last_name === 'string' ? metadata.last_name : null)

  const combined = [first, last].filter(Boolean).join(' ').trim()
  if (combined) return combined

  if (typeof metadata?.full_name === 'string') return metadata.full_name
  if (typeof metadata?.name === 'string') return metadata.name
  return null
}

export function resolveRole(
  profile: ProfileAuthRow | null | undefined,
  metadata: Record<string, unknown> | undefined,
): string {
  const fromProfile = profile?.role
  const fromMetadata = metadata?.role
  return normalizeRole(
    typeof fromProfile === 'string'
      ? fromProfile
      : typeof fromMetadata === 'string'
        ? fromMetadata
        : '',
  )
}

export function mapSupabaseUser(
  user: User,
  profile?: ProfileAuthRow | null,
): AuthUser {
  const metadata = user.user_metadata as Record<string, unknown> | undefined
  const avatarUrl =
    profile?.avatar_url ??
    (typeof metadata?.avatar_url === 'string' ? metadata.avatar_url : null)

  return {
    id: user.id,
    email: user.email ?? profile?.email ?? '',
    fullName: buildFullName(profile, metadata),
    avatarUrl,
    role: resolveRole(profile, metadata),
    accountId: profile?.account_id ?? null,
  }
}
