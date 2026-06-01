import { Building2, ChevronRight } from 'lucide-react'
import { Card, CardBody, cardPaddingClass } from '@/components/ui/Card'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

type FacultyQualificationsCardProps = {
  qualifications: string[]
  className?: string
}

export function FacultyQualificationsCard({
  qualifications,
  className,
}: FacultyQualificationsCardProps) {
  return (
    <Card
      className={cn(
        cardPaddingClass,
        'relative flex h-full flex-col overflow-hidden',
        className,
      )}
    >
      <Building2
        className="pointer-events-none absolute -right-2 -top-2 size-24 text-primary-50"
        aria-hidden
      />
      <CardBody className="relative flex flex-1 flex-col">
        <Paragraph
          variant="label"
          className="uppercase tracking-wide text-ink-heading"
        >
          Qualifications
        </Paragraph>
        <ul className="m-0 list-none space-y-2 p-0">
          {qualifications.map((qualification) => (
            <li key={qualification}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-nav border border-[#e2e8f0]/60 bg-white px-4 py-3 text-left transition-colors hover:bg-surface-page/50"
              >
                <Paragraph variant="emphasis">{qualification}</Paragraph>
                <ChevronRight className="size-4 shrink-0 text-nav" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}
