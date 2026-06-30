import { useState } from 'react'
import {
  Clock,
  Mail,
  MessageSquare,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { FaRegIdCard, FaUser } from 'react-icons/fa'
import { FaKey } from 'react-icons/fa6'
import { LuPhoneCall } from 'react-icons/lu'
import type { IconType } from 'react-icons'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ProfileAvatar } from '@/components/ui/ProfileAvatar'
import { Header1, Paragraph } from '@/components/ui/Typography'
import { useOpenChat } from '@/features/chat/hooks/useChat'
import type { StudentDetail } from '@/features/student/data/mockStudentDetail'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

const profileTextClass = 'text-ink-label'
const metaIconClass = 'size-4 shrink-0 text-[#00A6BF]'

type MetaField = {
  icon: LucideIcon | IconType
  text: string
}

type StudentBlockAction = 'block' | 'unblock'

type StudentProfileHeaderProps = {
  student: StudentDetail
  isSuspended?: boolean
  onBlock?: () => void | Promise<void>
  onUnblock?: () => void | Promise<void>
}

function formatStudentId(studentId: string): string {
  return studentId.replace(/-/, ' - ')
}

function MetaItem({ icon: Icon, text }: MetaField) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className={metaIconClass} aria-hidden />
      <Paragraph
        className={cn(
          'whitespace-nowrap text-xs font-medium leading-normal',
          profileTextClass,
        )}
      >
        {text}
      </Paragraph>
    </div>
  )
}

function getMetaColumns(student: StudentDetail): MetaField[][] {
  return [
    [
      { icon: FaRegIdCard, text: `ID: ${formatStudentId(student.studentId)}` },
      { icon: FaKey, text: `Joined ${student.joined}` },
    ],
    [
      { icon: Clock, text: `Recent active : ${student.recentActive}` },
      { icon: LuPhoneCall, text: student.phone },
    ],
    [
      { icon: Mail, text: student.email },
    ],
  ]
}

const profileAvatarSizeClass = 'size-[126px] shrink-0 sm:size-[136px]'

function getConfirmConfig(action: StudentBlockAction, studentName: string) {
  if (action === 'block') {
    return {
      title: 'Block student',
      message: `Are you sure you want to block ${studentName}? They will lose access until unblocked.`,
      confirmLabel: 'Block',
      confirmVariant: 'outline-danger' as const,
    }
  }
  return {
    title: 'Unblock student',
    message: `Are you sure you want to unblock ${studentName}? They will regain access to the platform.`,
    confirmLabel: 'Unblock',
    confirmVariant: 'primary' as const,
  }
}

export function StudentProfileHeader({
  student,
  isSuspended = false,
  onBlock,
  onUnblock,
}: StudentProfileHeaderProps) {
  const toast = useToast()
  const { openChat, isPending: isOpeningChat } = useOpenChat()
  const metaColumns = getMetaColumns(student)
  const [confirmAction, setConfirmAction] = useState<StudentBlockAction | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleMessage = () => {
    openChat(student.id, {
      onError: (error) => toast.error(error.message || 'Could not open chat'),
    })
  }

  const confirmConfig = confirmAction
    ? getConfirmConfig(confirmAction, student.name)
    : null

  const handleConfirm = async () => {
    if (!confirmAction) return

    setIsUpdating(true)
    const loadingMessage =
      confirmAction === 'block' ? `Blocking ${student.name}...` : `Unblocking ${student.name}...`
    const loadingToastId = toast.info(loadingMessage, {
      title: 'Updating status',
      duration: 60_000,
    })

    try {
      if (confirmAction === 'block') await onBlock?.()
      if (confirmAction === 'unblock') await onUnblock?.()

      toast.dismiss(loadingToastId)
      toast.success(
        confirmAction === 'block'
          ? `${student.name} has been blocked.`
          : `${student.name} has been unblocked.`,
        { title: 'Status updated' },
      )
      setConfirmAction(null)
    } catch (error) {
      toast.dismiss(loadingToastId)
      const message =
        error instanceof Error ? error.message : 'Failed to update student status.'
      toast.error(message, { title: 'Update failed' })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-6 sm:gap-8">
          {student.avatarUrl ? (
            <ProfileAvatar
              src={student.avatarUrl}
              alt={student.name}
              sizeClassName={profileAvatarSizeClass}
              roundedClassName="rounded-[14px]"
              className="mt-0"
            />
          ) : (
            <div
              className={cn(
                'mt-0 flex items-center justify-center rounded-[14px] bg-[#DFE0FF] text-[#2c1452]',
                profileAvatarSizeClass,
              )}
              aria-label={`${student.name} profile`}
            >
              <FaUser className="size-12 sm:size-14" aria-hidden />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <Header1
              size="display"
              className="text-xl font-bold text-ink-heading sm:text-2xl"
            >
              {student.name}
            </Header1>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6 md:gap-8">
              {metaColumns.map((column) => (
                <div key={column[0]?.text} className="flex flex-col gap-3">
                  {column.map((field) => (
                    <MetaItem key={field.text} {...field} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-[13rem] shrink-0 flex-col gap-2 self-end lg:self-auto">
          <Button
            type="button"
            onClick={handleMessage}
            className="w-full justify-center gap-2 py-2.5 text-xs font-semibold"
            disabled={isUpdating || isOpeningChat}
          >
            <MessageSquare className="size-3.5 shrink-0" aria-hidden />
            {isOpeningChat ? 'Opening…' : 'Message Student'}
          </Button>
          {isSuspended ? (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => setConfirmAction('unblock')}
              className="flex w-full items-center justify-center rounded-nav bg-surface-input py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-50 disabled:opacity-50"
            >
              Unblock
            </button>
          ) : (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => setConfirmAction('block')}
              className="flex w-full items-center justify-center rounded-nav bg-surface-input py-2.5 text-xs font-semibold text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
            >
              Block
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmAction !== null}
        onClose={() => !isUpdating && setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={confirmConfig?.title ?? ''}
        message={confirmConfig?.message ?? ''}
        confirmLabel={isUpdating ? 'Updating...' : (confirmConfig?.confirmLabel ?? 'Confirm')}
        confirmVariant={confirmConfig?.confirmVariant ?? 'primary'}
        cancelLabel="Cancel"
        isLoading={isUpdating}
      />
    </>
  )
}
