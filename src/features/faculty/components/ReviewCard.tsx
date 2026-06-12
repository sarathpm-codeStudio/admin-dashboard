import { AlertTriangle, CornerUpLeft, FileText, Flag } from 'lucide-react'
import { StarRating } from '@/components/ui/StarRating'
import type { FacultyReviewRecord } from '@/features/faculty/data/mockFacultyReviews'
import { cn } from '@/utils/cn'

type ReviewCardProps = {
  review: FacultyReviewRecord
  className?: string
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  const isAlert = review.lowRatingAlert
  const accentColor = isAlert ? 'red' : review.sideAccent === 'navy' ? 'navy' : null

  return (
    <article
      className={cn(
        'flex overflow-hidden rounded-2xl border border-[#E2E8F0]/60 bg-white shadow-sm',
        className,
      )}
    >
      {accentColor ? (
        <div
          className={cn(
            'w-1.5 shrink-0',
            accentColor === 'red' ? 'bg-[#BA1A1A]' : 'bg-[#2c1452]',
          )}
          aria-hidden
        />
      ) : null}

      <div className="min-w-0 flex-1 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <div
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold',
                review.avatarClassName,
              )}
            >
              {review.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#191c1e]">
                {review.studentName}
              </p>
              <p className="mt-0.5 truncate text-xs text-[#454652]">
                {review.courseLabel} • {review.dateLabel}
              </p>
            </div>
          </div>
          <StarRating
            value={review.rating}
            variant="outline"
            starSizeClass="size-4"
            className="shrink-0 gap-1"
          />
        </div>

        {isAlert ? (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-3 py-1 text-xs font-semibold text-[#BA1A1A]">
            <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
            Low Rating Alert
          </div>
        ) : null}

        <p className="mt-4 text-sm leading-relaxed text-[#454652]">{review.body}</p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4">
          <div className="flex flex-wrap items-center gap-5">
            {review.replyRequired ? (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#EEF2FF] px-3 py-2 text-sm font-semibold text-[#2c1452] transition-colors hover:bg-[#E0E7FF]"
              >
                <CornerUpLeft className="size-4" aria-hidden />
                Reply as Admin (Required)
              </button>
            ) : (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2c1452] transition-colors hover:opacity-80"
              >
                <CornerUpLeft className="size-4" aria-hidden />
                Reply as Admin
              </button>
            )}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#454652] transition-colors hover:text-[#2c1452]"
            >
              <FileText className="size-4" aria-hidden />
              Feature Review
            </button>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#656464] transition-colors hover:text-[#454652]"
          >
            <Flag className="size-3.5" aria-hidden />
            Report / Flag
          </button>
        </div>
      </div>
    </article>
  )
}
