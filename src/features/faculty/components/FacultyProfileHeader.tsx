import { Mail, MessageSquare, Phone } from 'lucide-react'
import { useState } from 'react'
import { FaUser } from 'react-icons/fa'
import verifiedBadgeImage from '@/asset/image/Background.png'
import { Button } from '@/components/ui/Button'
import { Card, cardPaddingClass } from '@/components/ui/Card'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Header1, Paragraph } from '@/components/ui/Typography'
import type { FacultyDetail, FacultyStatus } from '@/features/faculty/data/mockFacultyDetail'
import { cn } from '@/utils/cn'

const statusVariant: Record<
  FacultyStatus,
  'active' | 'pending' | 'rejected' | 'suspended'
> = {
  active: 'active',
  pending: 'pending',
  rejected: 'rejected',
  suspended: 'suspended',
}

const statusLabel: Record<FacultyStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  rejected: 'Rejected',
  suspended: 'Suspended',
}

function resolveFacultyStatus(
  isSuspended?: boolean,
  accountVerified?: string,
): FacultyStatus {
  if (isSuspended) return 'suspended'
  if (accountVerified === 'APPROVED') return 'active'
  if (accountVerified === 'PENDING') return 'pending'
  if (accountVerified === 'REJECTED') return 'rejected'
  return 'pending'
}

type FacultyProfileHeaderProps = {
  faculty: FacultyDetail
  isSuspended?: boolean
  accountVerified?: string
}

const headerButtonClass =
  'outline-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 active:outline-none'

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
        title: 'Approve faculty',
        message: `Are you sure you want to approve ${facultyName}? They will be granted faculty access.`,
        confirmLabel: 'Approved',
        confirmVariant: 'primary',
      }
    case 'reject':
      return {
        title: 'Reject faculty',
        message: `Are you sure you want to reject ${facultyName}? Their application will be declined.`,
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
) {
  switch (profileStatus) {
    case 'active':
      return (
        <Button
          variant="secondary"
          type="button"
          className={cn(headerButtonClass, 'text-red-600 hover:bg-red-50')}
          onClick={handlers.onSuspend}
        >
          Suspend
        </Button>
      )
    case 'pending':
      return (
        <>
          <Button
            variant="secondary"
            type="button"
            className={cn(headerButtonClass, 'text-primary hover:bg-primary-50')}
            onClick={handlers.onApprove}
          >
            Approved
          </Button>
          <Button
            variant="secondary"
            type="button"
            className={cn(headerButtonClass, 'text-red-600 hover:bg-red-50')}
            onClick={handlers.onReject}
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
          className={cn(headerButtonClass, 'text-primary hover:bg-primary-50')}
          onClick={handlers.onApprove}
        >
          Approved
        </Button>
      )
    case 'suspended':
      return (
        <Button
          variant="secondary"
          type="button"
          className={cn(headerButtonClass, 'text-primary hover:bg-primary-50')}
          onClick={handlers.onActivate}
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
}: FacultyProfileHeaderProps) {
  const profileStatus =
    isSuspended === undefined && accountVerified === undefined
      ? faculty.status
      : resolveFacultyStatus(isSuspended, accountVerified)

  const [confirmAction, setConfirmAction] = useState<FacultyConfirmAction | null>(null)

  const confirmConfig = confirmAction
    ? getConfirmModalConfig(confirmAction, faculty.name)
    : null

  const handleConfirm = () => {
    setConfirmAction(null)
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
                className="flex size-full items-center justify-center rounded-2xl bg-[#DFE0FF] text-[#000B60]"
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
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {renderStatusActions(profileStatus, actionHandlers)}
          <Button type="button" className={cn(headerButtonClass, 'min-w-[7.5rem]')}>
            <MessageSquare className="size-4" aria-hidden />
            Message
          </Button>
        </div>
      </div>
    </Card>

    <ConfirmModal
      open={confirmAction !== null}
      onClose={() => setConfirmAction(null)}
      onConfirm={handleConfirm}
      title={confirmConfig?.title ?? ''}
      message={confirmConfig?.message ?? ''}
      confirmLabel={confirmConfig?.confirmLabel ?? 'Confirm'}
      confirmVariant={confirmConfig?.confirmVariant ?? 'primary'}
      cancelLabel="Cancel"
    />
    </>
  )
}
