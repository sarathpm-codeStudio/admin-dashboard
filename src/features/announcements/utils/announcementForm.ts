import type { CreateAnnouncementFormValues } from '@/features/announcements/components/CreateAnnouncementForm'
import { mockAnnouncements } from '@/features/announcements/data/mockAnnouncements'
import type { AnnouncementRecord } from '@/features/announcements/types'

const audienceToFormValue: Record<string, string> = {
  'All Users': 'all',
  Students: 'students',
  Faculty: 'faculty',
  'Selected Course': 'course',
}

export function getAnnouncementById(id: string): AnnouncementRecord | undefined {
  return mockAnnouncements.find((item) => item.id === id)
}

export function announcementToFormValues(
  announcement: AnnouncementRecord,
): CreateAnnouncementFormValues {
  const hasCourse = announcement.course && announcement.course !== '—'

  return {
    name: announcement.name,
    audience: hasCourse ? 'course' : (audienceToFormValue[announcement.audience] ?? ''),
    courseId: '',
    startDate: announcement.dateSort,
    endDate: announcement.dateSort,
    message: '',
  }
}
