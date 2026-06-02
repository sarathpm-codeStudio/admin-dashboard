import { ChevronRight } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'
import { imageMaskStyle } from '@/utils/imageMaskStyle'

import qualificationsDecoration from '@/asset/image/quali.png'

type FacultyQualificationsCardProps = {
  qualifications: string[]
  decorationImage?: string
  className?: string
}

export function FacultyQualificationsCard({
  qualifications,
  decorationImage = qualificationsDecoration,
  className,
}: FacultyQualificationsCardProps) {
  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden bg-surface-input px-5 pb-5 pt-3',
        className,
      )}
    >
      <CardBody className="flex flex-1 flex-col gap-4">
        <SectionHeader
          title="Qualifications"
          titleSize="card"
          titleClassName="text-xs font-medium uppercase tracking-wide"
          className="items-center"
          action={
            decorationImage ? (
              <div
                className="pointer-events-none h-11 w-11 shrink-0 bg-[#e8ecf1]"
                style={imageMaskStyle(decorationImage, 'alpha')}
                aria-hidden
              />
            ) : undefined
          }
        />

        <ul className="relative z-10 -mt-2 m-0 flex flex-1 list-none flex-col gap-2 p-0">
          {qualifications.map((qualification) => (
            <li key={qualification}>
              <button
                type="button"
                className={cn(
                  'relative z-10 flex w-full items-center justify-between rounded-card border border-[#e2e8f0]/60',
                  'bg-white px-4 py-3 text-left transition-colors hover:bg-surface-page/50',
                )}
              >
                <Paragraph variant="emphasis" className="text-ink-heading">
                  {qualification}
                </Paragraph>
                <ChevronRight className="size-4 shrink-0 text-slate-400" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}
