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

/** Values are keyed by whatever `key`s exist in the DB, not just the known ones. */
export type PlatformSettingsMap = Record<string, string>

/**
 * Display metadata for a setting key. Add an entry here to give a new DB key a
 * proper label, description, unit and group. Keys without an entry still show
 * up in the UI with a humanized label under "Other settings".
 */
export type PlatformSettingMeta = {
  label: string
  description: string
  group: string
  unit?: string
  min?: number
  max?: number
  step?: string
}

export const PLATFORM_SETTING_META: Record<string, PlatformSettingMeta> = {
  [PLATFORM_SETTING_KEYS.defaultCoinValue]: {
    label: 'Coin value',
    description: 'Monetary worth of a single coin.',
    group: 'Coin economy',
    unit: '₹',
    min: 0,
    step: '1',
  },
  [PLATFORM_SETTING_KEYS.defaultEnrollmentCoinCount]: {
    label: 'Enrollment reward',
    description: 'Coins granted when a student enrolls in a course.',
    group: 'Coin economy',
    unit: 'coins',
    min: 0,
    step: '1',
  },
  welcome_bonus_coin: {
    label: 'Welcome bonus',
    description: 'Coins granted to a student on sign-up.',
    group: 'Coin economy',
    unit: 'coins',
    min: 0,
    step: '1',
  },
  [PLATFORM_SETTING_KEYS.defaultStreakDays]: {
    label: 'Streak length',
    description: 'Consecutive active days needed to earn a streak bonus.',
    group: 'Streak rewards',
    unit: 'days',
    min: 0,
    step: '1',
  },
  [PLATFORM_SETTING_KEYS.defaultStreakCoinCount]: {
    label: 'Streak reward',
    description: 'Coins granted when a student completes a streak.',
    group: 'Streak rewards',
    unit: 'coins',
    min: 0,
    step: '1',
  },
  default_best_course: {
    label: 'Featured best courses',
    description: 'Number of top courses highlighted to students.',
    group: 'Courses',
    unit: 'courses',
    min: 0,
    step: '1',
  },
  [PLATFORM_SETTING_KEYS.defaultCommissionPercent]: {
    label: 'Commission rate',
    description: 'Applied to every faculty on the platform default.',
    group: 'Commission',
    unit: '%',
    min: 0,
    max: 100,
    step: 'any',
  },
}

/** "welcome_bonus_coin" -> "Welcome Bonus Coin" */
export function humanizeSettingKey(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/** Metadata for a key, falling back to a humanized label for unknown keys. */
export function getSettingMeta(key: string): PlatformSettingMeta {
  return (
    PLATFORM_SETTING_META[key] ?? {
      label: humanizeSettingKey(key),
      description: '',
      group: 'Other settings',
      min: 0,
      step: 'any',
    }
  )
}

/** A fully-resolved setting: DB metadata wins, code registry fills the gaps. */
export type PlatformSetting = {
  id: string
  key: string
  value: string
  label: string
  description: string
  group: string
  unit: string
  sortOrder: number
}

type PlatformSettingRow = {
  id: string
  key: string
  value: string | null
  label: string | null
  description: string | null
  group_name: string | null
  unit: string | null
  sort_order: number | null
}

const FALLBACK_GROUP = 'Other settings'

function resolveSetting(row: PlatformSettingRow): PlatformSetting {
  const meta = getSettingMeta(row.key)
  return {
    id: row.id,
    key: row.key,
    value: row.value ?? '',
    label: row.label?.trim() || meta.label,
    description: row.description?.trim() || meta.description,
    group: row.group_name?.trim() || meta.group || FALLBACK_GROUP,
    unit: row.unit?.trim() || meta.unit || '',
    sortOrder: row.sort_order ?? 0,
  }
}

export type CreateSettingInput = {
  key: string
  value: string
  label: string
  group: string
  description?: string
  unit?: string
}

/** snake_case identifier, e.g. "welcome_bonus_coin". */
export function isValidSettingKey(key: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(key)
}

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

/** commission_rate equal to platform default → Default; otherwise Custom. NULL → Default (legacy). */
function isSameCommissionRate(rate: number, defaultPercent: number): boolean {
  return Math.abs(rate - defaultPercent) < 1e-9
}

function resolveCommissionPercent(
  commissionRate: number | string | null | undefined,
  defaultPercent: number,
): { percent: number; hasCustom: boolean } {
  if (commissionRate != null && commissionRate !== '') {
    const custom = Number(commissionRate)
    if (Number.isFinite(custom)) {
      if (isSameCommissionRate(custom, defaultPercent)) {
        return { percent: defaultPercent, hasCustom: false }
      }
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

/** Set commission_rate to the platform default for faculties still on default (NULL or previous default). */
async function syncFacultyDefaultCommissionRates(
  previousDefault: number,
  nextDefault: number,
): Promise<void> {
  if (isSameCommissionRate(previousDefault, nextDefault)) return

  const { error } = await supabase
    .from('profiles')
    .update({ commission_rate: nextDefault })
    .eq('role', 'FACULTY')
    .or(`commission_rate.is.null,commission_rate.eq.${previousDefault}`)

  if (error && !isMissingCommissionRateColumn(error)) {
    throw new Error(error.message)
  }
}

export const platformSettingsFunctions = {
  getSettings: async (): Promise<PlatformSettingsMap> => {
    // The table is the source of truth: settings show up when a row exists and
    // disappear when it is deleted. Defaults are only used as input placeholders.
    const { data, error } = await supabase.from('platform_settings').select('key, value')

    if (error) throw new Error(error.message)

    const result: PlatformSettingsMap = {}
    for (const row of data ?? []) {
      if (row.key) {
        result[row.key] = row.value ?? ''
      }
    }
    return result
  },

  /** Full settings with resolved display metadata, ordered for the UI. */
  listSettings: async (): Promise<PlatformSetting[]> => {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('id, key, value, label, description, group_name, unit, sort_order')

    if (error) throw new Error(error.message)

    return ((data ?? []) as PlatformSettingRow[])
      .map(resolveSetting)
      .sort(
        (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label),
      )
  },

  /** Create a new setting row (optionally in a brand-new group). */
  createSetting: async (input: CreateSettingInput): Promise<void> => {
    const key = input.key.trim()
    const value = input.value.trim()
    const label = input.label.trim()
    const group = input.group.trim()

    if (!key) throw new Error('Key is required')
    if (!isValidSettingKey(key)) {
      throw new Error('Key must be lowercase letters, numbers and underscores (e.g. welcome_bonus_coin)')
    }
    if (!value) throw new Error('Value is required')
    if (!group) throw new Error('Group is required')

    const { data: existing, error: existingError } = await supabase
      .from('platform_settings')
      .select('id')
      .eq('key', key)
      .maybeSingle()

    if (existingError) throw new Error(existingError.message)
    if (existing) throw new Error(`A setting with key "${key}" already exists`)

    // Place the new setting at the end of its group (or the list, for a new group).
    const { data: peers, error: peersError } = await supabase
      .from('platform_settings')
      .select('sort_order, group_name')

    if (peersError) throw new Error(peersError.message)

    const rows = (peers ?? []) as { sort_order: number | null; group_name: string | null }[]
    const groupRows = rows.filter((row) => (row.group_name ?? '') === group)
    const baseRows = groupRows.length > 0 ? groupRows : rows
    const maxSort = baseRows.reduce((max, row) => Math.max(max, row.sort_order ?? 0), 0)

    const { error } = await supabase.from('platform_settings').insert({
      key,
      value,
      label: label || null,
      group_name: group,
      unit: input.unit?.trim() || null,
      description: input.description?.trim() || null,
      sort_order: maxSort + 10,
    })

    if (error) throw new Error(error.message)
  },

  /** Remove a setting entirely. */
  deleteSetting: async (key: string): Promise<void> => {
    const { error } = await supabase.from('platform_settings').delete().eq('key', key)
    if (error) throw new Error(error.message)
  },

  updateSetting: async (key: string, value: string): Promise<void> => {
    const trimmed = value.trim()
    if (!trimmed) throw new Error('Value cannot be empty')

    const previousDefaultCommission =
      key === PLATFORM_SETTING_KEYS.defaultCommissionPercent
        ? await fetchDefaultCommissionPercent()
        : null

    const { error } = await supabase
      .from('platform_settings')
      .upsert({ key, value: trimmed }, { onConflict: 'key' })

    if (error) throw new Error(error.message)

    if (key === PLATFORM_SETTING_KEYS.defaultCommissionPercent) {
      const nextDefault = Number(trimmed)
      if (!Number.isFinite(nextDefault)) {
        throw new Error('Default commission must be a number')
      }
      await syncFacultyDefaultCommissionRates(previousDefaultCommission!, nextDefault)
    }
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

    const nullFacultyIds = profileRows
      .filter((row) => row.commission_rate == null || row.commission_rate === '')
      .map((row) => row.id)

    if (nullFacultyIds.length > 0) {
      const { error: backfillError } = await supabase
        .from('profiles')
        .update({ commission_rate: defaultCommissionPercent })
        .in('id', nullFacultyIds)

      if (backfillError && !isMissingCommissionRateColumn(backfillError)) {
        throw new Error(backfillError.message)
      }

      profileRows.forEach((row) => {
        if (nullFacultyIds.includes(row.id)) {
          row.commission_rate = defaultCommissionPercent
        }
      })
    }

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

    const defaultPercent = await fetchDefaultCommissionPercent()
    const commissionRate = isSameCommissionRate(commissionPercent, defaultPercent)
      ? defaultPercent
      : commissionPercent

    const { error } = await supabase
      .from('profiles')
      .update({ commission_rate: commissionRate })
      .eq('id', facultyId)
      .eq('role', 'FACULTY')

    if (error) {
      if (isMissingCommissionRateColumn(error)) {
        throw new Error(COMMISSION_COLUMN_MIGRATION_HINT)
      }
      throw new Error(error.message)
    }
  },

  /** Reset faculty to platform default (stores the current default % in commission_rate). */
  resetFacultyCommission: async (facultyId: string): Promise<void> => {
    const defaultPercent = await fetchDefaultCommissionPercent()

    const { error } = await supabase
      .from('profiles')
      .update({ commission_rate: defaultPercent })
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
 