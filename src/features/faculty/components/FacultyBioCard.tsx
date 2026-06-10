import { UserRound } from 'lucide-react'
import { Card, CardBody, cardPaddingClass } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Paragraph } from '@/components/ui/Typography'
import {
  FACULTY_PROFILE_CARD_HEIGHT,
  FACULTY_PROFILE_CARD_SCROLL_CLASS,
} from '@/features/faculty/utils/constants'
import { cn } from '@/utils/cn'

type FacultyBioCardProps = {
  bio: string
  className?: string
}

export function FacultyBioCard({ bio, className }: FacultyBioCardProps) {
  return (
    <Card
      className={cn(
        cardPaddingClass,
        FACULTY_PROFILE_CARD_HEIGHT,
        'flex flex-col overflow-hidden',
        className,
      )}
    >
      <CardBody className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SectionHeader
          title="Professional Bio"
          icon={UserRound}
          titleSize="card"
          className="shrink-0 items-center"
        />
        <div className={FACULTY_PROFILE_CARD_SCROLL_CLASS}>
          <Paragraph variant="body" className="leading-relaxed text-ink-label">
            {bio}
          </Paragraph>
        </div>
      </CardBody>
    </Card>
  )
}
