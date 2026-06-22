import { ConfirmModal } from '@/components/ui/ConfirmModal'
import type { AnnouncementRecord } from '@/features/announcements/types'

type AnnouncementDeleteModalProps = {
  announcement: AnnouncementRecord | null
  isDeleting?: boolean
  onClose: () => void
  onConfirm: () => void
}

export function AnnouncementDeleteModal({
  announcement,
  isDeleting = false,
  onClose,
  onConfirm,
}: AnnouncementDeleteModalProps) {
  return (
    <ConfirmModal
      open={announcement != null}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Announcement?"
      message={
        announcement
          ? `Are you sure you want to delete "${announcement.name}"? This action cannot be undone.`
          : ''
      }
      confirmLabel="Delete"
      confirmVariant="outline-danger"
      isLoading={isDeleting}
    />
  )
}
