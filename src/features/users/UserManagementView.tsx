import { useMemo, useState } from 'react'
import {
  UserFiltersBar,
  type UserFilterValues,
} from '@/features/users/components/UserFiltersBar'
import { UserManagementHeader } from '@/features/users/components/UserManagementHeader'
import { UserSummaryStats } from '@/features/users/components/UserSummaryStats'
import { UsersTable } from '@/features/users/components/UsersTable'
import {
  mockUsers,
  USERS_PAGE_SIZE,
  type UserRecord,
} from '@/features/users/data/mockUsers'
import { isJoinedDateInRange } from '@/features/users/utils/joinedDate'

const defaultFilters: UserFilterValues = {
  search: '',
  userType: 'all',
  course: 'all',
  status: 'all',
  joinedDateFrom: '',
  joinedDateTo: '',
}

function filterUsers(users: UserRecord[], filters: UserFilterValues): UserRecord[] {
  const query = filters.search.trim().toLowerCase()

  return users.filter((user) => {
    if (query) {
      const matchesQuery =
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.includes(query)
      if (!matchesQuery) return false
    }

    if (filters.userType !== 'all' && user.role.toLowerCase() !== filters.userType) {
      return false
    }

    if (filters.status !== 'all' && user.status !== filters.status) {
      return false
    }

    if (filters.joinedDateFrom || filters.joinedDateTo) {
      if (!isJoinedDateInRange(user.joinedDate, filters.joinedDateFrom, filters.joinedDateTo)) {
        return false
      }
    }

    return true
  })
}

export function UserManagementView() {
  const [filters, setFilters] = useState<UserFilterValues>(defaultFilters)
  const [page, setPage] = useState(1)

  const filteredUsers = useMemo(
    () => filterUsers(mockUsers, filters),
    [filters],
  )

  const displayTotal = filteredUsers.length

  const totalPages = Math.max(1, Math.ceil(displayTotal / USERS_PAGE_SIZE))

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * USERS_PAGE_SIZE
    return filteredUsers.slice(start, start + USERS_PAGE_SIZE)
  }, [filteredUsers, page])

  const handleFiltersChange = (next: UserFilterValues) => {
    setFilters(next)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <UserManagementHeader />
      <UserSummaryStats />
      <UserFiltersBar values={filters} onChange={handleFiltersChange} />
      <UsersTable
        users={paginatedUsers}
        totalCount={displayTotal}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
