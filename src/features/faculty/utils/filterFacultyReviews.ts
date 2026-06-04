import type { FacultyReviewRecord } from '@/features/faculty/data/mockFacultyReviews'

export type FacultyReviewFilterValues = {
  search: string
  rating: 'all' | '5' | '4' | '3' | '2' | '1'
}

export function filterFacultyReviews(
  reviews: FacultyReviewRecord[],
  filters: FacultyReviewFilterValues,
): FacultyReviewRecord[] {
  const query = filters.search.trim().toLowerCase()

  return reviews.filter((review) => {
    if (filters.rating !== 'all' && review.rating !== Number(filters.rating)) {
      return false
    }

    if (!query) return true

    return (
      review.studentName.toLowerCase().includes(query) ||
      review.courseLabel.toLowerCase().includes(query) ||
      review.body.toLowerCase().includes(query)
    )
  })
}
