import { useEffect, useMemo, useState } from 'react'
import {
  UserFiltersBar,
  type UserFilterValues,
} from '@/features/users/components/UserFiltersBar'
import { UserManagementHeader } from '@/features/users/components/UserManagementHeader'
import { UserSummaryStats } from '@/features/users/components/UserSummaryStats'
import { UsersTable } from '@/features/users/components/UsersTable'
import { USERS_PAGE_SIZE } from '@/features/users/utils/constants'
import { useGetAllUsers } from '@/features/users/hooks/useUserManagement'
import {
  mapStatusFilterToApi,
  mapUserListRowToRecord,
  mapUserTypeFilterToRole,
} from '@/features/users/utils/mapUserFromApi'

const defaultFilters: UserFilterValues = {
  search: '',
  userType: 'all',
  course: 'all',
  status: 'all',
  joinedDateFrom: '',
  joinedDateTo: '',
}

export function UserManagementView() {
  const [filters, setFilters] = useState<UserFilterValues>(defaultFilters)
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(filters.search.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [filters.search])

  const apiRole = mapUserTypeFilterToRole(filters.userType)
  const apiStatus = mapStatusFilterToApi(filters.status)

  const { data, isLoading } = useGetAllUsers(
    page,
    USERS_PAGE_SIZE,
    debouncedSearch,
    apiRole,
    apiStatus,
    filters.joinedDateFrom,
    filters.joinedDateTo,
  )

  const tableUsers = useMemo(
    () => (data?.data ?? []).map(mapUserListRowToRecord),
    [data?.data],
  )

  const pagination = data?.pagination
  const totalCount = pagination?.total ?? 0
  const totalPages = Math.max(1, pagination?.total_pages ?? 1)

  const handleFiltersChange = (next: UserFilterValues) => {
    setFilters(next)
    setPage(1)
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
  }

  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden">
      <UserManagementHeader />
      <UserSummaryStats />
      <UserFiltersBar values={filters} onChange={handleFiltersChange} />
      <UsersTable
        users={tableUsers}
        totalCount={totalCount}
        page={pagination?.current_page ?? page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
    </div>
  )
}
