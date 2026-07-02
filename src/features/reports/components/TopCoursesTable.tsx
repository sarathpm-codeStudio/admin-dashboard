import { Star } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { TopCourseRow } from '@/api/reports/reports.api'
import { useGetTopCourses } from '@/features/reports/hooks/useReports'
import { formatINRCompact } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

type TopCoursesTableProps = {
  className?: string
}

const noop = () => {}

const columns: DataTableColumn<TopCourseRow>[] = [
  {
    id: 'title',
    header: 'Course',
    width: '34%',
    cell: (row) => (
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink-heading">{row.title}</p>
        <p className="truncate text-xs text-nav">{row.faculty}</p>
      </div>
    ),
  },
  {
    id: 'category',
    header: 'Category',
    width: '18%',
    cell: (row) => <span className="text-nav">{row.category}</span>,
  },
  {
    id: 'enrollments',
    header: 'Enrollments',
    width: '16%',
    align: 'right',
    cell: (row) => (
      <span className="font-semibold text-ink-heading">
        {row.enrollments.toLocaleString('en-IN')}
      </span>
    ),
  },
  {
    id: 'revenue',
    header: 'Revenue',
    width: '16%',
    align: 'right',
    cell: (row) => (
      <span className="font-semibold text-ink-heading">{formatINRCompact(row.revenue)}</span>
    ),
  },
  {
    id: 'rating',
    header: 'Rating',
    width: '16%',
    align: 'right',
    cell: (row) => (
      <span className="inline-flex items-center gap-1.5">
        <Star className="size-4 fill-[#F59E0B] text-[#F59E0B]" aria-hidden />
        <span className="font-semibold text-ink-heading">{row.rating.toFixed(1)}</span>
      </span>
    ),
  },
]

export function TopCoursesTable({ className }: TopCoursesTableProps) {
  const { data: courses = [], isLoading, isError } = useGetTopCourses()

  return (
    <Card className={cn('w-full p-6', className)}>
      <CardBody className="gap-5">
        <SectionHeader
          title="Top Courses"
          titleClassName="text-[#191c1e]"
          subtitle="Ranked by total enrollments"
        />

        {isError ? (
          <div className="flex items-center justify-center py-10 text-sm text-[#dc2626]">
            Failed to load top courses.
          </div>
        ) : (
          <DataTable
            bare
            columns={columns}
            data={courses}
            getRowKey={(row) => row.id}
            totalCount={courses.length}
            page={1}
            totalPages={1}
            onPageChange={noop}
            showFooter={false}
            isLoading={isLoading}
            loadingRowCount={6}
            emptyMessage="No course enrollments to report yet."
          />
        )}
      </CardBody>
    </Card>
  )
}
