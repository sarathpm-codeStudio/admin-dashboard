import type {
  AnnouncementRecord,
  AnnouncementSort,
  AnnouncementTab,
} from '@/features/announcements/types'

export function filterAnnouncements(
  announcements: AnnouncementRecord[],
  tab: AnnouncementTab,
): AnnouncementRecord[] {
  if (tab === 'drafts') {
    return announcements.filter((item) => item.isDraft)
  }
  return announcements.filter((item) => !item.isDraft)
}

export function sortAnnouncements(
  announcements: AnnouncementRecord[],
  sort: AnnouncementSort,
): AnnouncementRecord[] {
  const sorted = [...announcements]
  sorted.sort((a, b) => {
    const cmp = a.dateSort.localeCompare(b.dateSort)
    return sort === 'date-desc' ? -cmp : cmp
  })
  return sorted
}

export function paginateAnnouncements<T>(items: T[], page: number, pageSize: number) {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize

  return {
    data: items.slice(start, start + pageSize),
    total,
    totalPages,
    page: safePage,
  }
}
