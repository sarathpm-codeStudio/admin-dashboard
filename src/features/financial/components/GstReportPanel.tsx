import { useMemo, useState } from 'react'
import { FileText, Landmark, Receipt, Wallet } from 'lucide-react'
import type { GstRegisterRow } from '@/api/financial/gst.api'
import { Card } from '@/components/ui/Card'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { DataTable } from '@/components/ui/DataTable'
import { ExportDataButton } from '@/components/ui/ExportDataButton'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { SummaryStatsGrid } from '@/components/ui/SummaryStatsGrid'
import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'
import {
  buildGstPeriods,
  type GstGranularity,
} from '@/features/financial/data/gstPeriods'
import { useGetGstReport } from '@/features/financial/hooks/useFinancialManagement'

const granularityOptions: { value: GstGranularity; label: string }[] = [
  { value: 'month', label: 'Monthly' },
  { value: 'quarter', label: 'Quarterly' },
  { value: 'year', label: 'Financial Year' },
]

function toCsv(rows: GstRegisterRow[]): string {
  const header = ['Payout ID', 'Payment Ref', 'Faculty', 'Period', 'Taxable Value', 'GST Rate %', 'GST Amount', 'Total']
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const lines = rows.map((r) =>
    [r.payoutId, r.paymentId, r.faculty, r.period, r.taxableValue, r.ratePercent, r.gstAmount, r.totalAmount]
      .map(escape)
      .join(','),
  )
  return [header.map(escape).join(','), ...lines].join('\n')
}

export function GstReportPanel() {
  const [granularity, setGranularity] = useState<GstGranularity>('month')
  const [search, setSearch] = useState('')

  const periods = useMemo(() => buildGstPeriods(granularity), [granularity])
  const [periodValue, setPeriodValue] = useState(periods[0]?.value ?? '')

  const period = periods.find((p) => p.value === periodValue) ?? periods[0]

  const { data: report, isLoading } = useGetGstReport(period?.fromISO ?? '', period?.toISO ?? '')

  const onGranularityChange = (g: GstGranularity) => {
    setGranularity(g)
    const next = buildGstPeriods(g)
    setPeriodValue(next[0]?.value ?? '')
  }

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (report?.rows ?? []).filter(
      (r) => !q || r.payoutId.toLowerCase().includes(q) || r.paymentId.toLowerCase().includes(q) || r.faculty.toLowerCase().includes(q),
    )
  }, [report, search])

  const summaryItems: SummaryStatItem[] = report
    ? [
        {
          id: 'taxable', layout: 'inline', label: 'Taxable Value', value: report.taxableDisplay,
          icon: Wallet, iconTileClassName: 'bg-[#EEF2FF]', iconClassName: 'text-[#4338CA]',
        },
        {
          id: 'gst', layout: 'inline', label: 'GST Collected', value: report.gstDisplay,
          icon: Landmark, iconTileClassName: 'bg-[#ECFDF5]', iconClassName: 'text-[#059669]',
          footer: (
            <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[10px] font-semibold text-[#059669]">
              Output tax
            </span>
          ),
        },
        {
          id: 'total', layout: 'inline', label: 'Total Collected', value: report.totalDisplay,
          icon: Receipt, iconTileClassName: 'bg-[#FFF7ED]', iconClassName: 'text-[#C2410C]',
        },
        {
          id: 'invoices', layout: 'inline', label: 'Taxable Invoices', value: String(report.invoiceCount),
          icon: FileText, iconTileClassName: 'bg-[#F1F5F9]', iconClassName: 'text-[#475569]',
          footer: (
            <span className="text-[10px] font-medium text-[#94A3B8]">
              {report.effectiveRateDisplay} effective
            </span>
          ),
        },
      ]
    : []

  const handleExport = () => {
    if (!report) return
    const csv = toCsv(report.rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gst-report-${period?.label.replace(/\s+/g, '-').toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns: DataTableColumn<GstRegisterRow>[] = [
    { id: 'payoutId', header: 'Payout ID', width: '12rem', cell: (r) => <span className="text-ink-heading text-sm font-semibold">{r.payoutId}</span> },
    { id: 'faculty', header: 'Faculty', cell: (r) => <span className="text-sm font-medium text-[#1E1B4B]">{r.faculty}</span> },
    { id: 'period', header: 'Period', width: '9rem', cell: (r) => <span className="text-sm text-[#64748B]">{r.period}</span> },
    { id: 'taxable', header: 'Taxable Value', width: '9rem', align: 'right', headerClassName: 'text-right', cell: (r) => <span className="whitespace-nowrap text-sm text-[#334155]">{r.taxableDisplay}</span> },
    { id: 'rate', header: 'GST %', width: '6rem', align: 'right', headerClassName: 'text-right', cell: (r) => <span className="whitespace-nowrap text-sm text-[#64748B]">{r.ratePercent}%</span> },
    { id: 'gst', header: 'GST Amount', width: '9rem', align: 'right', headerClassName: 'text-right', cell: (r) => <span className="whitespace-nowrap text-sm font-semibold text-[#059669]">{r.gstDisplay}</span> },
  ]

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={granularity}
          onChange={(e) => onGranularityChange(e.target.value as GstGranularity)}
          className="bg-[#F8FAFC] py-2"
          wrapperClassName="w-full sm:w-auto"
        >
          {granularityOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        <Select
          value={periodValue}
          onChange={(e) => setPeriodValue(e.target.value)}
          className="bg-[#F8FAFC] py-2"
          wrapperClassName="w-full sm:w-auto"
        >
          {periods.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </Select>
        <ExportDataButton className="ml-auto" label="Export CSV" onClick={handleExport} />
      </div>

      <SummaryStatsGrid
        items={summaryItems}
        columns={4}
        isLoading={isLoading}
        skeletonCount={4}
        skeletonProps={{ layout: 'inline' }}
        className="gap-6"
      />

      {/* Rate breakdown */}
      {report && report.rateBuckets.length > 0 ? (
        <Card className="p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-[#1E1B4B]">GST by rate</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wide text-[#94A3B8]">
                  <th className="px-3 py-2 font-semibold">Rate</th>
                  <th className="px-3 py-2 text-right font-semibold">Taxable Value</th>
                  <th className="px-3 py-2 text-right font-semibold">GST</th>
                  <th className="px-3 py-2 text-right font-semibold">Invoices</th>
                </tr>
              </thead>
              <tbody>
                {report.rateBuckets.map((b) => (
                  <tr key={b.ratePercent} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-2.5 text-sm font-semibold text-[#1E1B4B]">{b.ratePercent}%</td>
                    <td className="px-3 py-2.5 text-right text-sm text-[#334155]">{b.taxableDisplay}</td>
                    <td className="px-3 py-2.5 text-right text-sm font-semibold text-[#059669]">{b.gstDisplay}</td>
                    <td className="px-3 py-2.5 text-right text-sm text-[#64748B]">{b.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {/* Tax register */}
      <Card className="overflow-hidden p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-[#1E1B4B]">Tax Register</h3>
          <SearchInput
            placeholder="Payout ID / Payment Ref / Faculty"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            wrapperClassName="w-full min-w-[12rem] sm:w-72"
            className="rounded-lg border-0 bg-[#F8FAFC] shadow-none focus:border-0 focus:bg-[#F8FAFC] focus:ring-0"
          />
        </div>

        <DataTable
          bare
          columns={columns}
          data={rows}
          isLoading={isLoading}
          getRowKey={(r) => r.id}
          totalCount={rows.length}
          page={1}
          totalPages={1}
          onPageChange={() => {}}
          emptyMessage="No taxable sales in this period."
          footerLayout="between"
          alwaysShowPagination
          className="rounded-none border-0 shadow-none"
        />
      </Card>

      <p className="text-xs leading-relaxed text-[#94A3B8]">
        GST is taken from the monthly payout records (faculty_transactions) — the tax captured when each
        payout was processed, grouped by its enrollment period. Sales not yet paid out appear once their
        payout runs. CGST/SGST/IGST split needs the buyer's state, which isn't captured yet.
      </p>
    </div>
  )
}
