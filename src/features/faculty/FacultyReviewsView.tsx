import { Navigate, useParams } from 'react-router-dom'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { FacultyRatingSummaryPanel } from '@/features/faculty/components/FacultyRatingSummaryPanel'
import { FacultyReviewProfileHeader } from '@/features/faculty/components/FacultyReviewProfileHeader'
import { FacultyReviewsFeed } from '@/features/faculty/components/FacultyReviewsFeed'
import { getFacultyById } from '@/features/faculty/data/mockFacultyDetail'
import {
  getFacultyReviewSummary,
  getFacultyReviews,
} from '@/features/faculty/data/mockFacultyReviews'

/** Profile + rating summary column (not full viewport) */
const REVIEWS_SUMMARY_COLUMN_CLASS = 'w-full max-w-[44rem] min-w-0'

export function FacultyReviewsView() {
  const { facultyId } = useParams<{ facultyId: string }>()

  const faculty = facultyId ? getFacultyById(facultyId) : undefined


  if (!faculty || !facultyId) {
    return <Navigate to="/users" replace />
  }

  const facultyProfilePath = `/userdetails/faculty/${facultyId}`
  const summary = getFacultyReviewSummary(facultyId)
  const reviews = getFacultyReviews(facultyId)

  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto pb-8">
      <Breadcrumbs
        items={[
          { label: 'Faculty Directory', to: '/users' },
          { label: faculty.name, to: facultyProfilePath },
          { label: 'Ratings & Reviews' },
        ]}
      />

      <FacultyReviewProfileHeader faculty={faculty} />

      <div className={REVIEWS_SUMMARY_COLUMN_CLASS}>
        <FacultyRatingSummaryPanel summary={summary} />
      </div>

      <FacultyReviewsFeed reviews={reviews} totalReviews={summary.totalReviews} />
    </div>
  )
}
