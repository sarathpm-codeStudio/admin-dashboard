import { ExportDataButton } from '@/components/ui/ExportDataButton'
import { Header1 } from '@/components/ui/Typography'

export function FacultyCoursesPageHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Header1>Courses Created</Header1>
      <ExportDataButton />
    </div>
  )
}
