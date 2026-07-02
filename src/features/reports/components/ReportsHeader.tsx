import { ExportDataButton } from '@/components/ui/ExportDataButton'
import { Header1, Paragraph } from '@/components/ui/Typography'

export function ReportsHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <Header1>Reports &amp; Analytics</Header1>
        <Paragraph variant="muted">
          Platform performance across revenue, enrollments and courses.
        </Paragraph>
      </div>
      <ExportDataButton className="shrink-0" />
    </div>
  )
}
