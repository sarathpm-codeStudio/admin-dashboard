import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { useGetCourseFilterOptions } from '@/features/courses/hooks/useCourseManagement'
import { cn } from '@/utils/cn'

export type CourseFilterValues = {
  search: string
  category: string
  faculty: string
  price: string
  status: string
}

type CourseFiltersBarProps = {
  values: CourseFilterValues
  onChange: (values: CourseFilterValues) => void
  className?: string
}

const filterTextClass = 'text-[#454652]'

const filterFieldClass = cn(
  'border-0 bg-white shadow-none hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary-50',
  filterTextClass,
)

const filterSelectClass = cn(filterFieldClass, 'py-2.5 pl-4 pr-10 text-sm font-medium')

export function CourseFiltersBar({ values, onChange, className }: CourseFiltersBarProps) {
  const { data: filterOptions } = useGetCourseFilterOptions()

  const update = (patch: Partial<CourseFilterValues>) => {
    onChange({ ...values, ...patch })
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4 rounded-card bg-surface-input p-4 lg:flex-nowrap lg:gap-6',
        className,
      )}
    >
      <SearchInput
        placeholder="Search courses..."
        value={values.search}
        onChange={(e) => update({ search: e.target.value })}
        wrapperClassName="min-w-[10rem] flex-[1_1_20%]"
        className={cn(filterFieldClass, 'py-2.5 text-sm placeholder:text-[#454652]/60')}
      />

      <Select
        value={values.category}
        onChange={(e) => update({ category: e.target.value })}
        aria-label="Filter by category"
        wrapperClassName="w-[9rem] shrink-0"
        className={filterSelectClass}
      >
        <option value="all">Category: All</option>
        {(filterOptions?.categories ?? []).map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>

      <Select
        value={values.faculty}
        onChange={(e) => update({ faculty: e.target.value })}
        aria-label="Filter by faculty"
        wrapperClassName="w-[9rem] shrink-0"
        className={filterSelectClass}
      >
        <option value="all">Faculty: All</option>
        {(filterOptions?.faculty ?? []).map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </Select>

      <Select
        value={values.price}
        onChange={(e) => update({ price: e.target.value })}
        aria-label="Filter by price"
        wrapperClassName="w-[8.5rem] shrink-0"
        className={filterSelectClass}
      >
        <option value="any">Price: Any</option>
        <option value="free">Free</option>
        <option value="paid">Paid</option>
      </Select>

      <Select
        value={values.status}
        onChange={(e) => update({ status: e.target.value })}
        aria-label="Filter by status"
        wrapperClassName="w-[8.5rem] shrink-0"
        className={filterSelectClass}
      >
        <option value="all">Status: All</option>
        <option value="APPROVED">Approved</option>
        <option value="RESUBMIT">Resubmitted</option>
        <option value="REJECTED">Rejected</option>
      </Select>

      <button
        type="button"
        onClick={() =>
          onChange({
            search: '',
            category: 'all',
            faculty: 'all',
            price: 'any',
            status: 'all',
          })
        }
        className="ml-auto shrink-0 text-sm font-medium text-primary hover:underline"
      >
        Reset Filters
      </button>
    </div>
  )
}
