import { supabase } from '@/config/supabase'

export const PLATFORM_SETTING_KEYS = {
  defaultCoinValue: 'default_coin_value',
  defaultEnrollmentCoinCount: 'default_enrollment_coin_count',
  defaultStreakDays: 'default_streak_days',
  defaultStreakCoinCount: 'default_streak_coin_count',
  defaultCommissionPercent: 'default_commission_percent',
} as const

export type PlatformSettingKey =
  (typeof PLATFORM_SETTING_KEYS)[keyof typeof PLATFORM_SETTING_KEYS]

export type PlatformSettingsMap = Record<PlatformSettingKey, string>

export type CommissionFacultyRow = {
  id: string
  name: string
  email: string | null
  phone: string | null
  avatarUrl: string | null
  commissionPercent: number
  hasCustomCommission: boolean
  accountVerified: string
  isSuspended: boolean
  coursesCount: number
  joinedDate: string
  initials: string
}

export type CommissionFacultiesResponse = {
  data: CommissionFacultyRow[]
  pagination: {
    total: number
    total_pages: number
    current_page: number
    limit: number
  }
}

const ALL_KEYS = Object.values(PLATFORM_SETTING_KEYS)

export const PLATFORM_SETTING_DEFAULTS: PlatformSettingsMap = {
  [PLATFORM_SETTING_KEYS.defaultCoinValue]: '1',
  [PLATFORM_SETTING_KEYS.defaultEnrollmentCoinCount]: '1',
  [PLATFORM_SETTING_KEYS.defaultStreakDays]: '7',
  [PLATFORM_SETTING_KEYS.defaultStreakCoinCount]: '5',
  [PLATFORM_SETTING_KEYS.defaultCommissionPercent]: '20',
}

function facultyInitials(name: string, email: string | null | undefined): string {
  const trimmed = name.trim()
  if (trimmed && trimmed !== 'Unknown') {
    const parts = trimmed.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
    }
    return trimmed.slice(0, 2).toUpperCase()
  }
  if (email) return (email.split('@')[0] ?? email).slice(0, 2).toUpperCase()
  return '??'
}

const COMMISSION_FACULTY_BASE_FIELDS =
  'id, first_name, last_name, email, phone, avatar_url, created_at, account_verified, is_suspended'

const COMMISSION_FACULTY_PROFILE_FIELDS = `${COMMISSION_FACULTY_BASE_FIELDS}, commission_rate`

type CommissionFacultyProfileRow = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string | null
  account_verified: string | null
  is_suspended: boolean | null
  commission_rate?: number | string | null
}

function isMissingCommissionRateColumn(
  error: { message?: string; code?: string } | null,
): boolean {
  if (!error) return false
  const message = (error.message ?? '').toLowerCase()
  return (
    error.code === '42703' ||
    message.includes('commission_rate') ||
    message.includes('does not exist')
  )
}

const COMMISSION_COLUMN_MIGRATION_HINT =
  'Add profiles.commission_rate (numeric, nullable) in Supabase to enable per-faculty commission overrides.'

async function fetchDefaultCommissionPercent(): Promise<number> {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', PLATFORM_SETTING_KEYS.defaultCommissionPercent)
    .maybeSingle()

  if (error) throw new Error(error.message)

  const value = Number(data?.value)
  return Number.isFinite(value)
    ? value
    : Number(PLATFORM_SETTING_DEFAULTS[PLATFORM_SETTING_KEYS.defaultCommissionPercent])
}

/** NULL commission_rate → platform default; non-null → fixed individual rate. */
function resolveCommissionPercent(
  commissionRate: number | string | null | undefined,
  defaultPercent: number,
): { percent: number; hasCustom: boolean } {
  if (commissionRate != null && commissionRate !== '') {
    const custom = Number(commissionRate)
    if (Number.isFinite(custom)) {
      return { percent: custom, hasCustom: true }
    }
  }
  return { percent: defaultPercent, hasCustom: false }
}

/** Default platform commission — used when a faculty has no override. */
export async function getDefaultCommissionPercent(): Promise<number> {
  return fetchDefaultCommissionPercent()
}

/** Effective commission for one faculty (custom override or platform default). */
export async function getFacultyCommissionPercent(facultyId: string): Promise<number> {
  const defaultPercent = await fetchDefaultCommissionPercent()

  const { data, error } = await supabase
    .from('profiles')
    .select('commission_rate')
    .eq('id', facultyId)
    .maybeSingle()

  if (error) {
    if (isMissingCommissionRateColumn(error)) return defaultPercent
    throw new Error(error.message)
  }
  return resolveCommissionPercent(data?.commission_rate, defaultPercent).percent
}

export const platformSettingsFunctions = {
  getSettings: async (): Promise<PlatformSettingsMap> => {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('key, value')
      .in('key', ALL_KEYS)

    if (error) throw new Error(error.message)

    const result = { ...PLATFORM_SETTING_DEFAULTS }
    for (const row of data ?? []) {
      if (ALL_KEYS.includes(row.key as PlatformSettingKey)) {
        result[row.key as PlatformSettingKey] = row.value ?? ''
      }
    }
    return result
  },

  updateSetting: async (key: PlatformSettingKey, value: string): Promise<void> => {
    const trimmed = value.trim()
    if (!trimmed) throw new Error('Value cannot be empty')

    const { error } = await supabase
      .from('platform_settings')
      .upsert({ key, value: trimmed }, { onConflict: 'key' })

    if (error) throw new Error(error.message)
  },

  getCommissionFaculties: async ({
    page = 1,
    limit = 10,
    search = '',
  }: {
    page?: number
    limit?: number
    search?: string
  }): Promise<CommissionFacultiesResponse> => {
    const from = (page - 1) * limit
    const to = from + limit - 1
    const defaultCommissionPercent = await fetchDefaultCommissionPercent()

    const buildQuery = (selectFields: string) => {
      let query = supabase
        .from('profiles')
        .select(selectFields, { count: 'exact' })
        .eq('role', 'FACULTY')
        .or('is_suspended.is.null,is_suspended.eq.false')

      if (search.trim()) {
        query = query.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
        )
      }

      return query.order('created_at', { ascending: false }).range(from, to)
    }

    let { data: rows, error, count } = await buildQuery(COMMISSION_FACULTY_PROFILE_FIELDS)

    if (error && isMissingCommissionRateColumn(error)) {
      ;({ data: rows, error, count } = await buildQuery(COMMISSION_FACULTY_BASE_FIELDS))
    }

    if (error) throw new Error(error.message)

    const profileRows = (rows ?? []) as unknown as CommissionFacultyProfileRow[]
    const facultyIds = profileRows.map((row) => row.id)
    const courseMap: Record<string, number> = {}

    if (facultyIds.length > 0) {
      const { data: courses, error: courseError } = await supabase
        .from('courses')
        .select('faculty_id')
        .in('faculty_id', facultyIds)
        .eq('is_deleted', false)

      if (courseError) throw new Error(courseError.message)

      courses?.forEach((course) => {
        courseMap[course.faculty_id] = (courseMap[course.faculty_id] ?? 0) + 1
      })
    }

    const data: CommissionFacultyRow[] = profileRows.map((row) => {
      const name =
        `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || 'Unknown'
      const { percent, hasCustom } = resolveCommissionPercent(
        row.commission_rate,
        defaultCommissionPercent,
      )

      return {
        id: row.id,
        name,
        email: row.email,
        phone: row.phone,
        avatarUrl: row.avatar_url,
        commissionPercent: percent,
        hasCustomCommission: hasCustom,
        accountVerified: row.account_verified ?? 'PENDING',
        isSuspended: row.is_suspended === true,
        coursesCount: courseMap[row.id] ?? 0,
        joinedDate: row.created_at
          ? new Date(row.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '—',
        initials: facultyInitials(name, row.email),
      }
    })

    const total = count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / limit))

    return {
      data,
      pagination: {
        total,
        total_pages: totalPages,
        current_page: page,
        limit,
      },
    }
  },

  /** Set a fixed commission % for one faculty (not affected by default changes). */
  updateFacultyCommission: async (
    facultyId: string,
    commissionPercent: number,
  ): Promise<void> => {
    if (!Number.isFinite(commissionPercent) || commissionPercent < 0 || commissionPercent > 100) {
      throw new Error('Commission must be between 0 and 100')
    }

    const { error } = await supabase
      .from('profiles')
      .update({ commission_rate: commissionPercent })
      .eq('id', facultyId)
      .eq('role', 'FACULTY')

    if (error) {
      if (isMissingCommissionRateColumn(error)) {
        throw new Error(COMMISSION_COLUMN_MIGRATION_HINT)
      }
      throw new Error(error.message)
    }
  },

  /** Remove custom commission so the faculty follows the platform default again. */
  resetFacultyCommission: async (facultyId: string): Promise<void> => {
    const { error } = await supabase
      .from('profiles')
      .update({ commission_rate: null })
      .eq('id', facultyId)
      .eq('role', 'FACULTY')

    if (error) {
      if (isMissingCommissionRateColumn(error)) {
        throw new Error(COMMISSION_COLUMN_MIGRATION_HINT)
      }
      throw new Error(error.message)
    }
  },
}
