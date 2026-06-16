import { ExportDataButton } from '@/components/ui/ExportDataButton'
import { Header1, Paragraph } from '@/components/ui/Typography'

export function CourseManagementHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <Header1>Course Management</Header1>
        <Paragraph variant="muted" className="mt-1 max-w-2xl">
          Control, review, and optimize all courses on the platform
        </Paragraph>
      </div>
      <ExportDataButton />
    </div>
  )
}
