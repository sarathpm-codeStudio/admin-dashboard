import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnnouncementDeleteModal } from '@/features/announcements/components/AnnouncementDeleteModal'
import { AnnouncementsFiltersBar } from '@/features/announcements/components/AnnouncementsFiltersBar'
import { AnnouncementsHeader } from '@/features/announcements/components/AnnouncementsHeader'
import { AnnouncementsTable } from '@/features/announcements/components/AnnouncementsTable'
import { mockAnnouncements } from '@/features/announcements/data/mockAnnouncements'
import type { AnnouncementRecord, AnnouncementSort, AnnouncementTab } from '@/features/announcements/types'
import { ANNOUNCEMENTS_PAGE_SIZE } from '@/features/announcements/utils/constants'
import {
  filterAnnouncements,
  paginateAnnouncements,
  sortAnnouncements,
} from '@/features/announcements/utils/filterAnnouncements'
import { useToast } from '@/hooks/useToast'

export function AnnouncementsView() {
  const navigate = useNavigate()
  const toast = useToast()
  const [announcements, setAnnouncements] = useState(mockAnnouncements)
  const [tab, setTab] = useState<AnnouncementTab>('all')
  const [sort, setSort] = useState<AnnouncementSort>('date-desc')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<AnnouncementRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredAnnouncements = useMemo(
    () => sortAnnouncements(filterAnnouncements(announcements, tab), sort),
    [announcements, tab, sort],
  )

  const { data: tableAnnouncements, total, totalPages, page: safePage } = useMemo(
    () => paginateAnnouncements(filteredAnnouncements, page, ANNOUNCEMENTS_PAGE_SIZE),
    [filteredAnnouncements, page],
  )

  const handleTabChange = (nextTab: AnnouncementTab) => {
    setTab(nextTab)
    setPage(1)
  }

  const handleSortChange = (nextSort: AnnouncementSort) => {
    setSort(nextSort)
    setPage(1)
  }

  const handleEdit = (announcement: AnnouncementRecord) => {
    navigate(`/announcements/${announcement.id}/edit`)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return

    setIsDeleting(true)
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 300))
      setAnnouncements((prev) => prev.filter((item) => item.id !== pendingDelete.id))
      toast.success('Announcement deleted successfully.', { title: 'Deleted' })
      setPendingDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto">
      <AnnouncementsHeader />
      <AnnouncementsFiltersBar
        tab={tab}
        sort={sort}
        onTabChange={handleTabChange}
        onSortChange={handleSortChange}
      />
      <AnnouncementsTable
        announcements={tableAnnouncements}
        totalCount={total}
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={setPendingDelete}
      />

      <AnnouncementDeleteModal
        announcement={pendingDelete}
        isDeleting={isDeleting}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
