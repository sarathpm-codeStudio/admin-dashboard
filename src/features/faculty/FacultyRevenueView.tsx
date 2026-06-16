import { useMemo, useState } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { SummaryStatsGrid } from '@/components/ui/SummaryStatsGrid'
import { FacultyRevenueAnalyticsPanel } from '@/features/financial/components/FacultyRevenueAnalyticsPanel'
import { FacultyRevenuePageHeader } from '@/features/financial/components/FacultyRevenuePageHeader'
import { FacultyTransactionsTable } from '@/features/financial/components/FacultyTransactionsTable'
import { getFacultyRevenueStatItems } from '@/features/financial/data/facultyRevenueStatItems'
import {
  getFacultyEarningsGrowth,
  getFacultyRevenueSource,
  getFacultyRevenueSummary,
  getFacultyTransactions,
  TRANSACTION_DISPLAY_TOTAL,
  TRANSACTION_PAGE_SIZE,
} from '@/features/financial/data/mockFacultyRevenue'
import { filterFacultyTransactions } from '@/features/financial/utils/filterFacultyTransactions'
import { getFacultyById } from '@/features/faculty/data/mockFacultyDetail'

export function FacultyRevenueView() {
  const { facultyId } = useParams<{ facultyId: string }>()
  const [searchParams] = useSearchParams()
  const facultyNameParam = searchParams.get('facultyName') ?? ''
  const faculty = facultyId ? getFacultyById(facultyId) : undefined
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const summary = useMemo(
    () => (facultyId ? getFacultyRevenueSummary(facultyId) : getFacultyRevenueSummary('john-smith')),
    [facultyId],
  )

  const earningsData = useMemo(
    () => (facultyId ? getFacultyEarningsGrowth(facultyId) : []),
    [facultyId],
  )

  const revenueSource = useMemo(
    () => (facultyId ? getFacultyRevenueSource(facultyId) : getFacultyRevenueSource('john-smith')),
    [facultyId],
  )

  const allTransactions = useMemo(
    () => (facultyId ? getFacultyTransactions(facultyId) : []),
    [facultyId],
  )

  const filteredTransactions = useMemo(
    () => filterFacultyTransactions(allTransactions, search),
    [allTransactions, search],
  )

  const usingSearch = search.trim() !== ''
  const displayTotal = usingSearch
    ? filteredTransactions.length
    : TRANSACTION_DISPLAY_TOTAL

  const totalPages = Math.max(1, Math.ceil(displayTotal / TRANSACTION_PAGE_SIZE))

  const tableRows = useMemo(() => {
    const start = (page - 1) * TRANSACTION_PAGE_SIZE
    const source = usingSearch ? filteredTransactions : allTransactions
    return source.slice(start, start + TRANSACTION_PAGE_SIZE)
  }, [page, usingSearch, filteredTransactions, allTransactions])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  if (!faculty || !facultyId) {
    return <Navigate to="/users" replace />
  }

  const statItems = getFacultyRevenueStatItems(summary)

  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto bg-surface-page pb-6">
      <Breadcrumbs
        items={[
          { label: 'Financials', to: '/financial' },
          { label: 'Faculty Revenue', to: '/financial' },
          { label: facultyNameParam || faculty.name, className: 'text-[#4F46E5]' },
        ]}
      />

      <FacultyRevenuePageHeader />

      <SummaryStatsGrid items={statItems} columns={2} className="gap-6" />

      <FacultyRevenueAnalyticsPanel earnings={earningsData} source={revenueSource} />

      <FacultyTransactionsTable
        rows={tableRows}
        totalCount={displayTotal}
        page={page}
        totalPages={totalPages}
        search={search}
        onSearchChange={handleSearchChange}
        onPageChange={setPage}
      />
    </div>
  )
}
