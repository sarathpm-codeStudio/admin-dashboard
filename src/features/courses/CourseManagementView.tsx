import { Check, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TableSelectionBar } from '@/components/ui/TableSelectionBar'
import {
  CourseBulkActionModals,
  type CourseBulkAction,
} from '@/features/courses/components/CourseBulkActionModals'
import {
  CourseFiltersBar,
  type CourseFilterValues,
} from '@/features/courses/components/CourseFiltersBar'
import { CourseManagementHeader } from '@/features/courses/components/CourseManagementHeader'
import { CourseSummaryStats } from '@/features/courses/components/CourseSummaryStats'
import { CoursesTable } from '@/features/courses/components/CoursesTable'
import {
  useDeleteCourses,
  useGetAllCourses,
  useUpdateCoursesStatus,
} from '@/features/courses/hooks/useCourseManagement'
import { COURSES_PAGE_SIZE } from '@/features/courses/utils/constants'
import {
  mapCourseListRowToRecord,
  mapPriceFilterToApi,
  mapStatusFilterToApi,
} from '@/features/courses/utils/mapCourseFromApi'

const defaultFilters: CourseFilterValues = {
  search: '',
  category: 'all',
  faculty: 'all',
  price: 'any',
  status: 'all',
}

export function CourseManagementView() {
  const [filters, setFilters] = useState<CourseFilterValues>(defaultFilters)
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [pendingAction, setPendingAction] = useState<CourseBulkAction | null>(null)

  const { mutateAsync: updateCoursesStatus } = useUpdateCoursesStatus()
  const { mutateAsync: deleteCourses } = useDeleteCourses()

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(filters.search.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [filters.search])

  const apiStatus = mapStatusFilterToApi(filters.status)
  const apiPrice = mapPriceFilterToApi(filters.price)

  const { data, isLoading } = useGetAllCourses(
    page,
    COURSES_PAGE_SIZE,
    debouncedSearch,
    filters.category,
    filters.faculty,
    apiPrice,
    apiStatus,
  )

  const tableCourses = useMemo(
    () => (data?.data ?? []).map(mapCourseListRowToRecord),
    [data?.data],
  )

  const pagination = data?.pagination
  const totalCount = pagination?.total ?? 0
  const totalPages = Math.max(1, pagination?.total_pages ?? 1)

  const selectedCourseIds = useMemo(() => Array.from(selectedIds), [selectedIds])

  const handleFiltersChange = (next: CourseFilterValues) => {
    setFilters(next)
    setPage(1)
    setSelectedIds(new Set())
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    setSelectedIds(new Set())
  }

  const handleToggleRow = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const handleToggleAll = useCallback(
    (checked: boolean) => {
      if (!checked) {
        setSelectedIds(new Set())
        return
      }
      setSelectedIds(new Set(tableCourses.map((course) => course.id)))
    },
    [tableCourses],
  )

  const clearSelection = () => setSelectedIds(new Set())

  const handleBulkApprove = async () => {
    await updateCoursesStatus({ courseIds: selectedCourseIds, input: 'APPROVED' })
    clearSelection()
  }

  const handleBulkReject = async ({ rejectionReason }: { rejectionReason: string }) => {
    await updateCoursesStatus({
      courseIds: selectedCourseIds,
      input: {
        status: 'REJECTED',
        rejectReason: rejectionReason,
      },
    })
    clearSelection()
  }

  const handleBulkDelete = async () => {
    await deleteCourses(selectedCourseIds)
    clearSelection()
  }

  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto">
      <CourseManagementHeader />
      <CourseSummaryStats />
      <CourseFiltersBar values={filters} onChange={handleFiltersChange} />

      <div className="relative space-y-3">
        <CoursesTable
          courses={tableCourses}
          totalCount={totalCount}
          page={pagination?.current_page ?? page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          selectedIds={selectedIds}
          onToggleRow={handleToggleRow}
          onToggleAll={handleToggleAll}
          isLoading={isLoading}
        />

        <TableSelectionBar
          selectedCount={selectedIds.size}
          onClear={clearSelection}
          actions={[
            {
              id: 'approve',
              label: 'Approve',
              icon: Check,
              onClick: () => setPendingAction('approve'),
            },
            {
              id: 'reject',
              label: 'Reject',
              icon: X,
              onClick: () => setPendingAction('reject'),
            },
            {
              id: 'delete',
              label: 'Delete',
              icon: Trash2,
              onClick: () => setPendingAction('delete'),
              variant: 'danger',
            },
          ]}
          className="sticky bottom-4 z-10"
        />
      </div>

      <CourseBulkActionModals
        action={pendingAction}
        selectedCount={selectedIds.size}
        onClose={() => setPendingAction(null)}
        onApprove={handleBulkApprove}
        onReject={handleBulkReject}
        onDelete={handleBulkDelete}
      />
    </div>
  )
}
