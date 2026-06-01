import { UserRound } from 'lucide-react'
import { Card, CardBody, cardPaddingClass } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

type FacultyBioCardProps = {
  bio: string
  className?: string
}

export function FacultyBioCard({ bio, className }: FacultyBioCardProps) {
  return (
    <Card className={cn(cardPaddingClass, 'flex h-full flex-col', className)}>
      <CardBody className="flex flex-1 flex-col">
        <SectionHeader title="Professional Bio" icon={UserRound} titleSize="card" />
        <Paragraph variant="body" className="flex-1 leading-relaxed text-ink-label">
          {bio}
        </Paragraph>
      </CardBody>
    </Card>
  )
}
