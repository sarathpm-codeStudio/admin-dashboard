import type { UserListRow } from '@/api/userManagement/userManagement.api'
import type { UserFilterValues } from '@/features/users/components/UserFiltersBar'
import type { UserRecord, UserRole, UserStatus } from '@/features/users/types'

const avatarPalette = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
] as const

function hashIndex(id: string, modulo: number): number {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i)) % modulo
  }
  return hash
}

function getInitials(name: string, email: string): string {
  const trimmed = name.trim()
  if (trimmed && trimmed !== 'Unknown') {
    const parts = trimmed.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
    }
    return trimmed.slice(0, 2).toUpperCase()
  }
  const local = email.split('@')[0] ?? email
  return local.slice(0, 2).toUpperCase()
}

function mapRole(role: string): UserRole {
  if (role === 'FACULTY') return 'Faculty'
  if (role === 'STUDENT') return 'Student'
  return 'Admin'
}

export function resolveUserStatus(
  accountVerified: string,
  isSuspended: boolean,
): UserStatus {
  if (isSuspended) return 'suspended'
  if (accountVerified === 'APPROVED') return 'active'
  if (accountVerified === 'PENDING') return 'pending'
  if (accountVerified === 'REJECTED') return 'rejected'
  return 'pending'
}

export function mapUserListRowToRecord(user: UserListRow): UserRecord {
  const paletteIndex = hashIndex(user.id, avatarPalette.length)

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: mapRole(user.role),
    status: resolveUserStatus(user.accountVerified, user.isSuspended),
    coursesCount: user.courseCount,
    joinedDate: user.joinedDate,
    initials: getInitials(user.name, user.email),
    avatarClassName: avatarPalette[paletteIndex]!,
    avatarUrl: user.avatarUrl,
  }
}

export function mapUserTypeFilterToRole(
  userType: UserFilterValues['userType'],
): 'all' | 'STUDENT' | 'FACULTY' {
  if (userType === 'student') return 'STUDENT'
  if (userType === 'faculty') return 'FACULTY'
  return 'all'
}

export function mapStatusFilterToApi(
  status: UserFilterValues['status'],
): 'all' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED' {
  if (status === 'active') return 'APPROVED'
  if (status === 'pending') return 'PENDING'
  if (status === 'rejected') return 'REJECTED'
  if (status === 'suspended') return 'SUSPENDED'
  return 'all'
}
