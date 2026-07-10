import { Header1, Paragraph } from '@/components/ui/Typography'
import { GstReportPanel } from '@/features/financial/components/GstReportPanel'

export function GstReportView() {
  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto">
      <div className="min-w-0">
        <Header1>GST Report</Header1>
        <Paragraph variant="muted" className="mt-1">
          GST collected from processed payouts, ready for filing.
        </Paragraph>
      </div>

      <GstReportPanel />
    </div>
  )
}
