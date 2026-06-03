import {
  ArrowDownWideNarrow,
  Calendar,
  ListFilter,
  RotateCw,
  Search,
} from 'lucide-react'
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
          placeholder="Search by name, ID or course..."
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

        <IconSelect
          icon={Calendar}
          value={values.enrollmentDate}
          onChange={(e) => update({ enrollmentDate: e.target.value })}
          aria-label="Filter by enrollment date"
          wrapperClassName="min-w-[12rem] flex-[1_1_14rem]"
          className={selectFieldClass}
        >
          <option value="all">Enrollment Date</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </IconSelect>

        <IconSelect
          icon={ArrowDownWideNarrow}
          value={values.progressSort}
          onChange={(e) => update({ progressSort: e.target.value })}
          aria-label="Sort by progress"
          wrapperClassName="min-w-[14rem] flex-[1_1_16rem]"
          className={selectFieldClass}
        >
          <option value="high">Progress: High to Low</option>
          <option value="low">Progress: Low to High</option>
        </IconSelect>
      </div>

      <button
        type="button"
        aria-label="Reset filters"
        onClick={() => onChange(defaultEnrollmentFilters)}
        className="ml-auto inline-flex size-10 shrink-0 items-center justify-center text-nav transition-colors hover:text-ink-heading focus:outline-none focus:ring-2 focus:ring-primary-50 focus:ring-offset-2"
      >
        <RotateCw className="size-5" aria-hidden />
      </button>
    </div>
  )
}
