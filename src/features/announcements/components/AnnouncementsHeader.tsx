import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClassName } from '@/components/ui/Button'
import { Header1, Paragraph } from '@/components/ui/Typography'

export function AnnouncementsHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <Header1>Announcements</Header1>
        <Paragraph variant="muted" className="mt-1 max-w-2xl">
          Create and manage platform-wide and course-specific announcements
        </Paragraph>
      </div>
      <Link to="/announcements/create" className={buttonClassName('primary', 'shrink-0 no-underline')}>
        <Plus className="size-4" aria-hidden />
        Create Announcement
      </Link>
    </div>
  )
}
