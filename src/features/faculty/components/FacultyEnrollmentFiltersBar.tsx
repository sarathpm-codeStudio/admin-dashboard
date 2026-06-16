import { ListFilter, Search } from 'lucide-react'
import { IconSelect } from '@/components/ui/IconSelect'
import { Input } from '@/components/ui/Input'
import type { FacultyEnrollmentFilterValues } from '@/features/faculty/utils/filterFacultyEnrollments'
import { cn } from '@/utils/cn'

const filterFieldClass = cn(
  'rounded-nav border border-[#e2e8f0]/80 bg-white py-2.5 text-sm font-[500] text-[#454652]',
  'shadow-none hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary-50',
)

const selectFieldClass = 'border border-[#e2e8f0]/80'

export const defaultEnrollmentFilters: FacultyEnrollmentFilterValues = {
  search: '',
  course: 'all',
  enrollmentDate: 'all',
  progressSort: 'high',
}

type FacultyEnrollmentFiltersBarProps = {
  values: FacultyEnrollmentFilterValues
  onChange: (values: FacultyEnrollmentFilterValues) => void
  courseOptions: { value: string; label: string }[]
  className?: string
}

export function FacultyEnrollmentFiltersBar({
  values,
  onChange,
  courseOptions,
  className,
}: FacultyEnrollmentFiltersBarProps) {
  const update = (patch: Partial<FacultyEnrollmentFilterValues>) => {
    onChange({ ...values, ...patch })
  }

  return (
    <div
      className={cn(
        'scrollbar-none flex w-full flex-nowrap items-center gap-3 overflow-x-auto rounded-card bg-surface-input p-4 lg:gap-4',
        className,
      )}
    >
      <div className="relative min-w-[14rem] max-w-[42%] flex-[1_1_36%]">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-nav"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search by name..."
          value={values.search}
          onChange={(e) => update({ search: e.target.value })}
          className={cn(filterFieldClass, 'w-full pl-10')}
        />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-4">
        <IconSelect
          icon={ListFilter}
          value={values.course}
          onChange={(e) => update({ course: e.target.value })}
          aria-label="Filter by course"
          wrapperClassName="w-[9.5rem] shrink-0"
          className={selectFieldClass}
        >
          <option value="all">Course: All</option>
          {courseOptions.map((course) => (
            <option key={course.value} value={course.value}>
              {course.label}
            </option>
          ))}
        </IconSelect>
      </div>
    </div>
  )
}
