import { useMemo, useState } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import type { FacultyPayoutTransaction } from '@/api/FacultyManagement/facultyManagement.api'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { SummaryStatsGrid } from '@/components/ui/SummaryStatsGrid'
import { FacultyRevenueAnalyticsPanel } from '@/features/financial/components/FacultyRevenueAnalyticsPanel'
import { FacultyRevenuePageHeader } from '@/features/financial/components/FacultyRevenuePageHeader'
import { FacultyTransactionsTable } from '@/features/financial/components/FacultyTransactionsTable'
import { getFacultyRevenueStatItems } from '@/features/financial/data/facultyRevenueStatItems'
import { getFacultyRevenueSummary } from '@/features/financial/data/mockFacultyRevenue'
import { getFacultyById } from '@/features/faculty/data/mockFacultyDetail'
import {
  useGetFacultyRevenueStats,
  useGetFacultyTransactions,
} from '@/features/faculty/hooks/useFacultyManagement'

const TRANSACTION_PAGE_SIZE = 10

const EMPTY_ROWS: FacultyPayoutTransaction[] = []

export function FacultyRevenueView() {
  const { facultyId } = useParams<{ facultyId: string }>()
  const [searchParams] = useSearchParams()
  const facultyNameParam = searchParams.get('facultyName') ?? ''
  const faculty = facultyId ? getFacultyById(facultyId) : undefined
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const { data: revenueStats } = useGetFacultyRevenueStats(facultyId ?? '')

  const summary = useMemo(
    () => (facultyId ? getFacultyRevenueSummary(facultyId) : getFacultyRevenueSummary('john-smith')),
    [facultyId],
  )

  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
  } = useGetFacultyTransactions(
    facultyId ?? '',
    page,
    { search, startDate: dateFrom, endDate: dateTo },
    TRANSACTION_PAGE_SIZE,
  )

  const tableRows = transactions?.items ?? EMPTY_ROWS
  const displayTotal = transactions?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(displayTotal / TRANSACTION_PAGE_SIZE))

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleDateChange = (from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
    setPage(1)
  }

  if (!faculty || !facultyId) {
    return <Navigate to="/users" replace />
  }

  const statItems = getFacultyRevenueStatItems(summary).map((item) => {
    if (item.id === 'total-revenue' && revenueStats) {
      const { display, growthDisplay, isPositive } = revenueStats.totalRevenue
      const badgeClass = isPositive
        ? 'inline-flex rounded-full bg-[#A8EDFF] px-2.5 py-0.5 text-xs font-semibold text-[#00A6BF]'
        : 'inline-flex rounded-full bg-[#FFE4E6] px-2.5 py-0.5 text-xs font-semibold text-[#E11D48]'
      return {
        ...item,
        value: display,
        footer: <span className={badgeClass}>{growthDisplay}</span>,
      }
    }
    if (item.id === 'pending-payout' && revenueStats) {
      return { ...item, value: revenueStats.pendingPayout.display }
    }
    if (item.id === 'promo-support' && revenueStats) {
      return {
        ...item,
        value: revenueStats.adminSubsidy.display,
        footer:
          revenueStats.couponSpend.amount > 0 ? (
            <span className="inline-flex rounded-full bg-[#F5F3FF] px-2.5 py-0.5 text-xs font-semibold text-[#7C3AED]">
              own coupons {revenueStats.couponSpend.display}
            </span>
          ) : (
            <span className="text-xs font-medium text-[#94A3B8]">
              coins &amp; offers, platform-funded
            </span>
          ),
      }
    }
    return item
  })

  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto bg-surface-page pb-6">
      <Breadcrumbs
        items={[
          { label: 'Faculty Directory', to: '/users' },
          { label: facultyNameParam || faculty.name, to: `/userdetails/faculty/${facultyId}` },
          { label: 'Faculty Revenue', className: 'text-[#4F46E5]' },
        ]}
      />

      <FacultyRevenuePageHeader />

      <SummaryStatsGrid items={statItems} columns={3} className="gap-6" />

      <FacultyRevenueAnalyticsPanel facultyId={facultyId} />

      <FacultyTransactionsTable
        rows={tableRows}
        totalCount={displayTotal}
        page={page}
        totalPages={totalPages}
        search={search}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onSearchChange={handleSearchChange}
        onDateChange={handleDateChange}
        onPageChange={setPage}
        isLoading={isTransactionsLoading}
        isError={isTransactionsError}
      />
    </div>
  )
}
