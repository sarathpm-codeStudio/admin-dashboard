import { GraduationCap, Mail, MessageSquare, Phone } from 'lucide-react'
import facultyAvatar from '@/asset/image/John Smith Profile.png'
import verifiedBadgeImage from '@/asset/image/Background.png'
import { Button } from '@/components/ui/Button'
import { Card, cardPaddingClass } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Header1, Paragraph } from '@/components/ui/Typography'
import type { FacultyDetail, FacultyStatus } from '@/features/faculty/data/mockFacultyDetail'
import { cn } from '@/utils/cn'

const statusVariant: Record<FacultyStatus, 'active' | 'pending' | 'suspended'> = {
  active: 'active',
  pending: 'pending',
  suspended: 'suspended',
}

const statusLabel: Record<FacultyStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  suspended: 'Suspended',
}

type FacultyProfileHeaderProps = {
  faculty: FacultyDetail
}

export function FacultyProfileHeader({ faculty }: FacultyProfileHeaderProps) {
  return (
    <Card className={cardPaddingClass}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative size-[84px] shrink-0 sm:size-[92px]">
            <div className="size-full overflow-hidden rounded-2xl">
              <img
                src={faculty.avatarUrl ?? facultyAvatar}
                alt=""
                className="size-full object-cover object-center"
              />
            </div>
            <img
              src={verifiedBadgeImage}
              alt=""
              className="absolute -bottom-1 -right-1 size-6 rounded-lg object-contain drop-shadow-md"
              aria-label="Verified faculty"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Header1 size="display" className="text-2xl sm:text-3xl">
                {faculty.name}
              </Header1>
              <StatusBadge
                label={statusLabel[faculty.status]}
                variant={statusVariant[faculty.status]}
                className="uppercase tracking-wide"
              />
            </div>
            <Paragraph
              variant="muted"
              className="mt-1 inline-flex items-center gap-1.5"
            >
              <GraduationCap className="size-4 shrink-0 text-nav" aria-hidden />
              {faculty.title}
            </Paragraph>
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
          <Button variant="outline-primary" type="button">
            Approve
          </Button>
          <Button variant="outline-danger" type="button">
            Suspend
          </Button>
          <Button type="button" className={cn('min-w-[7.5rem]')}>
            <MessageSquare className="size-4" aria-hidden />
            Message
          </Button>
        </div>
      </div>
    </Card>
  )
}
