import type { AnnouncementListRow } from '@/api/announcement/announcement.api'
import type { CreateAnnouncementFormValues } from '@/features/announcements/components/CreateAnnouncementForm'
import { parseTimePeriod } from '@/features/announcements/utils/mapAnnouncementFromApi'

function toDateInputValue(value?: string): string {
  if (!value) return ''
  return value.slice(0, 10)
}

export function mapAnnouncementRowToFormValues(
  row: AnnouncementListRow,
): CreateAnnouncementFormValues {
  const timePeriod = parseTimePeriod(row.time_period)

  return {
    name: row.title ?? '',
    audience: row.audience ?? '',
    courseId: row.course_id ?? '',
    startDate: toDateInputValue(timePeriod?.start_date),
    endDate: toDateInputValue(timePeriod?.end_date),
    message: row.content ?? '',
  }
}
