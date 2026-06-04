import { Download, Mail } from 'lucide-react'
import facultyAvatar from '@/asset/image/John Smith Profile.png'
import { Button } from '@/components/ui/Button'
import { ProfileAvatar } from '@/components/ui/ProfileAvatar'
import { Header1 } from '@/components/ui/Typography'
import type { FacultyDetail } from '@/features/faculty/data/mockFacultyDetail'

type FacultyReviewProfileHeaderProps = {
  faculty: FacultyDetail
}

export function FacultyReviewProfileHeader({ faculty }: FacultyReviewProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <ProfileAvatar
            src={faculty.avatarUrl ?? facultyAvatar}
            alt=""
            sizeClassName="size-20 sm:size-24"
            roundedClassName="rounded-2xl"
          />
          <Header1 size="display" className="text-2xl text-[#000B60] sm:text-3xl">
            {faculty.name}
          </Header1>
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-3 self-end lg:self-auto">
          <Button
            type="button"
            variant="outline"
            className="border-[#E2E8F0] bg-white text-sm font-medium text-[#000B60] hover:bg-[#F8FAFC]"
          >
            <Download className="size-4" aria-hidden />
            Export Data
          </Button>
          <Button
            type="button"
            className="bg-[#000B60] text-sm font-medium text-white hover:opacity-90"
          >
            <Mail className="size-4" aria-hidden />
            Contact Faculty
          </Button>
        </div>
    </div>
  )
}
