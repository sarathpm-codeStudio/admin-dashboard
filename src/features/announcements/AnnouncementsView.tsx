import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnnouncementDeleteModal } from '@/features/announcements/components/AnnouncementDeleteModal'
import { AnnouncementsFiltersBar } from '@/features/announcements/components/AnnouncementsFiltersBar'
import { AnnouncementsHeader } from '@/features/announcements/components/AnnouncementsHeader'
import { AnnouncementsTable } from '@/features/announcements/components/AnnouncementsTable'
import {
  useDeleteAnnouncement,
  useGetAnnouncements,
} from '@/features/announcements/hooks/useAnnouncement'
import type { AnnouncementRecord, AnnouncementSort, AnnouncementTab } from '@/features/announcements/types'
import { ANNOUNCEMENTS_PAGE_SIZE } from '@/features/announcements/utils/constants'
import { mapAnnouncementListRowToRecord } from '@/features/announcements/utils/mapAnnouncementFromApi'
import { useToast } from '@/hooks/useToast'

export function AnnouncementsView() {
  const navigate = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState<AnnouncementTab>('all')
  const [sort, setSort] = useState<AnnouncementSort>('date-desc')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<AnnouncementRecord | null>(null)

  const { data, isLoading } = useGetAnnouncements(page, ANNOUNCEMENTS_PAGE_SIZE, tab, sort)
  const deleteAnnouncement = useDeleteAnnouncement()

  const tableAnnouncements = useMemo(
    () => (data?.data ?? []).map(mapAnnouncementListRowToRecord),
    [data?.data],
  )

  const pagination = data?.pagination
  const totalCount = pagination?.total ?? 0
  const totalPages = Math.max(1, pagination?.total_pages ?? 1)

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

    try {
      await deleteAnnouncement.mutateAsync(pendingDelete.id)
      toast.success('Announcement deleted successfully.', { title: 'Deleted' })
      setPendingDelete(null)
    } catch {
      toast.error('Could not delete announcement. Please try again.', { title: 'Delete failed' })
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
        totalCount={totalCount}
        page={pagination?.current_page ?? page}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={setPendingDelete}
        isLoading={isLoading}
      />

      <AnnouncementDeleteModal
        announcement={pendingDelete}
        isDeleting={deleteAnnouncement.isPending}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
