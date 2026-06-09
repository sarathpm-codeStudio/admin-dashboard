import {
  Clock,
  // GraduationCap,
  Mail,
  MessageSquare,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { FaRegIdCard, FaUser } from 'react-icons/fa'
import { FaKey } from 'react-icons/fa6'
import { LuPhoneCall } from 'react-icons/lu'
import type { IconType } from 'react-icons'
import { Button } from '@/components/ui/Button'
import { ProfileAvatar } from '@/components/ui/ProfileAvatar'
import { Header1, Paragraph } from '@/components/ui/Typography'
import type { StudentDetail } from '@/features/student/data/mockStudentDetail'
import { cn } from '@/utils/cn'

const profileTextClass = 'text-ink-label'
const metaIconClass = 'size-4 shrink-0 text-[#00A6BF]'

type MetaField = {
  icon: LucideIcon | IconType
  text: string
}

type StudentProfileHeaderProps = {
  student: StudentDetail
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
      // { icon: GraduationCap, text: student.course },
      { icon: Clock, text: `Recent active : ${student.recentActive}` },
      { icon: LuPhoneCall, text: student.phone },
    ],
    [
      // { icon: Clock, text: `Last login : ${student.lastLogin}` },
      { icon: Mail, text: student.email },
    ],
  ]
}

const profileAvatarSizeClass = 'size-[126px] shrink-0 sm:size-[136px]'

export function StudentProfileHeader({ student }: StudentProfileHeaderProps) {
  const metaColumns = getMetaColumns(student)

  return (
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
              'mt-0 flex items-center justify-center rounded-[14px] bg-[#DFE0FF] text-[#000B60]',
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
          className="w-full justify-center gap-2 py-2.5 text-xs font-semibold"
        >
          <MessageSquare className="size-3.5 shrink-0" aria-hidden />
          Message Student
        </Button>
        <button
          type="button"
          className="flex w-full items-center justify-center rounded-nav bg-surface-input py-2.5 text-xs font-semibold text-red-600 transition-colors hover:text-red-700"
        >
          Block
        </button>
      </div>
    </div>
  )
}
