import { Clock, Mail, MessageSquare, Phone, UserCheck } from 'lucide-react'
import { useState } from 'react'
import { FaUser } from 'react-icons/fa'
import verifiedBadgeImage from '@/asset/image/Background.png'
import { Button } from '@/components/ui/Button'
import { Card, cardPaddingClass } from '@/components/ui/Card'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Textarea } from '@/components/ui/Textarea'
import { Header1, Paragraph } from '@/components/ui/Typography'
import type { FacultyDetail, FacultyStatus } from '@/features/faculty/data/mockFacultyDetail'
import { useToast } from '@/hooks/useToast'
import { useOpenChat } from '@/features/chat/hooks/useChat'

const statusVariant: Record<
  FacultyStatus,
  'active' | 'pending' | 'rejected' | 'suspended' | 'info'
> = {
  active: 'active',
  pending: 'pending',
  rejected: 'rejected',
  suspended: 'suspended',
  resubmitted: 'info',
}

const statusLabel: Record<FacultyStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  rejected: 'Rejected',
  suspended: 'Suspended',
  resubmitted: 'Resubmitted',
}

function resolveFacultyStatus(
  isSuspended?: boolean,
  accountVerified?: string,
): FacultyStatus {
  if (isSuspended) return 'suspended'
  if (accountVerified === 'APPROVED') return 'active'
  if (accountVerified === 'PENDING') return 'pending'
  if (accountVerified === 'REJECTED') return 'rejected'
  if (accountVerified === 'RESUBMITTED') return 'resubmitted'
  return 'pending'
}

function getLoadingMessage(action: FacultyConfirmAction, facultyName: string): string {
  switch (action) {
    case 'approve':
      return `Approving ${facultyName}...`
    case 'reject':
      return `Rejecting ${facultyName}...`
    case 'suspend':
      return `Suspending ${facultyName}...`
    case 'activate':
      return `Activating ${facultyName}...`
  }
}

function getSuccessMessage(action: FacultyConfirmAction, facultyName: string): string {
  switch (action) {
    case 'approve':
      return `${facultyName} has been approved.`
    case 'reject':
      return `${facultyName} has been rejected.`
    case 'suspend':
      return `${facultyName} has been suspended.`
    case 'activate':
      return `${facultyName} has been activated.`
  }
}

export type FacultyRejectDetails = {
  reasons: string[]
  note: string
}

const REJECT_REASONS = [
  'Incomplete profile',
  'Invalid documents',
  'Insufficient experience',
] as const

type FacultyProfileHeaderProps = {
  faculty: FacultyDetail
  isSuspended?: boolean
  accountVerified?: string
  onApprove?: () => void | Promise<void>
  onReject?: (details: FacultyRejectDetails) => void | Promise<void>
  onSuspend?: () => void | Promise<void>
  onActivate?: () => void | Promise<void>
}
type FacultyConfirmAction = 'approve' | 'reject' | 'suspend' | 'activate'

type ConfirmModalConfig = {
  title: string
  message: string
  confirmLabel: string
  confirmVariant: 'primary' | 'outline-danger'
}

function getConfirmModalConfig(
  action: FacultyConfirmAction,
  facultyName: string,
): ConfirmModalConfig {
  switch (action) {
    case 'approve':
      return {
        title: 'Approve Faculty?',
        message:
          'This will grant the instructor immediate dashboard access and activate their university profile.',
        confirmLabel: 'Confirm Approval',
        confirmVariant: 'primary',
      }
    case 'reject':
      return {
        title: 'Select Reason for Rejection',
        message: `Select why ${facultyName}'s application is being declined.`,
        confirmLabel: 'Reject',
        confirmVariant: 'outline-danger',
      }
    case 'suspend':
      return {
        title: 'Suspend faculty',
        message: `Are you sure you want to suspend ${facultyName}? They will lose access until reactivated.`,
        confirmLabel: 'Suspend',
        confirmVariant: 'outline-danger',
      }
    case 'activate':
      return {
        title: 'Activate faculty',
        message: `Are you sure you want to activate ${facultyName}? They will regain access to the platform.`,
        confirmLabel: 'Activate',
        confirmVariant: 'primary',
      }
  }
}

type StatusActionHandlers = {
  onApprove: () => void
  onReject: () => void
  onSuspend: () => void
  onActivate: () => void
}

function renderStatusActions(
  profileStatus: FacultyStatus,
  handlers: StatusActionHandlers,
  disabled = false,
) {
  switch (profileStatus) {
    case 'active':
      return (
        <Button
          variant="secondary"
          type="button"
          className="text-red-600 !w-[120px] hover:bg-red-50"
          onClick={handlers.onSuspend}
          disabled={disabled}
        >
          Suspend
        </Button>
      )
    case 'pending':
    case 'resubmitted':
      return (
        <>
          <Button
            variant="secondary"
            type="button"
            className="text-primary hover:bg-primary-50"
            onClick={handlers.onApprove}
            disabled={disabled}
          >
            Approve
          </Button>
          <Button
            variant="secondary"
            type="button"
            className="text-red-600 hover:bg-red-50"
            onClick={handlers.onReject}
            disabled={disabled}
          >
            Reject
          </Button>
        </>
      )
    case 'rejected':
      return (
        <Button
          variant="secondary"
          type="button"
          className="text-primary hover:bg-primary-50"
          onClick={handlers.onApprove}
          disabled={disabled}
        >
          Approved
        </Button>
      )
    case 'suspended':
      return (
        <Button
          variant="secondary"
          type="button"
          className="text-primary hover:bg-primary-50"
          onClick={handlers.onActivate}
          disabled={disabled}
        >
          Activate
        </Button>
      )
    default:
      return null
  }
}

export function FacultyProfileHeader({
  faculty,
  isSuspended,
  accountVerified,
  onApprove,
  onReject,
  onSuspend,
  onActivate,
}: FacultyProfileHeaderProps) {
  const profileStatus =
    isSuspended === undefined && accountVerified === undefined
      ? faculty.status
      : resolveFacultyStatus(isSuspended, accountVerified)

  const toast = useToast()
  const { openChat, isPending: isOpeningChat } = useOpenChat()
  const [confirmAction, setConfirmAction] = useState<FacultyConfirmAction | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [rejectReasons, setRejectReasons] = useState<string[]>([])
  const [rejectNote, setRejectNote] = useState('')

  const handleMessage = () => {
    openChat(faculty.id, {
      onError: (error) => toast.error(error.message || 'Could not open chat'),
    })
  }

  const toggleRejectReason = (reason: string) => {
    setRejectReasons((current) =>
      current.includes(reason)
        ? current.filter((item) => item !== reason)
        : [...current, reason],
    )
  }

  const closeConfirm = () => {
    setConfirmAction(null)
    setRejectReasons([])
    setRejectNote('')
  }

  const confirmConfig = confirmAction
    ? getConfirmModalConfig(confirmAction, faculty.name)
    : null

  const handleConfirm = async () => {
    if (!confirmAction) return

    setIsUpdating(true)
    const loadingToastId = toast.info(getLoadingMessage(confirmAction, faculty.name), {
      title: 'Updating status',
      duration: 60_000,
    })

    try {
      if (confirmAction === 'approve') await onApprove?.()
      if (confirmAction === 'reject')
        await onReject?.({ reasons: rejectReasons, note: rejectNote.trim() })
      if (confirmAction === 'suspend') await onSuspend?.()
      if (confirmAction === 'activate') await onActivate?.()

      toast.dismiss(loadingToastId)
      toast.success(getSuccessMessage(confirmAction, faculty.name), {
        title: 'Status updated',
      })
      closeConfirm()
    } catch (error) {
      toast.dismiss(loadingToastId)
      const message =
        error instanceof Error ? error.message : 'Failed to update faculty status.'
      toast.error(message, { title: 'Update failed' })
    } finally {
      setIsUpdating(false)
    }
  }
  const actionHandlers: StatusActionHandlers = {
    onApprove: () => setConfirmAction('approve'),
    onReject: () => setConfirmAction('reject'),
    onSuspend: () => setConfirmAction('suspend'),
    onActivate: () => setConfirmAction('activate'),
  }

  return (
    <>
      <Card className={cardPaddingClass}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative size-[84px] shrink-0 sm:size-[92px]">
              {faculty.avatarUrl ? (
                <div className="size-full overflow-hidden rounded-2xl">
                  <img
                    src={faculty.avatarUrl}
                    alt={faculty.name}
                    className="size-full object-cover object-center"
                  />
                </div>
              ) : (
                <div
                  className="flex size-full items-center justify-center rounded-2xl bg-[#DFE0FF] text-[#2c1452]"
                  aria-label={`${faculty.name} profile`}
                >
                  <FaUser className="size-10 sm:size-11" aria-hidden />
                </div>
              )}
              {profileStatus === 'active' ? (
                <img
                  src={verifiedBadgeImage}
                  alt=""
                  className="absolute -bottom-1 -right-1 size-6 rounded-lg object-contain drop-shadow-md"
                  aria-label="Verified faculty"
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Header1 size="display" className="text-2xl sm:text-3xl">
                  {faculty.name}
                </Header1>
                <StatusBadge
                  label={statusLabel[profileStatus]}
                  variant={statusVariant[profileStatus]}
                  className="uppercase tracking-wide"
                />
              </div>
              {/* <Paragraph
              variant="muted"
              className="mt-1 inline-flex items-center gap-1.5"
            >
              <GraduationCap className="size-4 shrink-0 text-nav" aria-hidden />
              {faculty.title}
            </Paragraph> */}
              <div className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-4">
                <Paragraph
                  variant="small"
                  className="inline-flex items-center gap-2 text-nav"
                >
                  <Mail className="size-4 shrink-0" aria-hidden />
                  {faculty.email}
                </Paragraph>
                <Paragraph
                  variant="small"
                  className="inline-flex items-center gap-2 text-nav"
                >
                  <Phone className="size-4 shrink-0" aria-hidden />
                  {faculty.phone}
                </Paragraph>
                {faculty.recentActive ? (
                  <Paragraph
                    variant="small"
                    className="inline-flex items-center gap-2 text-nav"
                  >
                    <Clock className="size-4 shrink-0" aria-hidden />
                    Recent active : {faculty.recentActive}
                  </Paragraph>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {renderStatusActions(profileStatus, actionHandlers, isUpdating)}
            <Button
              type="button"
              onClick={handleMessage}
              className="min-w-[7.5rem]"
              disabled={isUpdating || isOpeningChat}
            >
              <MessageSquare className="size-4" aria-hidden />
              {isOpeningChat ? 'Opening…' : 'Message'}
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmModal
        open={confirmAction !== null}
        onClose={() => !isUpdating && closeConfirm()}
        onConfirm={handleConfirm}
        title={confirmConfig?.title ?? ''}
        message={confirmConfig?.message ?? ''}
        confirmLabel={isUpdating ? 'Updating...' : (confirmConfig?.confirmLabel ?? 'Confirm')}
        confirmVariant={confirmConfig?.confirmVariant ?? 'primary'}
        cancelLabel="Cancel"
        isLoading={isUpdating}
        layout={confirmAction === 'approve' ? 'centered' : 'default'}
        icon={confirmAction === 'approve' ? <UserCheck className="size-6" aria-hidden /> : undefined}
        footnote={
          confirmAction === 'approve'
            ? 'By confirming, you agree to the University Employment Terms and automated onboarding procedures.'
            : undefined
        }
        confirmDisabled={confirmAction === 'reject' && rejectReasons.length === 0}
      >
        {confirmAction === 'reject' ? (
          <div className="space-y-4">
            <fieldset className="space-y-2" disabled={isUpdating}>
              {REJECT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex cursor-pointer items-center gap-3 text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    checked={rejectReasons.includes(reason)}
                    onChange={() => toggleRejectReason(reason)}
                    className="size-4 rounded border-[#cbd5e1] text-primary focus:ring-primary-50"
                  />
                  {reason}
                </label>
              ))}
            </fieldset>

            <div className="space-y-2">
              <Paragraph
                variant="small"
                className="font-semibold uppercase tracking-wide text-nav"
              >
                Additional Internal Notes
              </Paragraph>
              <Textarea
                value={rejectNote}
                onChange={(event) => setRejectNote(event.target.value)}
                placeholder="Explain the decision for the administrative record..."
                disabled={isUpdating}
              />
            </div>
          </div>
        ) : null}
      </ConfirmModal>
    </>
  )
}
