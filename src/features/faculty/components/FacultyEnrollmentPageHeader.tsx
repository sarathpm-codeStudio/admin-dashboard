import { ExportDataButton } from '@/components/ui/ExportDataButton'
import { Paragraph } from '@/components/ui/Typography'

type FacultyEnrollmentPageHeaderProps = {
  facultyName: string
  totalStudents: number
}

export function FacultyEnrollmentPageHeader({
  facultyName,
  totalStudents,
}: FacultyEnrollmentPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-sans text-2xl font-bold leading-tight text-ink-heading sm:text-3xl">
          <span className="font-[700]">Enrolled</span>{' '}
          <span className="font-bold">Students</span>
        </h1>
        <Paragraph variant="muted" className="mt-1 max-w-2xl text-md text-nav">
          Manage {totalStudents.toLocaleString()} students enrolled under{' '}
          <span className="font-[500] text-primary">{facultyName}</span>
        </Paragraph>
      </div>
      <ExportDataButton />
    </div>
  )
}
