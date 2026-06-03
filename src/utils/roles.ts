import type { AppRole } from '@/types/profile'

export const ADMIN_PORTAL_ROLE = 'ADMIN'

export function normalizeRole(role: string | null | undefined): string {
  return role?.trim().toUpperCase() ?? ''
}

export function isAdminRole(role: string | null | undefined): boolean {
  return normalizeRole(role) === ADMIN_PORTAL_ROLE
}

export function formatRoleLabel(role: AppRole): string {
  const normalized = normalizeRole(role)
  if (!normalized) return 'User'
  return normalized.charAt(0) + normalized.slice(1).toLowerCase()
}
