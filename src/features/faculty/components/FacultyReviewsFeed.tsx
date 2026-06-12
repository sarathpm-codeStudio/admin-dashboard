import { ListFilter } from 'lucide-react'
import { useMemo, useState } from 'react'
import { IconSelect } from '@/components/ui/IconSelect'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { ReviewCard } from '@/features/faculty/components/ReviewCard'
import {
  FACULTY_REVIEWS_PAGE_SIZE,
  type FacultyReviewRecord,
} from '@/features/faculty/data/mockFacultyReviews'
import {
  filterFacultyReviews,
  type FacultyReviewFilterValues,
} from '@/features/faculty/utils/filterFacultyReviews'
import { cn } from '@/utils/cn'

const feedControlSurfaceClass =
  'rounded-xl border-0 bg-[#F2F4F6] shadow-none focus:bg-white focus:ring-2 focus:ring-[#EEF2FF]'

const defaultFilters: FacultyReviewFilterValues = {
  search: '',
  rating: 'all',
}

type FacultyReviewsFeedProps = {
  reviews: FacultyReviewRecord[]
  totalReviews: number
  className?: string
}

export function FacultyReviewsFeed({
  reviews,
  totalReviews,
  className,
}: FacultyReviewsFeedProps) {
  const [filters, setFilters] = useState<FacultyReviewFilterValues>(defaultFilters)
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () => filterFacultyReviews(reviews, filters),
    [reviews, filters],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / FACULTY_REVIEWS_PAGE_SIZE))

  const pageReviews = useMemo(() => {
    const start = (page - 1) * FACULTY_REVIEWS_PAGE_SIZE
    return filtered.slice(start, start + FACULTY_REVIEWS_PAGE_SIZE)
  }, [filtered, page])

  const handleFiltersChange = (patch: Partial<FacultyReviewFilterValues>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }

  return (
    <section className={cn('space-y-5', className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#2c1452]">Student Feedback Feed</h2>
          <p className="mt-1 text-sm text-[#454652]">
            {totalReviews} Total Reviews • Showing latest first
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <IconSelect
            icon={ListFilter}
            value={filters.rating}
            onChange={(e) =>
              handleFiltersChange({
                rating: e.target.value as FacultyReviewFilterValues['rating'],
              })
            }
            aria-label="Filter by rating"
            wrapperClassName="w-full sm:w-auto sm:min-w-[11.5rem]"
            className={cn(
              feedControlSurfaceClass,
              'pr-10 font-medium text-[#191C1E]',
            )}
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </IconSelect>
          <SearchInput
            placeholder="Search in reviews..."
            value={filters.search}
            onChange={(e) => handleFiltersChange({ search: e.target.value })}
            wrapperClassName="w-full sm:min-w-[240px] sm:max-w-[320px]"
            className={cn(feedControlSurfaceClass, 'text-[#191C1E] placeholder:text-[#454652]')}
          />
        </div>
      </div>

      <div className="space-y-4">
        {pageReviews.length === 0 ? (
          <p className="rounded-2xl border border-[#E2E8F0]/60 bg-white p-8 text-center text-sm text-[#454652]">
            No reviews match your filters.
          </p>
        ) : (
          pageReviews.map((review) => <ReviewCard key={review.id} review={review} />)
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="flex justify-center pt-2">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : null}
    </section>
  )
}
