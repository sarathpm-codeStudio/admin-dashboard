import type { CreateAnnouncementPayload } from '@/api/announcement/announcement.api'
import type { CreateAnnouncementFormValues } from '@/features/announcements/components/CreateAnnouncementForm'

function buildTimePeriod(values: CreateAnnouncementFormValues) {
  if (!values.startDate && !values.endDate) return null
  return {
    start_date: values.startDate || undefined,
    end_date: values.endDate || undefined,
  }
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function mapFormValuesToCreatePayload(
  values: CreateAnnouncementFormValues,
  options: { isDraft: boolean; imageUrl?: string | null },
): CreateAnnouncementPayload {
  const isDraft = options.isDraft

  return {
    title: values.name.trim(),
    audience: values.audience,
    course_id: values.audience === 'course' ? values.courseId || null : null,
    content: values.message || '',
    time_period: buildTimePeriod(values),
    image_url: options.imageUrl ?? null,
    is_draft: isDraft,
    is_deleted: false,
    published: isDraft ? null : todayDateString(),
  }
}
