import filterIcon from '@/asset/image/filter.png'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import type { FacultyCourseFilterValues } from '@/features/faculty/utils/filterFacultyCourses'
import { cn } from '@/utils/cn'

const filterFieldClass =
  'border-0 bg-white shadow-none hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary-50'

const filterSelectClass = cn(
  filterFieldClass,
  'py-2.5 pl-4 pr-10 text-sm font-[500] text-[#454652]',
)

type FacultyCoursesFiltersBarProps = {
  values: FacultyCourseFilterValues
  onChange: (values: FacultyCourseFilterValues) => void
  categories?: string[]
  className?: string
}

export function FacultyCoursesFiltersBar({
  values,
  onChange,
  categories = [],
  className,
}: FacultyCoursesFiltersBarProps) {
  const update = (patch: Partial<FacultyCourseFilterValues>) => {
    onChange({ ...values, ...patch })
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-card bg-surface-input p-4',
        className,
      )}
    >
      <SearchInput
        placeholder="Search courses by name or ID..."
        value={values.search}
        onChange={(e) => update({ search: e.target.value })}
        wrapperClassName="min-w-[12rem] flex-1"
        className={cn(filterFieldClass, 'py-2.5 text-sm')}
      />

      <Select
        value={values.status}
        onChange={(e) => update({ status: e.target.value })}
        aria-label="Filter by status"
        wrapperClassName="w-[8.75rem] shrink-0"
        className={filterSelectClass}
      >
        <option value="all">Status: All</option>
        <option value="active">Active</option>
        <option value="draft">Draft</option>
      </Select>

      <Select
        value={values.category}
        onChange={(e) => update({ category: e.target.value })}
        aria-label="Filter by category"
        wrapperClassName="w-[10.25rem] shrink-0"
        className={filterSelectClass}
      >
        <option value="all">Category: All</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>

      <button
        type="button"
        aria-label="More filters"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-nav border-0 bg-white text-nav transition-colors hover:bg-white hover:text-ink-heading focus:outline-none focus:ring-2 focus:ring-primary-50"
      >
        <img src={filterIcon} alt="" className="size-4 object-contain" aria-hidden />
      </button>
    </div>
  )
}
