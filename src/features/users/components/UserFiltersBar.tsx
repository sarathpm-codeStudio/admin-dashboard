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
const filterTextClass = 'text-[#454652]'

const filterFieldClass = cn(
  'border-0 bg-white shadow-none hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary-50',
  filterTextClass,
)

const filterSelectClass = cn(filterFieldClass, 'py-2.5 pl-4 pr-10 text-sm font-medium')

export function UserFiltersBar({ values, onChange, className }: UserFiltersBarProps) {
  const update = (patch: Partial<UserFilterValues>) => {
    onChange({ ...values, ...patch })
  }

  return (
    <div
      className={cn(
        'flex flex-nowrap items-center gap-6 rounded-card bg-surface-input p-4',
        className,
      )}
    >
      <SearchInput
        placeholder="Search by name, email or ID..."
        value={values.search}
        onChange={(e) => update({ search: e.target.value })}
        wrapperClassName="min-w-[12rem] max-w-[40%] flex-[1_1_36%]"
        className={cn(filterFieldClass, 'py-2.5 text-sm placeholder:text-[#454652]/60')}
      />

      <Select
        value={values.userType}
        onChange={(e) => update({ userType: e.target.value })}
        aria-label="Filter by user type"
        wrapperClassName="w-[10rem] shrink-0"
        className={filterSelectClass}
      >
        <option value="all">All Users</option>
        <option value="student">Students</option>
        <option value="faculty">Faculty</option>
        <option value="admin">Admins</option>
      </Select>

      {/* All Courses — uncomment block below to show
      <div className="min-w-4 shrink-0" aria-hidden />

      <Select
        value={values.course}
        onChange={(e) => update({ course: e.target.value })}
        aria-label="Filter by course"
        wrapperClassName="w-[11rem] shrink-0"
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
        wrapperClassName="w-[9rem] shrink-0"
        className={filterSelectClass}
      >
        <option value="all">Status</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="resubmitted">Resubmitted</option>
        <option value="rejected">Reject</option>
        <option value="suspended">Suspended</option>
      </Select>

      <JoinedDateFilter
        from={values.joinedDateFrom}
        to={values.joinedDateTo}
        onChange={(joinedDateFrom, joinedDateTo) => update({ joinedDateFrom, joinedDateTo })}
        className="min-w-[12rem] shrink-0"
        fieldClassName={cn(
          filterFieldClass,
          'w-full min-w-[12rem] py-2.5 pl-4 pr-4 text-sm font-medium',
        )}
      />
    </div>
  )
}
