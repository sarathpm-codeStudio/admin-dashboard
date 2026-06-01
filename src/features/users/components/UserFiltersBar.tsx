import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { JoinedDateFilter } from '@/features/users/components/JoinedDateFilter'
import { cn } from '@/utils/cn'

export type UserFilterValues = {
  search: string
  userType: string
  course: string
  status: string
  joinedDateFrom: string
  joinedDateTo: string
}

type UserFiltersBarProps = {
  values: UserFilterValues
  onChange: (values: UserFilterValues) => void
  className?: string
}

/** White fields on grey bar — matches Figma user-management filters */
const filterFieldClass =
  'border-0 bg-white shadow-none hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary-50'

const filterSelectClass = cn(filterFieldClass, 'py-2.5 pl-4 pr-10 text-sm font-medium text-ink')

export function UserFiltersBar({ values, onChange, className }: UserFiltersBarProps) {
  const update = (patch: Partial<UserFilterValues>) => {
    onChange({ ...values, ...patch })
  }

  return (
    <div
      className={cn(
        'flex flex-nowrap items-center gap-3 rounded-card bg-surface-input p-4',
        className,
      )}
    >
      <SearchInput
        placeholder="Search by name, email or ID..."
        value={values.search}
        onChange={(e) => update({ search: e.target.value })}
        wrapperClassName="min-w-[12rem] max-w-[45%] flex-[1_1_42%]"
        className={cn(filterFieldClass, 'py-2.5 text-sm')}
      />

      <Select
        value={values.userType}
        onChange={(e) => update({ userType: e.target.value })}
        aria-label="Filter by user type"
        wrapperClassName="w-[7.75rem] shrink-0"
        className={filterSelectClass}
      >
        <option value="all">All Users</option>
        <option value="student">Students</option>
        <option value="faculty">Faculty</option>
        <option value="admin">Admins</option>
      </Select>

      {/* All Courses — uncomment block below to show
      <Select
        value={values.course}
        onChange={(e) => update({ course: e.target.value })}
        aria-label="Filter by course"
        wrapperClassName="w-[7.75rem] shrink-0"
        className={filterSelectClass}
      >
        <option value="all">All Courses</option>
        <option value="cs">Computer Science</option>
        <option value="biz">Business</option>
        <option value="design">Design</option>
      </Select>
      */}

      <Select
        value={values.status}
        onChange={(e) => update({ status: e.target.value })}
        aria-label="Filter by status"
        wrapperClassName="w-[6.5rem] shrink-0"
        className={filterSelectClass}
      >
        <option value="all">Status</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="suspended">Suspended</option>
      </Select>

      <JoinedDateFilter
        from={values.joinedDateFrom}
        to={values.joinedDateTo}
        onChange={(joinedDateFrom, joinedDateTo) => update({ joinedDateFrom, joinedDateTo })}
        fieldClassName={cn(filterFieldClass, 'py-2.5 pl-4 pr-4 text-sm font-medium text-ink')}
      />
    </div>
  )
}
