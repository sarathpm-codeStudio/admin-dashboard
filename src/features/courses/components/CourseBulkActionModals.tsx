import { BookOpenCheck } from 'lucide-react'
import { useState } from 'react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Textarea } from '@/components/ui/Textarea'
import { Paragraph } from '@/components/ui/Typography'
import { useToast } from '@/hooks/useToast'

export type CourseBulkAction = 'approve' | 'reject' | 'delete'

export type CourseRejectDetails = {
  rejectionReason: string
}

type CourseBulkActionModalsProps = {
  action: CourseBulkAction | null
  selectedCount: number
  onClose: () => void
  onApprove: () => Promise<void>
  onReject: (details: CourseRejectDetails) => Promise<void>
  onDelete: () => Promise<void>
}

type ConfirmModalConfig = {
  title: string
  message: string
  confirmLabel: string
  confirmVariant: 'primary' | 'outline-danger'
}

function getConfirmModalConfig(
  action: CourseBulkAction,
  selectedCount: number,
): ConfirmModalConfig {
  const label = selectedCount === 1 ? 'course' : 'courses'
  const countLabel = String(selectedCount).padStart(2, '0')

  switch (action) {
    case 'approve':
      return {
        title: 'Approve Courses?',
        message: `This will approve ${countLabel} selected ${label} and make them available on the platform.`,
        confirmLabel: 'Confirm Approval',
        confirmVariant: 'primary',
      }
    case 'reject':
      return {
        title: 'Reason for Rejection',
        message: `Provide a reason for rejecting the selected ${label}.`,
        confirmLabel: 'Reject',
        confirmVariant: 'outline-danger',
      }
    case 'delete':
      return {
        title: 'Delete Courses?',
        message: `Are you sure you want to delete ${countLabel} selected ${label}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmVariant: 'outline-danger',
      }
  }
}

function getLoadingMessage(action: CourseBulkAction, selectedCount: number): string {
  const label = selectedCount === 1 ? 'course' : 'courses'
  switch (action) {
    case 'approve':
      return `Approving ${selectedCount} ${label}...`
    case 'reject':
      return `Rejecting ${selectedCount} ${label}...`
    case 'delete':
      return `Deleting ${selectedCount} ${label}...`
  }
}

function getSuccessMessage(action: CourseBulkAction, selectedCount: number): string {
  const label = selectedCount === 1 ? 'course has' : 'courses have'
  switch (action) {
    case 'approve':
      return `${selectedCount} ${label} been approved.`
    case 'reject':
      return `${selectedCount} ${label} been rejected.`
    case 'delete':
      return `${selectedCount} ${label} been deleted.`
  }
}

export function CourseBulkActionModals({
  action,
  selectedCount,
  onClose,
  onApprove,
  onReject,
  onDelete,
}: CourseBulkActionModalsProps) {
  const toast = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const closeModal = () => {
    setRejectionReason('')
    onClose()
  }

  const confirmConfig = action ? getConfirmModalConfig(action, selectedCount) : null

  const handleConfirm = async () => {
    if (!action) return

    setIsUpdating(true)
    const loadingToastId = toast.info(getLoadingMessage(action, selectedCount), {
      title: 'Updating courses',
      duration: 60_000,
    })

    try {
      if (action === 'approve') await onApprove()
      if (action === 'reject')
        await onReject({ rejectionReason: rejectionReason.trim() })
      if (action === 'delete') await onDelete()

      toast.dismiss(loadingToastId)
      toast.success(getSuccessMessage(action, selectedCount), {
        title: 'Courses updated',
      })
      closeModal()
    } catch (error) {
      toast.dismiss(loadingToastId)
      const message = error instanceof Error ? error.message : 'Failed to update courses.'
      toast.error(message, { title: 'Update failed' })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <ConfirmModal
      open={action !== null}
      onClose={() => !isUpdating && closeModal()}
      onConfirm={handleConfirm}
      title={confirmConfig?.title ?? ''}
      message={confirmConfig?.message ?? ''}
      confirmLabel={isUpdating ? 'Updating...' : (confirmConfig?.confirmLabel ?? 'Confirm')}
      confirmVariant={confirmConfig?.confirmVariant ?? 'primary'}
      cancelLabel="Cancel"
      isLoading={isUpdating}
      layout={action === 'approve' ? 'centered' : 'default'}
      icon={action === 'approve' ? <BookOpenCheck className="size-6" aria-hidden /> : undefined}
      footnote={
        action === 'approve'
          ? 'By confirming, you agree that these courses meet platform quality and policy standards.'
          : undefined
      }
      confirmDisabled={action === 'reject' && !rejectionReason.trim()}
    >
      {action === 'reject' ? (
        <div className="space-y-2">
          <Paragraph
            variant="small"
            className="font-semibold uppercase tracking-wide text-nav"
          >
            Rejection Reason
          </Paragraph>
          <Textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Explain why these courses are being rejected..."
            disabled={isUpdating}
          />
        </div>
      ) : null}
    </ConfirmModal>
  )
}
