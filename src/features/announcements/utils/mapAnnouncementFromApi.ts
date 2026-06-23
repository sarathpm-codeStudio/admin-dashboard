import type { AnnouncementListRow } from '@/api/announcement/announcement.api'
import type { AnnouncementRecord, AnnouncementStatus } from '@/features/announcements/types'

const audienceLabel: Record<string, string> = {
  all: 'All Users',
  students: 'Students',
  faculty: 'Faculty',
  course: 'Selected Course',
}

function formatDisplayDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatShortDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

function parseTimePeriod(
  timePeriod: AnnouncementListRow['time_period'],
): { start_date?: string; end_date?: string } | null {
  if (!timePeriod) return null
  if (typeof timePeriod === 'string') {
    try {
      return JSON.parse(timePeriod) as { start_date?: string; end_date?: string }
    } catch {
      return null
    }
  }
  return timePeriod
}

function formatTimePeriod(timePeriod: AnnouncementListRow['time_period']): string {
  const parsed = parseTimePeriod(timePeriod)
  if (!parsed) return '—'

  const start = parsed.start_date
  const end = parsed.end_date
  if (start && end) return `${formatShortDate(start)} – ${formatShortDate(end)}`
  if (start) return formatShortDate(start)
  return '—'
}

function deriveStatus(row: AnnouncementListRow): AnnouncementStatus {
  if (row.is_draft) return 'draft'

  const timePeriod = parseTimePeriod(row.time_period)
  const now = new Date()

  if (timePeriod?.start_date) {
    const start = new Date(timePeriod.start_date)
    if (!Number.isNaN(start.getTime()) && start > now) return 'scheduled'
  }
  if (timePeriod?.end_date) {
    const end = new Date(timePeriod.end_date)
    if (!Number.isNaN(end.getTime()) && end < now) return 'expired'
  }

  return 'active'
}

function resolveCourseTitle(row: AnnouncementListRow): string {
  const courseRaw = row.courses
  const course = Array.isArray(courseRaw) ? courseRaw[0] : courseRaw
  return course?.title ?? '—'
}

function resolveAudienceLabel(row: AnnouncementListRow): string {
  if (!row.audience) return '—'
  return audienceLabel[row.audience] ?? row.audience
}

export function mapAnnouncementListRowToRecord(row: AnnouncementListRow): AnnouncementRecord {
  return {
    id: row.id,
    name: row.title?.trim() || 'Untitled announcement',
    audience: resolveAudienceLabel(row),
    course: resolveCourseTitle(row),
    date: formatDisplayDate(row.created_at),
    dateSort: row.created_at,
    timePeriod: formatTimePeriod(row.time_period),
    status: deriveStatus(row),
    isDraft: row.is_draft,
  }
}
